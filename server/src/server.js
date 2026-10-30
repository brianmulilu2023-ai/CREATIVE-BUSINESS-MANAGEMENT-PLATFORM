import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import fs from 'fs';
import { initDatabase, db } from './db.js';
import { signToken, authMiddleware, requireRole } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Uploads setup
const UPLOADS_DIR = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${basename}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } });

// ==========================================
// 1. AUTHENTICATION & USERS
// ==========================================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'designer', company = '', phone = '', bio = '' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = db.findOne('users', (u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      id: `usr_${uuidv4().slice(0, 8)}`,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role === 'client' ? 'client' : 'designer',
      company,
      phone,
      bio,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=2563eb,0f172a,38bdf8`,
      createdAt: new Date().toISOString()
    };

    db.insert('users', newUser);

    // If registered as client, automatically link to client database if designer exists
    if (newUser.role === 'client') {
      const existingClient = db.findOne('clients', (c) => c.email.toLowerCase() === email.toLowerCase());
      if (!existingClient) {
        db.insert('clients', {
          id: `cli_${uuidv4().slice(0, 8)}`,
          designerId: 'usr_designer_1',
          name,
          company: company || name,
          email: email.toLowerCase(),
          phone,
          address: 'Nairobi, Kenya',
          notes: 'Self-registered client via portal',
          tags: ['New Client'],
          totalSpent: 0,
          createdAt: new Date().toISOString()
        });
      }
    }

    const token = signToken(newUser);
    const { passwordHash: _, ...userSafe } = newUser;
    return res.status(201).json({ token, user: userSafe });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both email and password' });
    }

    const user = db.findOne('users', (u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(user);
    const { passwordHash: _, ...userSafe } = user;
    return res.json({ token, user: userSafe });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login' });
  }
});

// Forgot Password
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = db.findOne('users', (u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'No account found with this email address' });
  }

  // Simulated secure reset token
  const resetToken = `rst_${uuidv4()}`;
  db.update('users', user.id, { resetToken, resetTokenExpires: Date.now() + 3600000 });

  return res.json({
    message: 'Password reset link sent successfully to your email.',
    previewResetToken: resetToken
  });
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  const { resetToken, newPassword } = req.body;
  if (!resetToken || !newPassword) {
    return res.status(400).json({ error: 'Reset token and new password are required' });
  }

  const user = db.findOne('users', (u) => u.resetToken === resetToken);
  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired reset token' });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPassword, salt);
  db.update('users', user.id, { passwordHash, resetToken: null, resetTokenExpires: null });

  return res.json({ message: 'Password has been updated successfully. Please log in.' });
});

// Current User Profile
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = db.findById('users', req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { passwordHash: _, ...userSafe } = user;
  res.json({ user: userSafe });
});

// Update Profile
app.put('/api/auth/profile', authMiddleware, (req, res) => {
  const { name, company, phone, bio, avatar } = req.body;
  const updated = db.update('users', req.user.id, {
    ...(name && { name }),
    ...(company !== undefined && { company }),
    ...(phone !== undefined && { phone }),
    ...(bio !== undefined && { bio }),
    ...(avatar && { avatar })
  });
  const { passwordHash: _, ...userSafe } = updated;
  res.json({ user: userSafe });
});

// ==========================================
// 2. CLIENT MANAGEMENT
// ==========================================

// Get all clients
app.get('/api/clients', authMiddleware, (req, res) => {
  const { search, tag } = req.query;
  let clients = db.get('clients');

  if (search) {
    const q = search.toLowerCase();
    clients = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }

  if (tag && tag !== 'all') {
    clients = clients.filter((c) => c.tags && c.tags.includes(tag));
  }

  res.json(clients);
});

// Create client
app.post('/api/clients', authMiddleware, (req, res) => {
  const { name, company, email, phone, address, notes, tags } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Client name and email are required' });
  }

  const newClient = {
    id: `cli_${uuidv4().slice(0, 8)}`,
    designerId: req.user.id,
    name,
    company: company || name,
    email: email.toLowerCase(),
    phone: phone || '',
    address: address || '',
    notes: notes || '',
    tags: Array.isArray(tags) ? tags : ['Active'],
    totalSpent: 0,
    createdAt: new Date().toISOString()
  };

  db.insert('clients', newClient);
  res.status(201).json(newClient);
});

// Update client
app.put('/api/clients/:id', authMiddleware, (req, res) => {
  const client = db.findById('clients', req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  const updated = db.update('clients', req.params.id, req.body);
  res.json(updated);
});

// Delete client
app.delete('/api/clients/:id', authMiddleware, (req, res) => {
  const client = db.findById('clients', req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  db.delete('clients', req.params.id);
  res.json({ message: 'Client deleted successfully' });
});

// Get single client with linked projects, requests and invoices
app.get('/api/clients/:id', authMiddleware, (req, res) => {
  const client = db.findById('clients', req.params.id);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  const projects = db.find('projects', (p) => p.clientId === client.id);
  const invoices = db.find('invoices', (i) => i.clientId === client.id);
  const requests = db.find('designRequests', (r) => r.clientId === client.id);
  const payments = db.find('payments', (p) => p.clientId === client.id);

  res.json({
    client,
    projects,
    invoices,
    requests,
    payments
  });
});

// ==========================================
// 3. DESIGN REQUESTS
// ==========================================

// Get design requests
app.get('/api/requests', authMiddleware, (req, res) => {
  let requests = db.get('designRequests');

  // If client role, filter only their requests
  if (req.user.role === 'client') {
    requests = requests.filter(
      (r) => r.clientEmail?.toLowerCase() === req.user.email?.toLowerCase() || r.clientId === req.user.id
    );
  }

  const { status, category } = req.query;
  if (status && status !== 'all') {
    requests = requests.filter((r) => r.status === status);
  }
  if (category && category !== 'all') {
    requests = requests.filter((r) => r.category.toLowerCase() === category.toLowerCase());
  }

  res.json(requests);
});

// Submit a new design request (Clients or Designer on behalf of client)
app.post('/api/requests', authMiddleware, (req, res) => {
  const {
    title,
    category,
    description,
    referenceImages = [],
    preferredColors = [],
    dimensions = '',
    deadline,
    budget,
    additionalInstructions = '',
    clientId,
    clientName,
    clientEmail
  } = req.body;

  if (!title || !category || !description) {
    return res.status(400).json({ error: 'Title, category, and description are required' });
  }

  // Generate unique request ID: REQ-2026-XXX
  const count = db.get('designRequests').length + 1;
  const requestId = `REQ-2026-${String(count).padStart(3, '0')}`;

  const finalClientName = req.user.role === 'client' ? req.user.name : (clientName || req.user.name);
  const finalClientEmail = req.user.role === 'client' ? req.user.email : (clientEmail || req.user.email);
  const finalClientId = clientId || (req.user.role === 'client' ? req.user.id : 'cli_1');

  const newRequest = {
    id: `req_${uuidv4().slice(0, 8)}`,
    requestId,
    clientId: finalClientId,
    clientName: finalClientName,
    clientEmail: finalClientEmail,
    title,
    category,
    description,
    referenceImages: Array.isArray(referenceImages) ? referenceImages : [],
    preferredColors: Array.isArray(preferredColors) ? preferredColors : [],
    dimensions,
    deadline: deadline || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    budget: Number(budget) || 0,
    currency: 'KES',
    additionalInstructions,
    status: 'pending',
    convertedProjectId: null,
    createdAt: new Date().toISOString()
  };

  db.insert('designRequests', newRequest);

  // Notify designer
  db.insert('notifications', {
    id: `notif_${uuidv4().slice(0, 8)}`,
    userId: 'usr_designer_1',
    role: 'designer',
    title: 'New Design Request Submitted',
    message: `${finalClientName} submitted a request: "${title}" (${requestId})`,
    type: 'request',
    link: '/requests',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  res.status(201).json(newRequest);
});

// Update request status (accept, decline)
app.put('/api/requests/:id', authMiddleware, (req, res) => {
  const request = db.findById('designRequests', req.params.id);
  if (!request) return res.status(404).json({ error: 'Design request not found' });

  const updated = db.update('designRequests', req.params.id, req.body);
  res.json(updated);
});

// Convert request directly to an active Project
app.post('/api/requests/:id/convert', authMiddleware, (req, res) => {
  const request = db.findById('designRequests', req.params.id);
  if (!request) return res.status(404).json({ error: 'Design request not found' });

  // Create Project
  const newProject = {
    id: `prj_${uuidv4().slice(0, 8)}`,
    name: request.title,
    clientId: request.clientId,
    clientName: request.clientName,
    designerId: req.user.id,
    description: request.description,
    agreedPrice: request.budget || 20000,
    currency: 'KES',
    startDate: new Date().toISOString().split('T')[0],
    deadline: request.deadline,
    progress: 10,
    status: 'in_progress',
    requestId: request.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.insert('projects', newProject);

  // Update request status
  db.update('designRequests', request.id, {
    status: 'accepted',
    convertedProjectId: newProject.id
  });

  // Automatically generate Quotation/Deposit Invoice (50% deposit)
  const deposit = Math.round(newProject.agreedPrice * 0.5);
  const invoiceCount = db.get('invoices').length + 1;
  const newInvoice = {
    id: `inv_${uuidv4().slice(0, 8)}`,
    invoiceNumber: `INV-2026-${String(invoiceCount).padStart(3, '0')}`,
    projectId: newProject.id,
    projectName: newProject.name,
    clientId: newProject.clientId,
    clientName: newProject.clientName,
    designerId: req.user.id,
    totalAmount: newProject.agreedPrice,
    depositAmount: deposit,
    balanceAmount: newProject.agreedPrice - deposit,
    currency: 'KES',
    dueDate: newProject.deadline,
    status: 'unpaid',
    items: [
      {
        description: `${request.category} - ${request.title}`,
        quantity: 1,
        unitPrice: newProject.agreedPrice,
        amount: newProject.agreedPrice
      }
    ],
    createdAt: new Date().toISOString()
  };
  db.insert('invoices', newInvoice);

  // Notify client
  db.insert('notifications', {
    id: `notif_${uuidv4().slice(0, 8)}`,
    userId: request.clientId,
    role: 'client',
    title: 'Your Design Request Was Accepted!',
    message: `Project "${newProject.name}" has been started by your designer.`,
    type: 'project',
    link: '/portal/projects',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  res.json({ project: newProject, invoice: newInvoice });
});

// ==========================================
// 4. PROJECT MANAGEMENT & KANBAN
// ==========================================

// Get projects
app.get('/api/projects', authMiddleware, (req, res) => {
  let projects = db.get('projects');

  // If client, return only client's projects
  if (req.user.role === 'client') {
    projects = projects.filter(
      (p) => p.clientId === req.user.id || p.clientName?.toLowerCase().includes(req.user.name.toLowerCase())
    );
  }

  const { status, search } = req.query;
  if (status && status !== 'all') {
    projects = projects.filter((p) => p.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    projects = projects.filter(
      (p) => p.name.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q)
    );
  }

  res.json(projects);
});

// Create project manually
app.post('/api/projects', authMiddleware, (req, res) => {
  const { name, clientId, clientName, description, agreedPrice, startDate, deadline, progress, status } = req.body;
  if (!name || !clientName) {
    return res.status(400).json({ error: 'Project name and client are required' });
  }

  const newProject = {
    id: `prj_${uuidv4().slice(0, 8)}`,
    name,
    clientId: clientId || 'cli_1',
    clientName,
    designerId: req.user.id,
    description: description || '',
    agreedPrice: Number(agreedPrice) || 0,
    currency: 'KES',
    startDate: startDate || new Date().toISOString().split('T')[0],
    deadline: deadline || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    progress: Number(progress) || 0,
    status: status || 'pending',
    requestId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.insert('projects', newProject);

  // Notify client
  db.insert('notifications', {
    id: `notif_${uuidv4().slice(0, 8)}`,
    userId: newProject.clientId,
    role: 'client',
    title: 'New Project Created',
    message: `A new project "${newProject.name}" has been created for your account.`,
    type: 'project',
    link: '/portal/projects',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  res.status(201).json(newProject);
});

// Update project (including Kanban status drag/drop, progress update)
app.put('/api/projects/:id', authMiddleware, (req, res) => {
  const project = db.findById('projects', req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const updated = db.update('projects', req.params.id, req.body);

  // If status changed to completed, notify client
  if (req.body.status && req.body.status !== project.status) {
    db.insert('notifications', {
      id: `notif_${uuidv4().slice(0, 8)}`,
      userId: project.clientId,
      role: 'client',
      title: `Project Status Update: ${project.name}`,
      message: `Project status moved to "${req.body.status.replace(/_/g, ' ')}"`,
      type: 'project',
      link: '/portal/projects',
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  res.json(updated);
});

// Delete project
app.delete('/api/projects/:id', authMiddleware, (req, res) => {
  const project = db.findById('projects', req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  db.delete('projects', req.params.id);
  res.json({ message: 'Project removed successfully' });
});

// Single project detail
app.get('/api/projects/:id', authMiddleware, (req, res) => {
  const project = db.findById('projects', req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const artworks = db.find('artworkFiles', (a) => a.projectId === project.id);
  const revisions = db.find('revisions', (r) => r.projectId === project.id);
  const invoices = db.find('invoices', (i) => i.projectId === project.id);

  res.json({ project, artworks, revisions, invoices });
});

// ==========================================
// 5. ARTWORK DELIVERY & REVISION SYSTEM
// ==========================================

// Get artworks for a project or all
app.get('/api/artworks', authMiddleware, (req, res) => {
  const { projectId } = req.query;
  let artworks = db.get('artworkFiles');

  if (projectId) {
    artworks = artworks.filter((a) => a.projectId === projectId);
  }

  // Sort descending by uploadedAt so newest version is first
  artworks.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  res.json(artworks);
});

// Upload Artwork (File or URL preview)
app.post('/api/artworks', authMiddleware, upload.single('file'), (req, res) => {
  const { projectId, title, notes, version, fileUrl: inputUrl } = req.body;
  if (!projectId || !title) {
    return res.status(400).json({ error: 'Project ID and artwork title are required' });
  }

  const project = db.findById('projects', projectId);
  if (!project) return res.status(404).json({ error: 'Associated project not found' });

  // Calculate next version automatically if not specified
  const existingArtworks = db.find('artworkFiles', (a) => a.projectId === projectId);
  const nextVerNumber = existingArtworks.length + 1;
  const finalVersion = version || `v${nextVerNumber}.0`;

  let finalUrl = inputUrl;
  let fileType = 'image/jpeg';
  let fileSize = '3.5 MB';

  if (req.file) {
    finalUrl = `/uploads/${req.file.filename}`;
    fileType = req.file.mimetype;
    fileSize = `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`;
  } else if (!finalUrl) {
    // Default high-grade creative graphic placeholder
    finalUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';
  }

  const newArtwork = {
    id: `art_${uuidv4().slice(0, 8)}`,
    projectId,
    projectName: project.name,
    version: finalVersion,
    title,
    fileUrl: finalUrl,
    fileType,
    fileSize,
    notes: notes || '',
    uploadedBy: req.user.name,
    uploadedAt: new Date().toISOString(),
    status: 'pending_review'
  };

  db.insert('artworkFiles', newArtwork);

  // Update project status to under_review
  db.update('projects', projectId, { status: 'under_review' });

  // Notify client
  db.insert('notifications', {
    id: `notif_${uuidv4().slice(0, 8)}`,
    userId: project.clientId,
    role: 'client',
    title: 'New Artwork Uploaded for Review',
    message: `${req.user.name} uploaded ${finalVersion}: "${title}". Please preview and approve or request revisions.`,
    type: 'artwork',
    link: '/portal/artwork',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  res.status(201).json(newArtwork);
});

// Update Artwork Status (Approve or Request Revision)
app.put('/api/artworks/:id/status', authMiddleware, (req, res) => {
  const { status, revisionComment, annotatedAreas } = req.body;
  const artwork = db.findById('artworkFiles', req.params.id);
  if (!artwork) return res.status(404).json({ error: 'Artwork file not found' });

  const project = db.findById('projects', artwork.projectId);

  if (status === 'approved') {
    db.update('artworkFiles', artwork.id, { status: 'approved' });
    if (project) {
      db.update('projects', project.id, { status: 'completed', progress: 100 });
    }

    // Notify designer
    db.insert('notifications', {
      id: `notif_${uuidv4().slice(0, 8)}`,
      userId: project ? project.designerId : 'usr_designer_1',
      role: 'designer',
      title: 'Artwork Approved by Client! 🎉',
      message: `${req.user.name} approved the final design for "${artwork.title}" (${artwork.version}).`,
      type: 'approval',
      link: '/projects',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return res.json({ message: 'Artwork approved successfully', artwork });
  }

  if (status === 'revision_requested') {
    db.update('artworkFiles', artwork.id, { status: 'revision_requested' });
    if (project) {
      db.update('projects', project.id, { status: 'revision_required' });
    }

    // Record revision
    const newRevision = {
      id: `rev_${uuidv4().slice(0, 8)}`,
      projectId: artwork.projectId,
      artworkId: artwork.id,
      version: artwork.version,
      requestedBy: req.user.name,
      comment: revisionComment || 'Please adjust according to feedback.',
      annotatedAreas: annotatedAreas || [],
      requestedAt: new Date().toISOString(),
      status: 'open'
    };
    db.insert('revisions', newRevision);

    // Notify designer
    db.insert('notifications', {
      id: `notif_${uuidv4().slice(0, 8)}`,
      userId: project ? project.designerId : 'usr_designer_1',
      role: 'designer',
      title: `Revision Requested on ${artwork.version}`,
      message: `${req.user.name} requested changes: "${revisionComment?.slice(0, 100)}..."`,
      type: 'revision',
      link: '/artwork',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return res.json({ message: 'Revision feedback submitted', revision: newRevision });
  }

  res.status(400).json({ error: 'Invalid status' });
});

// Get revisions
app.get('/api/revisions', authMiddleware, (req, res) => {
  const { projectId, artworkId } = req.query;
  let revisions = db.get('revisions');

  if (projectId) revisions = revisions.filter((r) => r.projectId === projectId);
  if (artworkId) revisions = revisions.filter((r) => r.artworkId === artworkId);

  res.json(revisions);
});

// ==========================================
// 6. FINANCIAL MANAGEMENT & KES INVOICES
// ==========================================

// Get invoices
app.get('/api/invoices', authMiddleware, (req, res) => {
  let invoices = db.get('invoices');

  if (req.user.role === 'client') {
    invoices = invoices.filter(
      (i) => i.clientId === req.user.id || i.clientName?.toLowerCase().includes(req.user.name.toLowerCase())
    );
  }

  const { status } = req.query;
  if (status && status !== 'all') {
    invoices = invoices.filter((i) => i.status === status);
  }

  res.json(invoices);
});

// Create Invoice
app.post('/api/invoices', authMiddleware, (req, res) => {
  const { projectId, clientId, totalAmount, depositAmount, dueDate, items } = req.body;
  if (!totalAmount || !items || !items.length) {
    return res.status(400).json({ error: 'Total amount and invoice line items are required' });
  }

  const project = projectId ? db.findById('projects', projectId) : null;
  const client = clientId ? db.findById('clients', clientId) : null;

  const count = db.get('invoices').length + 1;
  const invoiceNumber = `INV-2026-${String(count).padStart(3, '0')}`;

  const numTotal = Number(totalAmount);
  const numDeposit = Number(depositAmount) || 0;
  const balance = numTotal - numDeposit;

  const newInvoice = {
    id: `inv_${uuidv4().slice(0, 8)}`,
    invoiceNumber,
    projectId: projectId || null,
    projectName: project ? project.name : 'Creative Services',
    clientId: clientId || (project ? project.clientId : 'cli_1'),
    clientName: client ? client.name : (project ? project.clientName : 'Client'),
    designerId: req.user.id,
    totalAmount: numTotal,
    depositAmount: numDeposit,
    balanceAmount: balance,
    currency: 'KES',
    dueDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    status: numDeposit > 0 ? 'deposit_paid' : 'unpaid',
    items,
    createdAt: new Date().toISOString()
  };

  db.insert('invoices', newInvoice);

  // Notify client
  db.insert('notifications', {
    id: `notif_${uuidv4().slice(0, 8)}`,
    userId: newInvoice.clientId,
    role: 'client',
    title: 'New Invoice Issued',
    message: `Invoice ${invoiceNumber} for KSh ${numTotal.toLocaleString()} has been generated.`,
    type: 'payment',
    link: '/portal/financials',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  res.status(201).json(newInvoice);
});

// Get payments
app.get('/api/payments', authMiddleware, (req, res) => {
  let payments = db.get('payments');

  if (req.user.role === 'client') {
    payments = payments.filter((p) => p.clientId === req.user.id);
  }

  res.json(payments);
});

// Record Payment (M-Pesa STK push simulation or Manual bank transfer)
app.post('/api/payments', authMiddleware, (req, res) => {
  const { invoiceId, amount, method = 'mpesa', transactionRef, paymentType = 'partial', phone } = req.body;
  if (!invoiceId || !amount) {
    return res.status(400).json({ error: 'Invoice ID and payment amount are required' });
  }

  const invoice = db.findById('invoices', invoiceId);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

  const payAmount = Number(amount);
  const newBalance = Math.max(0, invoice.balanceAmount - payAmount);
  let newStatus = invoice.status;

  if (newBalance === 0) {
    newStatus = 'paid';
  } else if (invoice.status === 'unpaid' && payAmount > 0) {
    newStatus = 'deposit_paid';
  }

  // Update invoice balance and status
  db.update('invoices', invoice.id, {
    balanceAmount: newBalance,
    status: newStatus
  });

  // Generate realistic transaction ref if not provided
  const randomRef = `QK${Math.floor(10000000 + Math.random() * 90000000)}KES`;
  const finalRef = transactionRef || randomRef;

  const paymentRecord = {
    id: `pay_${uuidv4().slice(0, 8)}`,
    invoiceId: invoice.id,
    projectId: invoice.projectId,
    clientId: invoice.clientId,
    clientName: invoice.clientName,
    amount: payAmount,
    currency: 'KES',
    method,
    transactionRef: finalRef,
    paymentType,
    status: 'completed',
    paidAt: new Date().toISOString(),
    notes: method === 'mpesa' ? `M-Pesa transaction confirmed for ${phone || 'Client mobile'}` : 'Bank transfer verified'
  };

  db.insert('payments', paymentRecord);

  // Notify designer
  db.insert('notifications', {
    id: `notif_${uuidv4().slice(0, 8)}`,
    userId: invoice.designerId || 'usr_designer_1',
    role: 'designer',
    title: `Payment Received: KSh ${payAmount.toLocaleString()}`,
    message: `${invoice.clientName} made a payment of KSh ${payAmount.toLocaleString()} (${method.toUpperCase()} Ref: ${finalRef})`,
    type: 'payment',
    link: '/financials',
    isRead: false,
    createdAt: new Date().toISOString()
  });

  res.status(201).json({ payment: paymentRecord, updatedInvoice: db.findById('invoices', invoice.id) });
});

// ==========================================
// 7. NOTIFICATIONS
// ==========================================

// Get notifications
app.get('/api/notifications', authMiddleware, (req, res) => {
  let notifs = db.get('notifications');

  // Filter for role or specific user
  notifs = notifs.filter((n) => n.userId === req.user.id || n.role === req.user.role);
  notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(notifs);
});

// Mark as read
app.put('/api/notifications/:id/read', authMiddleware, (req, res) => {
  const updated = db.update('notifications', req.params.id, { isRead: true });
  res.json(updated);
});

// Mark all as read
app.put('/api/notifications/read-all', authMiddleware, (req, res) => {
  const notifs = db.get('notifications');
  notifs.forEach((n) => {
    if (n.userId === req.user.id || n.role === req.user.role) {
      db.update('notifications', n.id, { isRead: true });
    }
  });
  res.json({ message: 'All notifications marked as read' });
});

// ==========================================
// 8. DASHBOARD METRICS & REVENUE ANALYTICS
// ==========================================

// Designer Dashboard Stats
app.get('/api/dashboard/stats', authMiddleware, (req, res) => {
  const clients = db.get('clients');
  const projects = db.get('projects');
  const requests = db.get('designRequests');
  const invoices = db.get('invoices');
  const payments = db.get('payments');

  const totalClients = clients.length;
  const activeProjects = projects.filter((p) => p.status !== 'completed').length;
  const pendingRequests = requests.filter((r) => r.status === 'pending').length;
  const completedProjects = projects.filter((p) => p.status === 'completed').length;

  // Monthly revenue in KES (sum of payments)
  const totalRevenue = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const outstandingPayments = invoices.reduce((sum, i) => sum + (Number(i.balanceAmount) || 0), 0);

  // Revenue chart data (6 months)
  const revenueChart = [
    { month: 'Jun', revenue: 65000, projects: 3 },
    { month: 'Jul', revenue: 95000, projects: 5 },
    { month: 'Aug', revenue: 120000, projects: 6 },
    { month: 'Sep', revenue: 85000, projects: 4 },
    { month: 'Oct', revenue: 140000, projects: 7 },
    { month: 'Nov', revenue: totalRevenue > 140000 ? totalRevenue : 165000, projects: 8 }
  ];

  // Project performance by status
  const projectDistribution = [
    { name: 'Pending', count: projects.filter((p) => p.status === 'pending').length, color: '#F59E0B' },
    { name: 'In Progress', count: projects.filter((p) => p.status === 'in_progress').length, color: '#2563EB' },
    { name: 'Under Review', count: projects.filter((p) => p.status === 'under_review').length, color: '#8B5CF6' },
    { name: 'Revision', count: projects.filter((p) => p.status === 'revision_required').length, color: '#EF4444' },
    { name: 'Completed', count: completedProjects, color: '#16A34A' }
  ];

  // Upcoming deadlines (next 30 days)
  const upcomingDeadlines = projects
    .filter((p) => p.status !== 'completed')
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  // Recent client requests
  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  // Recent activity feed
  const recentActivities = [
    { id: 'act_1', time: '10 mins ago', text: 'Dr. Amina Hassan reviewed Zahra Swahili Coast Menu Proof' },
    { id: 'act_2', time: '2 hours ago', text: 'New M-Pesa deposit received (Ref: QKH718299A)' },
    { id: 'act_3', time: 'Yesterday', text: 'Packaging artwork v2.0 uploaded for Savannah Coffee' },
    { id: 'act_4', time: '2 days ago', text: 'Apex Fleet Graphic Wraps moved to In Progress' }
  ];

  res.json({
    metrics: {
      totalClients,
      activeProjects,
      pendingRequests,
      completedProjects,
      monthlyRevenue: totalRevenue,
      outstandingPayments
    },
    revenueChart,
    projectDistribution,
    upcomingDeadlines,
    recentRequests,
    recentActivities
  });
});

// Client Portal Stats
app.get('/api/portal/stats', authMiddleware, (req, res) => {
  const clientProjects = db.find('projects', (p) => p.clientId === req.user.id || p.clientName?.includes(req.user.name));
  const clientRequests = db.find('designRequests', (r) => r.clientEmail === req.user.email || r.clientId === req.user.id);
  const clientInvoices = db.find('invoices', (i) => i.clientId === req.user.id || i.clientName?.includes(req.user.name));
  const clientArtworks = db.find('artworkFiles', (a) => clientProjects.some((p) => p.id === a.projectId));

  const pendingReviews = clientArtworks.filter((a) => a.status === 'pending_review').length;
  const unpaidInvoices = clientInvoices.filter((i) => i.status !== 'paid').length;
  const activeCount = clientProjects.filter((p) => p.status !== 'completed').length;

  res.json({
    activeProjects: activeCount,
    pendingRequests: clientRequests.filter((r) => r.status === 'pending').length,
    pendingReviews,
    unpaidInvoices,
    projects: clientProjects,
    recentArtworks: clientArtworks.slice(0, 4),
    invoices: clientInvoices
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', product: 'CreativeDesk', version: '1.0.0', time: new Date().toISOString() });
});

// Start Server
async function start() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`CreativeDesk API server running on http://localhost:${PORT}`);
  });
}

start();
