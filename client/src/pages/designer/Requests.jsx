import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox,
  Search,
  Sparkles,
  Calendar,
  CheckCircle2,
  XCircle,
  FolderKanban,
  ExternalLink,
  Tag,
  Palette,
  Maximize2,
  DollarSign,
  X,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const categories = [
    'all',
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

  const fetchRequests = async () => {
    try {
      const q = `?status=${statusFilter}&category=${encodeURIComponent(categoryFilter)}`;
      const data = await api.getRequests(q);
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [categoryFilter, statusFilter]);

  const handleConvert = async (reqId) => {
    setActionLoading(true);
    try {
      const result = await api.convertRequest(reqId);
      alert(`Success! Project "${result.project.name}" has been created and 50% deposit invoice ${result.invoice.invoiceNumber} generated.`);
      setSelectedRequest(null);
      fetchRequests();
      navigate('/projects');
    } catch (err) {
      alert('Error converting request: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (reqId, newStatus) => {
    try {
      await api.updateRequest(reqId, { status: newStatus });
      fetchRequests();
      if (selectedRequest?.id === reqId) {
        setSelectedRequest((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Design Requests Inbox
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review incoming briefs, inspect client reference assets, and convert approved briefs to active projects.
          </p>
        </div>
      </div>

      {/* 2. Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="font-bold text-slate-400 mr-1 text-[11px] uppercase tracking-wider">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">Status:</span>
          {['all', 'pending', 'accepted', 'declined'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md capitalize font-semibold transition ${
                statusFilter === st
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Requests Cards List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700">No design requests found</p>
          <p className="text-xs text-slate-400 mt-1">Clients can submit new requests via the Client Portal</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
            <div
              key={req.id}
              onClick={() => setSelectedRequest(req)}
              className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-black text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-lg">
                    {req.requestId}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      req.status === 'accepted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'declined'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {req.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug">
                    {req.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{req.clientName}</p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 bg-slate-50 p-3 rounded-2xl leading-relaxed">
                  {req.description}
                </p>

                {/* Color swatches preview if provided */}
                {req.preferredColors?.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400">Palette:</span>
                    {req.preferredColors.map((color, i) => (
                      <span
                        key={i}
                        className="w-4 h-4 rounded-full border border-slate-300 shadow-xs"
                        style={{ backgroundColor: color }}
                        title={color}
                      ></span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Budget: <strong className="text-slate-900">KSh {req.budget?.toLocaleString()}</strong></span>
                  <span className="text-slate-500 text-[11px]">Due: {req.deadline}</span>
                </div>

                <div className="flex gap-2">
                  {req.status === 'pending' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConvert(req.id);
                      }}
                      disabled={actionLoading}
                      className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
                    >
                      Accept & Convert
                    </button>
                  ) : req.convertedProjectId ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/projects');
                      }}
                      className="w-full py-2 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200 hover:bg-emerald-100 transition"
                    >
                      Active Project Created ✓
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Request Full Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-blue-400 bg-blue-900/60 px-2 py-0.5 rounded">
                    {selectedRequest.requestId}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {selectedRequest.category}
                  </span>
                </div>
                <h2 className="text-xl font-bold">{selectedRequest.title}</h2>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Client</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedRequest.clientName}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Budget (KES)</span>
                  <p className="font-black text-slate-900 mt-0.5">KSh {selectedRequest.budget?.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Deadline</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedRequest.deadline}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Dimensions</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedRequest.dimensions || 'Standard'}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5">Project Scope & Description</h3>
                <p className="p-4 rounded-2xl bg-slate-50 border border-slate-200 leading-relaxed text-slate-700">
                  {selectedRequest.description}
                </p>
              </div>

              {/* Preferred Colors */}
              {selectedRequest.preferredColors?.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-blue-600" /> Client Brand Colors
                  </h3>
                  <div className="flex items-center gap-3">
                    {selectedRequest.preferredColors.map((hex, i) => (
                      <div key={i} className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="w-5 h-5 rounded-lg border border-slate-300" style={{ backgroundColor: hex }}></span>
                        <span className="font-mono font-bold text-xs text-slate-800">{hex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reference Images */}
              {selectedRequest.referenceImages?.length > 0 && (
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-2">Inspiration & Reference Media</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedRequest.referenceImages.map((img, i) => (
                      <a
                        key={i}
                        href={img}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-2xl overflow-hidden border border-slate-200 relative group h-40"
                      >
                        <img src={img} alt="Reference" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1">
                          View Full Size <ExternalLink className="w-3.5 h-3.5" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedRequest.additionalInstructions && (
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1.5">Additional Delivery Instructions</h3>
                  <p className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs">
                    {selectedRequest.additionalInstructions}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex gap-2">
                {selectedRequest.status !== 'declined' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest.id, 'declined')}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                  >
                    Decline Brief
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60"
                >
                  Close
                </button>
                {selectedRequest.status === 'pending' && (
                  <button
                    onClick={() => handleConvert(selectedRequest.id)}
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
                  >
                    <FolderKanban className="w-4 h-4" />
                    Accept & Convert to Project
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
