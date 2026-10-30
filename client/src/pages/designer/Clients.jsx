import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Building,
  MapPin,
  Trash2,
  Edit2,
  FolderKanban,
  Receipt,
  ExternalLink,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [viewingProfile, setViewingProfile] = useState(null); // stores client + projects + invoices
  const [profileLoading, setProfileLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    tags: 'Corporate'
  });

  const fetchClients = async () => {
    try {
      const query = `?search=${encodeURIComponent(search)}&tag=${activeTag}`;
      const data = await api.getClients(query);
      setClients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search, activeTag]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
      tags: 'Corporate'
    });
    setEditingClient(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (c, e) => {
    e.stopPropagation();
    setEditingClient(c);
    setFormData({
      name: c.name,
      company: c.company,
      email: c.email,
      phone: c.phone || '',
      address: c.address || '',
      notes: c.notes || '',
      tags: c.tags ? c.tags.join(', ') : ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this client record?')) return;
    try {
      await api.deleteClient(id);
      fetchClients();
      if (viewingProfile?.client?.id === id) setViewingProfile(null);
    } catch (err) {
      alert('Failed to delete client: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
      };

      if (editingClient) {
        await api.updateClient(editingClient.id, payload);
      } else {
        await api.createClient(payload);
      }
      setShowAddModal(false);
      fetchClients();
    } catch (err) {
      alert('Error saving client: ' + err.message);
    }
  };

  const handleViewProfile = async (client) => {
    setProfileLoading(true);
    setViewingProfile({ client, projects: [], invoices: [], payments: [] });
    try {
      const full = await api.getClientById(client.id);
      setViewingProfile(full);
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  const tagsList = ['all', 'Retail', 'Logistics', 'Hospitality', 'Tech', 'VIP'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Client Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage contact profiles, project portfolios, and historical KES financial statements.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Register New Client
        </button>
      </div>

      {/* 2. Search & Tag Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client name, company, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        {/* Tag Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {tagsList.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition capitalize ${
                activeTag === tag
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Clients Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading clients...</div>
      ) : clients.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700">No client accounts found</p>
          <p className="text-xs text-slate-400 mt-1">Register a client to start intake and invoicing</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((c) => (
            <div
              key={c.id}
              onClick={() => handleViewProfile(c)}
              className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.name)}&backgroundColor=2563eb,0f172a`}
                      alt={c.name}
                      className="w-11 h-11 rounded-2xl object-cover ring-2 ring-slate-100"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition">
                        {c.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">{c.company}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleOpenEdit(c, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                      title="Edit client"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(c.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete client"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </div>
                  {c.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                  {c.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.address}</span>
                    </div>
                  )}
                </div>

                {c.notes && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded-xl line-clamp-2">
                    "{c.notes}"
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {c.tags?.map((tag) => (
                    <span key={tag} className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-xs font-bold text-blue-600 group-hover:underline flex items-center gap-1">
                  Profile <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Client Profile Detail Drawer / Modal */}
      {viewingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(viewingProfile.client.name)}`}
                  alt=""
                  className="w-12 h-12 rounded-2xl bg-white/10 ring-2 ring-white/20"
                />
                <div>
                  <h2 className="text-xl font-black">{viewingProfile.client.name}</h2>
                  <p className="text-xs text-slate-400">{viewingProfile.client.company}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingProfile(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {profileLoading ? (
                <div className="py-12 text-center text-slate-400 text-xs">Loading complete history...</div>
              ) : (
                <>
                  {/* Contact Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Email</span>
                      <p className="text-xs font-bold text-slate-800 truncate mt-0.5">{viewingProfile.client.email}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Phone</span>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{viewingProfile.client.phone || 'N/A'}</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Location</span>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{viewingProfile.client.address || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Previous Projects */}
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                      <FolderKanban className="w-4 h-4 text-blue-600" />
                      Associated Creative Projects ({viewingProfile.projects?.length || 0})
                    </h3>

                    {viewingProfile.projects?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No projects recorded yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {viewingProfile.projects?.map((p) => (
                          <div key={p.id} className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-bold text-slate-900">{p.name}</p>
                              <p className="text-slate-500 text-[11px]">Due {p.deadline} • Progress {p.progress}%</p>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-slate-900">KSh {p.agreedPrice?.toLocaleString()}</span>
                              <span className="block text-[10px] uppercase font-bold text-blue-600">{p.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Payment & Invoices History */}
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-emerald-600" />
                      Financial & Invoice History (KES)
                    </h3>

                    {viewingProfile.invoices?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No invoices issued to this client yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {viewingProfile.invoices?.map((inv) => (
                          <div key={inv.id} className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-mono font-bold text-blue-600 mr-2">{inv.invoiceNumber}</span>
                              <span className="font-bold text-slate-800">{inv.projectName}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-black text-slate-900">KSh {inv.totalAmount?.toLocaleString()}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {inv.status.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {editingClient ? 'Edit Client Record' : 'Register New Client'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Wanjiku Mwangi"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Savannah Coffee Ltd"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="client@domain.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Phone (M-Pesa alerts)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="+254 722 000 000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Physical Address / Location
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Westlands Commercial Center, Nairobi"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Retail, Packaging, VIP"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Private Studio Notes
                </label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Key preferences, brand color rules, preferred contact times..."
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  {editingClient ? 'Update Client' : 'Register Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
