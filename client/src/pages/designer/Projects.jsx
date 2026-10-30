import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Search,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck2,
  MoreVertical,
  ChevronRight,
  Filter,
  DollarSign,
  X,
  Trash2,
  Table as TableIcon,
  LayoutGrid
} from 'lucide-react';
import { api } from '../../services/api';

const COLUMNS = [
  { id: 'pending', label: 'Pending', color: 'bg-amber-500', badge: 'bg-amber-100 text-amber-800' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-blue-600', badge: 'bg-blue-100 text-blue-800' },
  { id: 'under_review', label: 'Under Review', color: 'bg-purple-600', badge: 'bg-purple-100 text-purple-800' },
  { id: 'revision_required', label: 'Revision Required', color: 'bg-rose-600', badge: 'bg-rose-100 text-rose-800' },
  { id: 'completed', label: 'Completed', color: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-800' }
];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    clientName: '',
    description: '',
    agreedPrice: 35000,
    startDate: new Date().toISOString().split('T')[0],
    deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    progress: 10,
    status: 'in_progress'
  });

  const fetchProjects = async () => {
    try {
      const q = `?status=${statusFilter}&search=${encodeURIComponent(search)}`;
      const data = await api.getProjects(q);
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const data = await api.getClients();
      setClients(data);
      if (data.length > 0 && !formData.clientId) {
        setFormData((prev) => ({
          ...prev,
          clientId: data[0].id,
          clientName: `${data[0].name} (${data[0].company})`
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, [search, statusFilter]);

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      const updates = { status: newStatus };
      if (newStatus === 'completed') updates.progress = 100;
      await api.updateProject(projectId, updates);
      fetchProjects();
      if (selectedProject?.id === projectId) {
        setSelectedProject((prev) => ({ ...prev, ...updates }));
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleProgressChange = async (projectId, newProgress) => {
    try {
      await api.updateProject(projectId, { progress: Number(newProgress) });
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, progress: Number(newProgress) } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (projectId, e) => {
    e?.stopPropagation();
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.deleteProject(projectId);
      setSelectedProject(null);
      fetchProjects();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const clientObj = clients.find((c) => c.id === formData.clientId);
      const clientName = clientObj ? `${clientObj.name} (${clientObj.company})` : formData.clientName;

      await api.createProject({
        ...formData,
        clientName
      });
      setShowCreateModal(false);
      fetchProjects();
    } catch (err) {
      alert('Error creating project: ' + err.message);
    }
  };

  const handleOpenDetail = async (project) => {
    setSelectedProject(project);
    setDetailLoading(true);
    try {
      const data = await api.getProjectById(project.id);
      setDetailData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Creative Production Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track milestones on the interactive Kanban board, monitor artwork approvals, and update completion status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View toggle */}
          <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg flex items-center gap-1.5 transition ${
                viewMode === 'kanban' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg flex items-center gap-1.5 transition ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
              title="Interactive Table View"
            >
              <TableIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search project title or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 text-xs w-full md:w-auto">
          <span className="text-slate-400 font-bold uppercase text-[10px]">Filter:</span>
          {['all', 'in_progress', 'under_review', 'revision_required', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition ${
                statusFilter === st ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Kanban Board Mode */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4 items-start">
          {COLUMNS.map((col) => {
            const colProjects = projects.filter((p) => p.status === col.id);
            return (
              <div
                key={col.id}
                className="bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200/80 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.color}`}></span>
                    <span className="font-bold text-xs text-slate-800 tracking-tight">{col.label}</span>
                  </div>
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${col.badge}`}>
                    {colProjects.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colProjects.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs italic">
                      Empty stage
                    </div>
                  ) : (
                    colProjects.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleOpenDetail(p)}
                        className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition cursor-pointer space-y-3 group"
                      >
                        <div>
                          <p className="text-[10px] font-bold uppercase text-slate-400 truncate">
                            {p.clientName}
                          </p>
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5 group-hover:text-blue-600 transition leading-snug">
                            {p.name}
                          </h4>
                        </div>

                        {/* Progress Bar & Slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500">
                            <span>Progress</span>
                            <span className="text-blue-600">{p.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full transition-all duration-300"
                              style={{ width: `${p.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Footer: Price, Deadline & Move Trigger */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="font-extrabold text-slate-900">
                            KSh {p.agreedPrice?.toLocaleString()}
                          </span>
                          <span className="text-slate-500 flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3 text-slate-400" /> {p.deadline}
                          </span>
                        </div>

                        {/* Quick Move Action selector */}
                        <div className="pt-1 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <span className="text-[10px] text-slate-400">Move:</span>
                          <select
                            value={p.status}
                            onChange={(e) => handleStatusChange(p.id, e.target.value)}
                            className="text-[10px] font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-blue-500"
                          >
                            {COLUMNS.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 4. Interactive Table Mode */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Project Name</th>
                  <th className="py-3.5 px-6">Client</th>
                  <th className="py-3.5 px-6">Agreed Price</th>
                  <th className="py-3.5 px-6">Deadline</th>
                  <th className="py-3.5 px-6">Progress</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => handleOpenDetail(p)}
                    className="hover:bg-slate-50 transition cursor-pointer"
                  >
                    <td className="py-4 px-6 font-bold text-slate-900">{p.name}</td>
                    <td className="py-4 px-6 text-slate-600">{p.clientName}</td>
                    <td className="py-4 px-6 font-black text-slate-900">
                      KSh {p.agreedPrice?.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-600">{p.deadline}</td>
                    <td className="py-4 px-6">
                      <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full"
                          style={{ width: `${p.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold">{p.progress}%</span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          p.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'revision_required'
                            ? 'bg-rose-100 text-rose-800'
                            : p.status === 'under_review'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {p.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleDelete(p.id, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Project Detail & Artwork History Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-blue-400 tracking-wider">
                  Project Workspace
                </span>
                <h2 className="text-xl font-black mt-0.5">{selectedProject.name}</h2>
                <p className="text-xs text-slate-400">{selectedProject.clientName}</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
              {detailLoading ? (
                <div className="py-12 text-center text-slate-400">Loading project details...</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Agreed Price</span>
                      <p className="font-black text-slate-900 text-sm mt-0.5">
                        KSh {selectedProject.agreedPrice?.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Deadline</span>
                      <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedProject.deadline}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Stage</span>
                      <p className="font-bold text-blue-600 text-sm mt-0.5 capitalize">
                        {selectedProject.status.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Progress</span>
                      <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedProject.progress}%</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1.5">Project Scope</h4>
                    <p className="p-4 rounded-2xl bg-slate-50 border border-slate-200 leading-relaxed text-slate-600">
                      {selectedProject.description || 'No detailed scope provided.'}
                    </p>
                  </div>

                  {/* Artwork Uploads & Revisions */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4 text-purple-600" />
                        Uploaded Artwork Proofs ({detailData?.artworks?.length || 0})
                      </h4>
                    </div>

                    {detailData?.artworks?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No artwork files uploaded yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {detailData?.artworks?.map((art) => (
                          <div key={art.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                {art.version}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  art.status === 'approved'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {art.status.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <p className="font-bold text-slate-900 truncate">{art.title}</p>
                            <img src={art.fileUrl} alt="" className="w-full h-28 object-cover rounded-xl border border-slate-200" />
                            <p className="text-[11px] text-slate-500 italic truncate">"{art.notes}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                onClick={(e) => handleDelete(selectedProject.id, e)}
                className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 font-bold text-xs"
              >
                Delete Project
              </button>

              <button
                onClick={() => setSelectedProject(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Create New Project</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="e.g. Mara Serena Luxury Lodge Brochure"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Assign to Client *
                </label>
                <select
                  required
                  value={formData.clientId}
                  onChange={(e) => {
                    const sel = clients.find((c) => c.id === e.target.value);
                    setFormData({
                      ...formData,
                      clientId: e.target.value,
                      clientName: sel ? `${sel.name} (${sel.company})` : ''
                    });
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.company}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Agreed Price (KES) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.agreedPrice}
                    onChange={(e) => setFormData({ ...formData, agreedPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="35000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Target Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description / Deliverables
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Outline vectors, print dimensions, color profile, and milestone delivery dates..."
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
