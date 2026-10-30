import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache synced to JSON files
const collections = {
  users: [],
  clients: [],
  designRequests: [],
  projects: [],
  artworkFiles: [],
  revisions: [],
  invoices: [],
  payments: [],
  notifications: []
};

function getFilePath(colName) {
  return path.join(DATA_DIR, `${colName}.json`);
}

function loadCollection(colName) {
  const filePath = getFilePath(colName);
  if (fs.existsSync(filePath)) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      collections[colName] = JSON.parse(data);
    } catch (err) {
      console.error(`Error loading collection ${colName}:`, err.message);
      collections[colName] = [];
    }
  } else {
    collections[colName] = [];
  }
}

function saveCollection(colName) {
  const filePath = getFilePath(colName);
  try {
    fs.writeFileSync(filePath, JSON.stringify(collections[colName], null, 2), 'utf8');
  } catch (err) {
    console.error(`Error saving collection ${colName}:`, err.message);
  }
}

// Initialize and seed default data if empty
export async function initDatabase() {
  // Load existing data
  Object.keys(collections).forEach(loadCollection);

  // If no users, seed realistic data
  if (collections.users.length === 0) {
    console.log('Seeding initial data for CreativeDesk...');
    const salt = await bcrypt.genSalt(10);
    const designerPasswordHash = await bcrypt.hash('designer123', salt);
    const clientPasswordHash = await bcrypt.hash('client123', salt);

    // Default users
    const designerUser = {
      id: 'usr_designer_1',
      name: 'Alex Kamau',
      email: 'designer@creativedesk.io',
      passwordHash: designerPasswordHash,
      role: 'designer',
      company: 'Studio Pixel Africa',
      phone: '+254 712 345 678',
      bio: 'Award-winning creative director & senior brand identity designer based in Nairobi, Kenya.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      createdAt: '2026-01-10T08:00:00.000Z'
    };

    const clientUser = {
      id: 'usr_client_1',
      name: 'Wanjiku Mwangi',
      email: 'client@savannahcoffee.co.ke',
      passwordHash: clientPasswordHash,
      role: 'client',
      company: 'Savannah Premium Coffee Roasters',
      phone: '+254 722 987 654',
      bio: 'Marketing lead at Savannah Coffee.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      createdAt: '2026-01-12T10:00:00.000Z'
    };

    collections.users = [designerUser, clientUser];
    saveCollection('users');

    // Default clients for designer
    collections.clients = [
      {
        id: 'cli_1',
        designerId: designerUser.id,
        name: 'Wanjiku Mwangi',
        company: 'Savannah Premium Coffee Roasters',
        email: 'client@savannahcoffee.co.ke',
        phone: '+254 722 987 654',
        address: 'Westlands Commercial Center, Nairobi',
        notes: 'Premium specialty coffee brand looking for eco-luxury packaging and rebrand.',
        tags: ['Retail', 'Beverage', 'Packaging', 'VIP'],
        totalSpent: 45000,
        createdAt: '2026-01-15T09:30:00.000Z'
      },
      {
        id: 'cli_2',
        designerId: designerUser.id,
        name: 'Brian Omondi',
        company: 'Apex Logistics & Freight Kenya',
        email: 'brian@apexlogistics.co.ke',
        phone: '+254 733 112 233',
        address: 'Mombasa Road Business Park, Nairobi',
        notes: 'Fleet vehicle branding, safety brochures, company profile.',
        tags: ['Logistics', 'Corporate', 'Print'],
        totalSpent: 75000,
        createdAt: '2026-01-18T14:15:00.000Z'
      },
      {
        id: 'cli_3',
        designerId: designerUser.id,
        name: 'Dr. Amina Hassan',
        company: 'Zahra Eco Sanctuary & Lodge',
        email: 'amina@zahralodge.com',
        phone: '+254 720 554 433',
        address: 'Diani Beach, Kwale County',
        notes: 'Hospitality resort branding, menus, digital marketing campaign assets.',
        tags: ['Hospitality', 'Eco-Tourism', 'Digital'],
        totalSpent: 120000,
        createdAt: '2026-02-01T11:00:00.000Z'
      },
      {
        id: 'cli_4',
        designerId: designerUser.id,
        name: 'Kevin Kiprono',
        company: 'Kiprono Agro Tech Hub',
        email: 'kevin@kipronotech.org',
        phone: '+254 711 889 900',
        address: 'Eldoret Innovation Center',
        notes: 'Farmer-facing mobile UI assets, pitch deck, annual impact report.',
        tags: ['AgriTech', 'Tech', 'Impact'],
        totalSpent: 30000,
        createdAt: '2026-02-14T16:20:00.000Z'
      }
    ];
    saveCollection('clients');

    // Default design requests
    collections.designRequests = [
      {
        id: 'req_1',
        requestId: 'REQ-2026-001',
        clientId: 'cli_1',
        clientName: 'Wanjiku Mwangi (Savannah Coffee)',
        clientEmail: 'client@savannahcoffee.co.ke',
        title: 'Single-Origin Mount Kenya Coffee Bag Packaging',
        category: 'Branding',
        description: 'We need full packaging artwork for our new single-origin 250g and 500g coffee bags. Needs gold foil accents, recycled craft texture, and custom topographic illustration of Mt. Kenya.',
        referenceImages: [
          'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80'
        ],
        preferredColors: ['#1C1917', '#D97706', '#F59E0B', '#FDFBF7'],
        dimensions: '180mm x 260mm x 80mm pouch with degassing valve',
        deadline: '2026-11-20',
        budget: 45000,
        currency: 'KES',
        additionalInstructions: 'CMYK print-ready PDF with dieline layer and emboss mask. Deliver vectors in AI and PDF.',
        status: 'accepted',
        convertedProjectId: 'prj_1',
        createdAt: '2026-10-15T09:00:00.000Z'
      },
      {
        id: 'req_2',
        requestId: 'REQ-2026-002',
        clientId: 'cli_2',
        clientName: 'Brian Omondi (Apex Logistics)',
        clientEmail: 'brian@apexlogistics.co.ke',
        title: 'Corporate Sustainability & Fleet Safety Brochure',
        category: 'Brochures',
        description: '12-page landscape brochure highlighting our hybrid fleet, eco emissions pledge, and safety records for enterprise clients.',
        referenceImages: [
          'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'
        ],
        preferredColors: ['#1E3A8A', '#0284C7', '#10B981'],
        dimensions: 'A4 Landscape (297 x 210 mm)',
        deadline: '2026-11-15',
        budget: 35000,
        currency: 'KES',
        additionalInstructions: 'Include infographics for our regional carbon metrics and route map.',
        status: 'pending',
        convertedProjectId: null,
        createdAt: '2026-10-25T11:20:00.000Z'
      },
      {
        id: 'req_3',
        requestId: 'REQ-2026-003',
        clientId: 'cli_3',
        clientName: 'Dr. Amina Hassan (Zahra Lodge)',
        clientEmail: 'amina@zahralodge.com',
        title: 'Diani Oceanfront Swahili Fusion Restaurant Menu',
        category: 'Posters and flyers',
        description: 'Waterproof tri-fold restaurant and cocktail lounge menu with Swahili geometric motifs and coastal culinary photography.',
        referenceImages: [
          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
        ],
        preferredColors: ['#042F2E', '#D97706', '#FEF3C7'],
        dimensions: 'A3 Folded to 140mm x 297mm',
        deadline: '2026-11-05',
        budget: 28000,
        currency: 'KES',
        additionalInstructions: 'Need separate insert card for daily catch specials.',
        status: 'accepted',
        convertedProjectId: 'prj_3',
        createdAt: '2026-10-18T14:45:00.000Z'
      }
    ];
    saveCollection('designRequests');

    // Default projects
    collections.projects = [
      {
        id: 'prj_1',
        name: 'Savannah Single-Origin Coffee Packaging',
        clientId: 'cli_1',
        clientName: 'Wanjiku Mwangi (Savannah Coffee)',
        designerId: designerUser.id,
        description: 'Complete packaging design with gold foil and topographic illustrations.',
        agreedPrice: 45000,
        currency: 'KES',
        startDate: '2026-10-16',
        deadline: '2026-11-20',
        progress: 80,
        status: 'under_review',
        requestId: 'req_1',
        createdAt: '2026-10-16T10:00:00.000Z',
        updatedAt: '2026-10-28T16:00:00.000Z'
      },
      {
        id: 'prj_2',
        name: 'Apex Fleet Graphic Wraps & Vehicle Decals',
        clientId: 'cli_2',
        clientName: 'Brian Omondi (Apex Logistics)',
        designerId: designerUser.id,
        description: 'Van and heavy truck vinyl livery kit with reflective hazard striping.',
        agreedPrice: 60000,
        currency: 'KES',
        startDate: '2026-10-10',
        deadline: '2026-11-10',
        progress: 60,
        status: 'in_progress',
        requestId: null,
        createdAt: '2026-10-10T09:00:00.000Z',
        updatedAt: '2026-10-27T12:00:00.000Z'
      },
      {
        id: 'prj_3',
        name: 'Zahra Lodge Swahili Oceanfront Menu',
        clientId: 'cli_3',
        clientName: 'Dr. Amina Hassan (Zahra Lodge)',
        designerId: designerUser.id,
        description: 'Cocktail and dining tri-fold menu with coastal Swahili patterns.',
        agreedPrice: 28000,
        currency: 'KES',
        startDate: '2026-10-19',
        deadline: '2026-11-05',
        progress: 90,
        status: 'revision_required',
        requestId: 'req_3',
        createdAt: '2026-10-19T11:00:00.000Z',
        updatedAt: '2026-10-29T15:30:00.000Z'
      },
      {
        id: 'prj_4',
        name: 'Kiprono AgriTech Mobile App UI Brand Guide',
        clientId: 'cli_4',
        clientName: 'Kevin Kiprono (Kiprono Agro Tech)',
        designerId: designerUser.id,
        description: 'Figma design tokens, icon set, and color accessibility guidelines.',
        agreedPrice: 50000,
        currency: 'KES',
        startDate: '2026-09-01',
        deadline: '2026-10-10',
        progress: 100,
        status: 'completed',
        requestId: null,
        createdAt: '2026-09-01T08:00:00.000Z',
        updatedAt: '2026-10-10T17:00:00.000Z'
      },
      {
        id: 'prj_5',
        name: 'Nairobi Tech Summit Keynote Motion Graphics',
        clientId: 'cli_2',
        clientName: 'Brian Omondi (Apex Logistics)',
        designerId: designerUser.id,
        description: 'Opening 45-second 4K 60fps kinetic typography teaser for sponsor hall.',
        agreedPrice: 40000,
        currency: 'KES',
        startDate: '2026-10-28',
        deadline: '2026-11-25',
        progress: 20,
        status: 'pending',
        requestId: null,
        createdAt: '2026-10-28T14:00:00.000Z',
        updatedAt: '2026-10-28T14:00:00.000Z'
      }
    ];
    saveCollection('projects');

    // Default Artwork Files
    collections.artworkFiles = [
      {
        id: 'art_1',
        projectId: 'prj_1',
        version: 'v1.0',
        title: 'Initial Packaging Concept - Earth Ochre & Gold Leaf',
        fileUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=1200&q=80',
        fileType: 'image/jpeg',
        fileSize: '4.8 MB',
        notes: 'First draft featuring topographic elevation lines of Mount Kenya with warm ochre foil stamp.',
        uploadedBy: 'Alex Kamau',
        uploadedAt: '2026-10-20T14:00:00.000Z',
        status: 'revision_requested'
      },
      {
        id: 'art_2',
        projectId: 'prj_1',
        version: 'v2.0',
        title: 'Revised Packaging - High Contrast Deep Roast Edition',
        fileUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
        fileType: 'image/jpeg',
        fileSize: '6.2 MB',
        notes: 'Updated according to Wanjiku\'s feedback: Enlarged tasting notes badge, bolder barcode placement, and added Kenya Bureau of Standards mark.',
        uploadedBy: 'Alex Kamau',
        uploadedAt: '2026-10-28T11:30:00.000Z',
        status: 'pending_review'
      },
      {
        id: 'art_3',
        projectId: 'prj_3',
        version: 'v1.0',
        title: 'Zahra Swahili Coast Menu Proof',
        fileUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
        fileType: 'image/jpeg',
        fileSize: '3.5 MB',
        notes: 'Full spread tri-fold layout with allergen key and cocktail photography.',
        uploadedBy: 'Alex Kamau',
        uploadedAt: '2026-10-26T16:20:00.000Z',
        status: 'revision_requested'
      },
      {
        id: 'art_4',
        projectId: 'prj_4',
        version: 'v3.0 - Final',
        title: 'Kiprono UI Guidelines Master Asset Bundle',
        fileUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
        fileType: 'application/pdf',
        fileSize: '18.4 MB',
        notes: 'Final approved brand asset book with vector symbols and web font package.',
        uploadedBy: 'Alex Kamau',
        uploadedAt: '2026-10-09T17:00:00.000Z',
        status: 'approved'
      }
    ];
    saveCollection('artworkFiles');

    // Default Revisions
    collections.revisions = [
      {
        id: 'rev_1',
        projectId: 'prj_1',
        artworkId: 'art_1',
        version: 'v1.0',
        requestedBy: 'Wanjiku Mwangi',
        comment: 'We love the topographic concept! Please make the tasting notes (Dark Chocolate, Blackcurrant) 20% larger so they stand out on supermarket shelves. Also ensure the KEBS standardization diamond logo is included on the rear panel.',
        annotatedAreas: [
          { x: 45, y: 32, note: 'Increase font size for tasting notes' },
          { x: 80, y: 75, note: 'Place KEBS logo here' }
        ],
        requestedAt: '2026-10-22T09:15:00.000Z',
        status: 'addressed'
      },
      {
        id: 'rev_2',
        projectId: 'prj_3',
        artworkId: 'art_3',
        version: 'v1.0',
        requestedBy: 'Dr. Amina Hassan',
        comment: 'Please update the prices for the Tamarind Lobster Platter to KSh 3,800 and swap the mocktail font for something slightly lighter and easier to read under dim candlelight.',
        annotatedAreas: [
          { x: 60, y: 40, note: 'Change price to KSh 3,800' }
        ],
        requestedAt: '2026-10-28T18:00:00.000Z',
        status: 'open'
      }
    ];
    saveCollection('revisions');

    // Default Invoices
    collections.invoices = [
      {
        id: 'inv_1',
        invoiceNumber: 'INV-2026-001',
        projectId: 'prj_1',
        projectName: 'Savannah Single-Origin Coffee Packaging',
        clientId: 'cli_1',
        clientName: 'Wanjiku Mwangi (Savannah Coffee)',
        designerId: designerUser.id,
        totalAmount: 45000,
        depositAmount: 20000,
        balanceAmount: 25000,
        currency: 'KES',
        dueDate: '2026-11-20',
        status: 'deposit_paid',
        items: [
          { description: 'Concept Ideation & Creative Direction', quantity: 1, unitPrice: 15000, amount: 15000 },
          { description: 'Packaging Front/Back Dieline Vectors', quantity: 1, unitPrice: 20000, amount: 20000 },
          { description: '3D Photorealistic Retail Renders (4 angles)', quantity: 1, unitPrice: 10000, amount: 10000 }
        ],
        createdAt: '2026-10-16T12:00:00.000Z'
      },
      {
        id: 'inv_2',
        invoiceNumber: 'INV-2026-002',
        projectId: 'prj_2',
        projectName: 'Apex Fleet Graphic Wraps & Vehicle Decals',
        clientId: 'cli_2',
        clientName: 'Brian Omondi (Apex Logistics)',
        designerId: designerUser.id,
        totalAmount: 60000,
        depositAmount: 30000,
        balanceAmount: 30000,
        currency: 'KES',
        dueDate: '2026-11-10',
        status: 'deposit_paid',
        items: [
          { description: 'Commercial Van Fleet Livery Template', quantity: 2, unitPrice: 15000, amount: 30000 },
          { description: 'Semi-Trailer Heavy Hauler Graphics Kit', quantity: 1, unitPrice: 30000, amount: 30000 }
        ],
        createdAt: '2026-10-12T10:00:00.000Z'
      },
      {
        id: 'inv_3',
        invoiceNumber: 'INV-2026-003',
        projectId: 'prj_3',
        projectName: 'Zahra Lodge Swahili Oceanfront Menu',
        clientId: 'cli_3',
        clientName: 'Dr. Amina Hassan (Zahra Lodge)',
        designerId: designerUser.id,
        totalAmount: 28000,
        depositAmount: 0,
        balanceAmount: 28000,
        currency: 'KES',
        dueDate: '2026-11-05',
        status: 'unpaid',
        items: [
          { description: 'Tri-Fold Restaurant Dining & Beverage Menu', quantity: 1, unitPrice: 22000, amount: 22000 },
          { description: 'Daily Catch Chalkboard Insert Cards', quantity: 1, unitPrice: 6000, amount: 6000 }
        ],
        createdAt: '2026-10-20T15:00:00.000Z'
      },
      {
        id: 'inv_4',
        invoiceNumber: 'INV-2026-004',
        projectId: 'prj_4',
        projectName: 'Kiprono AgriTech Mobile App UI Brand Guide',
        clientId: 'cli_4',
        clientName: 'Kevin Kiprono (Kiprono Agro Tech)',
        designerId: designerUser.id,
        totalAmount: 50000,
        depositAmount: 25000,
        balanceAmount: 0,
        currency: 'KES',
        dueDate: '2026-10-10',
        status: 'paid',
        items: [
          { description: 'Mobile Design Tokens & Component Library', quantity: 1, unitPrice: 35000, amount: 35000 },
          { description: 'Brand Guidelines Manual PDF (32 pages)', quantity: 1, unitPrice: 15000, amount: 15000 }
        ],
        createdAt: '2026-09-02T09:00:00.000Z'
      }
    ];
    saveCollection('invoices');

    // Default Payments
    collections.payments = [
      {
        id: 'pay_1',
        invoiceId: 'inv_1',
        projectId: 'prj_1',
        clientId: 'cli_1',
        clientName: 'Wanjiku Mwangi',
        amount: 20000,
        currency: 'KES',
        method: 'mpesa',
        transactionRef: 'QKH718299A',
        paymentType: 'deposit',
        status: 'completed',
        paidAt: '2026-10-16T14:22:00.000Z',
        notes: 'M-Pesa Express STK push paid by +254 722 987 654'
      },
      {
        id: 'pay_2',
        invoiceId: 'inv_2',
        projectId: 'prj_2',
        clientId: 'cli_2',
        clientName: 'Brian Omondi',
        amount: 30000,
        currency: 'KES',
        method: 'bank_transfer',
        transactionRef: 'KCB-FT-991204',
        paymentType: 'deposit',
        status: 'completed',
        paidAt: '2026-10-13T11:05:00.000Z',
        notes: 'KCB Bank Kenya Electronic Funds Transfer'
      },
      {
        id: 'pay_3',
        invoiceId: 'inv_4',
        projectId: 'prj_4',
        clientId: 'cli_4',
        clientName: 'Kevin Kiprono',
        amount: 25000,
        currency: 'KES',
        method: 'mpesa',
        transactionRef: 'QKZ440182C',
        paymentType: 'deposit',
        status: 'completed',
        paidAt: '2026-09-03T16:40:00.000Z',
        notes: 'Initial 50% commitment deposit via M-Pesa'
      },
      {
        id: 'pay_4',
        invoiceId: 'inv_4',
        projectId: 'prj_4',
        clientId: 'cli_4',
        clientName: 'Kevin Kiprono',
        amount: 25000,
        currency: 'KES',
        method: 'mpesa',
        transactionRef: 'QLM882190B',
        paymentType: 'full',
        status: 'completed',
        paidAt: '2026-10-10T15:10:00.000Z',
        notes: 'Final settlement on artwork sign-off'
      }
    ];
    saveCollection('payments');

    // Default Notifications
    collections.notifications = [
      {
        id: 'notif_1',
        userId: designerUser.id,
        role: 'designer',
        title: 'New Design Request Received',
        message: 'Brian Omondi (Apex Logistics) submitted a request: "Corporate Sustainability Brochure"',
        type: 'request',
        link: '/requests',
        isRead: false,
        createdAt: '2026-10-25T11:20:00.000Z'
      },
      {
        id: 'notif_2',
        userId: designerUser.id,
        role: 'designer',
        title: 'Revision Requested on Artwork',
        message: 'Dr. Amina Hassan requested pricing adjustments on "Zahra Swahili Coast Menu Proof v1.0"',
        type: 'revision',
        link: '/artwork',
        isRead: false,
        createdAt: '2026-10-28T18:01:00.000Z'
      },
      {
        id: 'notif_3',
        userId: clientUser.id,
        role: 'client',
        title: 'New Artwork Version Uploaded',
        message: 'Alex Kamau uploaded "Revised Packaging - High Contrast Deep Roast Edition v2.0" for your review.',
        type: 'artwork',
        link: '/portal/artwork',
        isRead: false,
        createdAt: '2026-10-28T11:32:00.000Z'
      },
      {
        id: 'notif_4',
        userId: designerUser.id,
        role: 'designer',
        title: 'M-Pesa Deposit Received',
        message: 'KSh 20,000 received from Savannah Coffee (Ref: QKH718299A)',
        type: 'payment',
        link: '/financials',
        isRead: true,
        createdAt: '2026-10-16T14:23:00.000Z'
      }
    ];
    saveCollection('notifications');

    console.log('CreativeDesk database initialized and seeded successfully.');
  }

  // Attempt MongoDB connection if configured in environment
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
      console.log('Connected to MongoDB cluster.');
    } catch (err) {
      console.log('MongoDB not reachable or local service inactive. Using JSON file-backed persistence engine.');
    }
  } else {
    console.log('Using robust JSON file-backed persistence engine at', DATA_DIR);
  }
}

// Data access helper methods
export const db = {
  get: (collection) => collections[collection] || [],
  findById: (collection, id) => (collections[collection] || []).find((item) => item.id === id),
  find: (collection, predicate) => (collections[collection] || []).filter(predicate),
  findOne: (collection, predicate) => (collections[collection] || []).find(predicate),
  insert: (collection, item) => {
    if (!collections[collection]) collections[collection] = [];
    collections[collection].unshift(item);
    saveCollection(collection);
    return item;
  },
  update: (collection, id, updates) => {
    const list = collections[collection] || [];
    const idx = list.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    saveCollection(collection);
    return list[idx];
  },
  delete: (collection, id) => {
    const list = collections[collection] || [];
    const idx = list.findIndex((item) => item.id === id);
    if (idx === -1) return false;
    list.splice(idx, 1);
    saveCollection(collection);
    return true;
  }
};
