import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Inbox,
  FolderKanban,
  FileCheck2,
  Receipt,
  Sparkles,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Eye,
  MessageSquare,
  Smartphone,
  Check,
  X,
  Palette,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ClientPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'submit' | 'projects' | 'artwork' | 'invoices'

  // Portal data states
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Request Form State
  const [requestForm, setRequestForm] = useState({
    title: '',
    category: 'Logo design',
    description: '',
    referenceImages: '',
    preferredColors: '#2563EB, #0F172A',
    dimensions: '',
    deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    budget: 30000,
    additionalInstructions: ''
  });
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Artwork Review Modal
  const [inspectArtwork, setInspectArtwork] = useState(null);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionComment, setRevisionComment] = useState('');
  const [revisionPin, setRevisionPin] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // M-Pesa Simulation Modal
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [mpesaPhone, setMpesaPhone] = useState(user?.phone || '+254 722 987 654');
  const [mpesaProcessing, setMpesaProcessing] = useState(false);
  const [mpesaSuccess, setMpesaSuccess] = useState(false);

  const categories = [
    'Logo design',
    'Branding',
    'Social media graphics',
    'Posters and flyers',
    'Business cards',
    'Brochures',
    'Certificates',
    'Banners',
    'Motion graphics',
    'Video advertisements'
  ];

  const fetchClientData = async () => {
    try {
      const [statsData, projs, reqs, arts, invs] = await Promise.all([
        api.getPortalStats(),
        api.getProjects(),
        api.getRequests(),
        api.getArtworks(),
        api.getInvoices()
      ]);
      setStats(statsData);
      setProjects(projs);
      setRequests(reqs);
      setArtworks(arts);
      setInvoices(invs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, []);

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setSubmittingRequest(true);
    try {
      const refImgs = requestForm.referenceImages
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const prefColors = requestForm.preferredColors
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.createRequest({
        ...requestForm,
        referenceImages: refImgs.length > 0 ? refImgs : [
          'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80'
        ],
        preferredColors: prefColors.length > 0 ? prefColors : ['#2563EB', '#0F172A']
      });

      alert('Design request submitted! Your studio creative director has been notified.');
      setRequestForm({
        title: '',
        category: 'Logo design',
        description: '',
        referenceImages: '',
        preferredColors: '#2563EB, #0F172A',
        dimensions: '',
        deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        budget: 30000,
        additionalInstructions: ''
      });
      fetchClientData();
      setActiveTab('overview');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleApproveArtwork = async (art) => {
    if (!window.confirm(`Approve final artwork "${art.title}" (${art.version})? This marks the design approved and ready for delivery!`)) return;
    setReviewLoading(true);
    try {
      await api.updateArtworkStatus(art.id, { status: 'approved' });
      alert('Artwork approved! The designer has been notified and high-resolution deliverables are confirmed.');
      setInspectArtwork(null);
      fetchClientData();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleSubmitRevision = async (e) => {
    e.preventDefault();
    if (!revisionComment) return;
    setReviewLoading(true);
    try {
      await api.updateArtworkStatus(inspectArtwork.id, {
        status: 'revision_requested',
        revisionComment,
        annotatedAreas: revisionPin ? [{ x: 50, y: 50, note: revisionPin }] : []
      });
      alert('Revision request submitted! The designer has received your instructions and will upload the next version.');
      setShowRevisionModal(false);
      setInspectArtwork(null);
      setRevisionComment('');
      setRevisionPin('');
      fetchClientData();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleSimulateMpesa = async (e) => {
    e.preventDefault();
    setMpesaProcessing(true);

    try {
      // Simulate real STK push roundtrip
      await new Promise((res) => setTimeout(res, 1200));

      const payAmount = payingInvoice.balanceAmount > 0 ? payingInvoice.balanceAmount : payingInvoice.depositAmount;
      await api.recordPayment({
        invoiceId: payingInvoice.id,
        amount: payAmount,
        method: 'mpesa',
        phone: mpesaPhone,
        paymentType: payingInvoice.status === 'unpaid' ? 'deposit' : 'full'
      });

      setMpesaSuccess(true);
      setTimeout(() => {
        setMpesaSuccess(false);
        setPayingInvoice(null);
        fetchClientData();
      }, 1800);
    } catch (err) {
      alert('M-Pesa simulation error: ' + err.message);
    } finally {
      setMpesaProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Portal Header & Welcome */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 text-white p-6 sm:p-8 rounded-3xl shadow-lg shadow-blue-500/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider text-blue-100">
            Client Collaboration Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            {user?.company || 'Your Brand'} • Submit design briefs, review versioned artwork proofs, and manage Kenyan Shillings invoices.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('submit')}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-xs shadow-md transition transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Submit New Design Request
        </button>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'overview' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" /> Overview
        </button>
        <button
          onClick={() => setActiveTab('submit')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'submit' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Inbox className="w-4 h-4" /> Submit Brief
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'projects' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FolderKanban className="w-4 h-4" /> Active Projects ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab('artwork')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'artwork' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCheck2 className="w-4 h-4" /> Review Artwork ({artworks.length})
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'invoices' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4" /> Invoices & M-Pesa ({invoices.length})
        </button>
      </div>

      {/* 3. TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => setActiveTab('projects')}
              className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-300 transition cursor-pointer"
            >
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Projects</span>
              <p className="text-3xl font-black text-slate-900 mt-2">{projects.length}</p>
              <span className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 mt-2">
                Track progress <ArrowRight className="w-3 h-3" />
              </span>
            </div>

            <div
              onClick={() => setActiveTab('artwork')}
              className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-300 transition cursor-pointer"
            >
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Design Reviews</span>
              <p className="text-3xl font-black text-purple-600 mt-2">
                {artworks.filter((a) => a.status === 'pending_review').length}
              </p>
              <span className="text-xs text-purple-600 font-bold hover:underline flex items-center gap-1 mt-2">
                Review proofs & annotate <ArrowRight className="w-3 h-3" />
              </span>
            </div>

            <div
              onClick={() => setActiveTab('invoices')}
              className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-300 transition cursor-pointer"
            >
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Unpaid Invoices</span>
              <p className="text-3xl font-black text-amber-600 mt-2">
                {invoices.filter((i) => i.status !== 'paid').length}
              </p>
              <span className="text-xs text-amber-600 font-bold hover:underline flex items-center gap-1 mt-2">
                Pay with M-Pesa <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Quick Overview Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Projects Tracker */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm">Active Creative Deliverables</h3>
                <button onClick={() => setActiveTab('projects')} className="text-xs font-bold text-blue-600 hover:underline">
                  View all
                </button>
              </div>

              <div className="space-y-3">
                {projects.slice(0, 3).map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-xs text-slate-900">{p.name}</h4>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {p.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full" style={{ width: `${p.progress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-medium pt-1">
                      <span>Due: {p.deadline}</span>
                      <span>{p.progress}% completed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Proofs Awaiting Review */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm">Artwork Proofs For Your Approval</h3>
                <button onClick={() => setActiveTab('artwork')} className="text-xs font-bold text-blue-600 hover:underline">
                  Open reviewer
                </button>
              </div>

              <div className="space-y-3">
                {artworks.slice(0, 3).map((art) => (
                  <div
                    key={art.id}
                    onClick={() => {
                      setInspectArtwork(art);
                      setActiveTab('artwork');
                    }}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:bg-slate-100 transition cursor-pointer flex gap-3 items-center"
                  >
                    <img src={art.fileUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-[10px] font-black text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                        {art.version}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 truncate mt-0.5">{art.title}</h4>
                      <p className="text-[11px] text-slate-500 truncate">{art.projectName}</p>
                    </div>
                    <span className="text-xs font-bold text-blue-600">Inspect</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB: SUBMIT BRIEF */}
      {activeTab === 'submit' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs max-w-3xl mx-auto space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Request Wizard</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">Submit New Design Brief</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Provide comprehensive instructions to help the creative team hit the target on round one.
            </p>
          </div>

          <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={requestForm.title}
                  onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="e.g. Luxury Honey Jar Label & Packaging Dieline"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Design Category *
                </label>
                <select
                  value={requestForm.category}
                  onChange={(e) => setRequestForm({ ...requestForm, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Detailed Brief & Description *
              </label>
              <textarea
                rows="4"
                required
                value={requestForm.description}
                onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
                placeholder="Describe your vision, target audience, brand aesthetic, and key deliverables..."
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Budget in KES *
                </label>
                <input
                  type="number"
                  required
                  value={requestForm.budget}
                  onChange={(e) => setRequestForm({ ...requestForm, budget: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  placeholder="30000"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Desired Deadline *
                </label>
                <input
                  type="date"
                  required
                  value={requestForm.deadline}
                  onChange={(e) => setRequestForm({ ...requestForm, deadline: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Dimensions (mm / px)
                </label>
                <input
                  type="text"
                  value={requestForm.dimensions}
                  onChange={(e) => setRequestForm({ ...requestForm, dimensions: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. 1080x1920 or A4"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Preferred Color Hex Codes
                </label>
                <input
                  type="text"
                  value={requestForm.preferredColors}
                  onChange={(e) => setRequestForm({ ...requestForm, preferredColors: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  placeholder="#2563EB, #0F172A, #F59E0B"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Reference Asset / Moodboard URL
                </label>
                <input
                  type="text"
                  value={requestForm.referenceImages}
                  onChange={(e) => setRequestForm({ ...requestForm, referenceImages: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="https://... (image URL)"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Additional Instructions
              </label>
              <textarea
                rows="2"
                value={requestForm.additionalInstructions}
                onChange={(e) => setRequestForm({ ...requestForm, additionalInstructions: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="Include vector formats (AI, EPS, SVG), font licenses, or packaging dieline layers..."
              ></textarea>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="submit"
                disabled={submittingRequest}
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition"
              >
                {submittingRequest ? 'Submitting Brief...' : 'Submit Design Brief (KES)'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. TAB: MY PROJECTS */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Commissioned Creative Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <div key={p.id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex justify-between items-start">
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      p.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.status === 'revision_required'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {p.status.replace(/_/g, ' ')}
                  </span>
                  <span className="font-black text-xs text-slate-900">
                    KSh {p.agreedPrice?.toLocaleString()}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-500">
                    <span>Milestone Progress</span>
                    <span className="text-blue-600">{p.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${p.progress}%` }}></div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Target Date: {p.deadline}</span>
                  <button
                    onClick={() => setActiveTab('artwork')}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    View Proofs →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAB: REVIEW ARTWORK & APPROVALS */}
      {activeTab === 'artwork' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Artwork Proofs Reviewer</h2>
            <p className="text-xs text-slate-500">Preview artwork, inspect 100% vector scale, approve, or submit revision pins.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks.map((art) => (
              <div key={art.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden bg-slate-900 h-48 flex items-center justify-center">
                    <img src={art.fileUrl} alt={art.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 font-mono text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded shadow">
                      {art.version}
                    </span>
                    <span
                      className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow ${
                        art.status === 'approved'
                          ? 'bg-emerald-600 text-white'
                          : art.status === 'revision_requested'
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {art.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">{art.title}</h3>
                    <p className="text-xs text-slate-500">{art.projectName}</p>
                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl mt-2">
                      "{art.notes}"
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <a
                      href={art.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold text-center transition flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>

                    <button
                      onClick={() => setInspectArtwork(art)}
                      className="flex-1 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> Inspect Proof
                    </button>
                  </div>

                  {art.status !== 'approved' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleApproveArtwork(art)}
                        disabled={reviewLoading}
                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-xs transition"
                      >
                        Approve Final Artwork
                      </button>
                      <button
                        onClick={() => {
                          setInspectArtwork(art);
                          setShowRevisionModal(true);
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold border border-rose-200 transition"
                      >
                        Request Revisions
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. TAB: INVOICES & M-PESA */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Billing, Quotations & Payments (KES)</h2>
            <p className="text-xs text-slate-500">View project invoices, milestone deposits, and pay using M-Pesa STK push.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {invoices.map((inv) => (
              <div key={inv.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                    {inv.invoiceNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      inv.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : inv.status === 'deposit_paid'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {inv.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{inv.projectName}</h3>
                  <p className="text-xs text-slate-500">Due: {inv.dueDate}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Project Amount:</span>
                    <span className="font-bold text-slate-900">KSh {inv.totalAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Deposit Paid:</span>
                    <span className="font-bold text-emerald-700">KSh {inv.depositAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="font-bold text-slate-800">Remaining Balance:</span>
                    <span className="font-black text-rose-600 text-sm">
                      KSh {inv.balanceAmount?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {inv.status !== 'paid' ? (
                  <button
                    onClick={() => setPayingInvoice(inv)}
                    className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-4 h-4" />
                    Pay KSh {inv.balanceAmount?.toLocaleString()} via M-Pesa STK
                  </button>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-center font-bold text-xs border border-emerald-200 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Fully Settled & Paid
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inspect Artwork Modal */}
      {inspectArtwork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {inspectArtwork.version}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{inspectArtwork.title}</h3>
              </div>
              <button onClick={() => setInspectArtwork(null)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex items-center justify-center bg-slate-950 min-h-[400px]">
              <img src={inspectArtwork.fileUrl} alt="" className="max-h-[550px] w-auto object-contain" />
            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50">
              <a
                href={inspectArtwork.fileUrl}
                download
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download Raw Proof
              </a>

              {inspectArtwork.status !== 'approved' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRevisionModal(true)}
                    className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs"
                  >
                    Request Changes
                  </button>
                  <button
                    onClick={() => handleApproveArtwork(inspectArtwork)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs"
                  >
                    Approve Design ✓
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Revision Request Dialog */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Submit Revision Instructions</h3>
              <button onClick={() => setShowRevisionModal(false)} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitRevision} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Specific Change Instructions *
                </label>
                <textarea
                  rows="4"
                  required
                  value={revisionComment}
                  onChange={(e) => setRevisionComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl leading-relaxed"
                  placeholder="Detail exact edits: e.g. update prices on page 2, darken the gold foil hex to #D97706, make logo 15% larger..."
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Pinned Markup Note (Optional)
                </label>
                <input
                  type="text"
                  value={revisionPin}
                  onChange={(e) => setRevisionPin(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="e.g. Move KEBS diamond logo to bottom right corner"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRevisionModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold"
                >
                  {reviewLoading ? 'Sending...' : 'Send Revision Brief'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* M-Pesa STK Push Simulation Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto text-2xl font-black shadow-lg shadow-emerald-500/20">
              M
            </div>

            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">M-Pesa Express Checkout</h3>
              <p className="text-xs text-slate-500 mt-1">Safaricom Daraja API STK Simulation</p>
            </div>

            {mpesaSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-sm">PIN Verified & Paid!</p>
                <p className="text-xs text-slate-600">M-Pesa transaction ref logged automatically.</p>
              </div>
            ) : (
              <form onSubmit={handleSimulateMpesa} className="space-y-4 text-xs text-left">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Invoice:</span>
                    <span className="font-mono font-bold text-slate-800">{payingInvoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-200">
                    <span>Pay Amount:</span>
                    <span className="text-emerald-700">
                      KSh {(payingInvoice.balanceAmount > 0 ? payingInvoice.balanceAmount : payingInvoice.depositAmount).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Enter Safaricom Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-center"
                    placeholder="+254 7XX XXX XXX"
                  />
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={mpesaProcessing}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/25 transition"
                  >
                    {mpesaProcessing ? 'Waiting for M-Pesa PIN Prompt...' : 'Send STK Prompt & Confirm'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayingInvoice(null)}
                    className="w-full py-2 text-slate-500 hover:text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
