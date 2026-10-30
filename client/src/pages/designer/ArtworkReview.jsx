import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Upload,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Download,
  Plus,
  X,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { api } from '../../services/api';

export default function ArtworkReview() {
  const [artworks, setArtworks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    projectId: '',
    title: '',
    version: '',
    fileUrl: '',
    notes: ''
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchArtworks = async () => {
    try {
      const q = selectedProjectId !== 'all' ? `?projectId=${selectedProjectId}` : '';
      const data = await api.getArtworks(q);
      setArtworks(data);
      if (data.length > 0 && !selectedArtwork) {
        setSelectedArtwork(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const projs = await api.getProjects();
      setProjects(projs);
      if (projs.length > 0 && !uploadData.projectId) {
        setUploadData((prev) => ({ ...prev, projectId: projs[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRevisions = async (artworkId) => {
    try {
      const revs = await api.getRevisions(`?artworkId=${artworkId}`);
      setRevisions(revs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchArtworks();
    fetchProjects();
  }, [selectedProjectId]);

  useEffect(() => {
    if (selectedArtwork) {
      fetchRevisions(selectedArtwork.id);
    }
  }, [selectedArtwork]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Check if user specified a file or preview URL
      let finalUrl = uploadData.fileUrl;
      if (!finalUrl && !uploadFile) {
        finalUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80';
      }

      await api.uploadArtwork({
        projectId: uploadData.projectId,
        title: uploadData.title,
        version: uploadData.version,
        fileUrl: finalUrl,
        notes: uploadData.notes
      });

      setShowUploadModal(false);
      setUploadData({
        projectId: projects[0]?.id || '',
        title: '',
        version: '',
        fileUrl: '',
        notes: ''
      });
      fetchArtworks();
      alert('Artwork version uploaded! Client has been notified for review.');
    } catch (err) {
      alert('Error uploading artwork: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Artwork Proofing & Version Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Deliver design revisions (v1.0, v2.0), track client review markup, and retain version history.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition transform hover:-translate-y-0.5"
        >
          <Upload className="w-4 h-4" /> Upload New Artwork Proof
        </button>
      </div>

      {/* 2. Filter by Project */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Project Filter:
          </span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-72 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Active Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.clientName})
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-bold text-slate-500">
          Showing <strong>{artworks.length}</strong> artwork versions
        </span>
      </div>

      {/* 3. Main Two-Column Proofing Stage */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Loading artwork proofs...</div>
      ) : artworks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-700">No artwork proofs uploaded yet</p>
          <p className="text-xs text-slate-400 mt-1">Click "Upload New Artwork Proof" to submit your first version</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Version History Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              Version Timeline (Never Overwritten)
            </h2>
            <div className="space-y-2.5">
              {artworks.map((art) => {
                const isSelected = selectedArtwork?.id === art.id;
                return (
                  <div
                    key={art.id}
                    onClick={() => setSelectedArtwork(art)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex gap-3.5 items-start ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-400 shadow-xs ring-2 ring-blue-500/15'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-900">
                      <img src={art.fileUrl} alt="" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[10px] font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                          {art.version}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            art.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : art.status === 'revision_requested'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {art.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-900 mt-1 truncate">
                        {art.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {art.projectName}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        {new Date(art.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: High-Res Proof & Client Feedback View (8 cols) */}
          {selectedArtwork && (
            <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              {/* Artwork Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800">
                      {selectedArtwork.version}
                    </span>
                    <span className="text-xs text-slate-400">
                      Uploaded by {selectedArtwork.uploadedBy} on {new Date(selectedArtwork.uploadedAt).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1">{selectedArtwork.title}</h3>
                  <p className="text-xs text-slate-500">{selectedArtwork.projectName}</p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={selectedArtwork.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Asset
                  </a>
                </div>
              </div>

              {/* High-Resolution Artwork Stage */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center min-h-[350px] max-h-[500px] group shadow-inner">
                <img
                  src={selectedArtwork.fileUrl}
                  alt={selectedArtwork.title}
                  className="max-h-[500px] w-auto object-contain"
                />

                <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-3">
                  <span>File size: {selectedArtwork.fileSize}</span>
                  <span>Type: {selectedArtwork.fileType}</span>
                </div>
              </div>

              {/* Designer Release Notes */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 uppercase tracking-wide block mb-1 text-[10px]">
                  Designer Release Notes
                </span>
                <p className="text-slate-600 leading-relaxed italic">
                  "{selectedArtwork.notes || 'No version notes recorded for this release.'}"
                </p>
              </div>

              {/* Client Revision Feedback Records */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-rose-500" />
                    Client Revision Feedback & Annotations ({revisions.length})
                  </h4>
                  {selectedArtwork.status === 'revision_requested' && (
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="text-xs text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      Upload revised version <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {revisions.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>No revision requests on this version. Pending client sign-off or already approved!</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {revisions.map((rev) => (
                      <div key={rev.id} className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs space-y-2">
                        <div className="flex items-center justify-between font-bold text-rose-900">
                          <span>Feedback from: {rev.requestedBy}</span>
                          <span className="text-slate-400 font-normal">{new Date(rev.requestedAt).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          "{rev.comment}"
                        </p>
                        {rev.annotatedAreas?.length > 0 && (
                          <div className="pt-2 border-t border-rose-200/60 flex flex-wrap gap-2">
                            {rev.annotatedAreas.map((ann, idx) => (
                              <span key={idx} className="bg-white px-2.5 py-1 rounded-lg text-slate-800 border border-rose-200 text-[11px] font-medium">
                                Pin #{idx + 1}: {ann.note}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Upload New Version Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Upload Artwork Version Proof</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Associated Project *
                </label>
                <select
                  required
                  value={uploadData.projectId}
                  onChange={(e) => setUploadData({ ...uploadData, projectId: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Proof Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="e.g. Dieline Packaging Proof"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Version Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={uploadData.version}
                    onChange={(e) => setUploadData({ ...uploadData, version: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="e.g. v2.0 (Auto if blank)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Artwork Image / Asset URL
                </label>
                <input
                  type="url"
                  value={uploadData.fileUrl}
                  onChange={(e) => setUploadData({ ...uploadData, fileUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="https://... or leave blank for high-res creative template"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Version Release Notes
                </label>
                <textarea
                  rows="3"
                  value={uploadData.notes}
                  onChange={(e) => setUploadData({ ...uploadData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Describe changes made in this revision (e.g., enlarged logo by 15%, adjusted CMYK black for offset print)..."
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  {uploading ? 'Uploading Proof...' : 'Publish Version to Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
