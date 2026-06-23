import React, { useState } from 'react';
import { useStore, Video } from '../../context/StoreContext';
import { Plus, Trash2, Edit2, Youtube, Eye, EyeOff, Save, X, ExternalLink, Play, Package } from 'lucide-react';

// ─── YouTube URL → embed ID ───────────────────────────────────────────────────

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  // Handles: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/shorts/ID, /embed/ID
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /v=([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function getThumbnail(url: string) {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
}

// ─── Empty form state ─────────────────────────────────────────────────────────

const EMPTY: Omit<Video, 'id'> = {
  title: '',
  youtubeUrl: '',
  productId: '',
  active: true,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminVideos() {
  const { videos, addVideo, updateVideo, deleteVideo, products, videoSectionVisible, setVideoSectionVisible } = useStore();

  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState<Video | null>(null);
  const [form, setForm]             = useState<Omit<Video, 'id'>>(EMPTY);
  const [saving, setSaving]         = useState(false);
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [deleting, setDeleting]     = useState(false);
  const [urlError, setUrlError]     = useState('');

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setUrlError('');
    setShowForm(true);
  };

  const openEdit = (v: Video) => {
    setEditing(v);
    setForm({
      title: v.title,
      youtubeUrl: v.youtubeUrl,
      productId: v.productId ?? '',
      active: v.active ?? true,
    });
    setUrlError('');
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditing(null); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'youtubeUrl') setUrlError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate YouTube URL
    const videoId = extractYouTubeId(form.youtubeUrl);
    if (!videoId) {
      setUrlError('Please enter a valid YouTube URL or Shorts URL.');
      return;
    }

    // Auto-set title from linked product name (or use URL as fallback)
    const linkedProduct = products.find(p => p.id === form.productId);
    const titleToSave = linkedProduct?.name ?? form.youtubeUrl;

    setSaving(true);
    try {
      const payload = { ...form, title: titleToSave };
      if (editing) {
        await updateVideo(editing.id, payload);
      } else {
        await addVideo(payload);
      }
      closeForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try { await deleteVideo(deleteId); }
    finally { setDeleting(false); setDeleteId(null); }
  };

  const toggleActive = async (v: Video) => {
    await updateVideo(v.id, { active: !v.active });
  };

  const previewId = extractYouTubeId(form.youtubeUrl);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Video Shorts</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage YouTube Shorts displayed on the homepage</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Video
        </button>
      </div>

      {/* ── Section Visibility Toggle ─────────────────────────────────────── */}
      <div className={`flex items-center justify-between p-4 rounded-2xl border mb-6 ${
        videoSectionVisible
          ? 'bg-green-50 border-green-200'
          : 'bg-slate-100 border-slate-200'
      }`}>
        <div>
          <p className={`font-bold text-sm ${videoSectionVisible ? 'text-green-900' : 'text-slate-600'}`}>
            {videoSectionVisible ? '✅ Video Section Visible on Homepage' : '🙈 Video Section Hidden from Homepage'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {videoSectionVisible
              ? 'The "See It In Action" section is showing on the homepage.'
              : 'The entire video section is hidden from visitors.'}
          </p>
        </div>
        <button
          onClick={() => setVideoSectionVisible(!videoSectionVisible)}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors shrink-0 ml-4 ${
            videoSectionVisible ? 'bg-green-500' : 'bg-slate-300'
          }`}
        >
          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            videoSectionVisible ? 'translate-x-8' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Videos',  value: videos.length },
          { label: 'Active',        value: videos.filter(v => v.active !== false).length },
          { label: 'Hidden',        value: videos.filter(v => v.active === false).length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 p-4 text-center shadow-sm">
            <div className="text-2xl font-extrabold text-slate-900">{value}</div>
            <div className="text-xs text-slate-400 font-semibold mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Video list */}
      {videos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <Youtube className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold mb-1">No videos yet</p>
          <p className="text-slate-400 text-sm mb-4">Add your first YouTube Shorts URL to display on the homepage.</p>
          <button onClick={openNew} className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm">
            <Plus className="w-4 h-4" /> Add Video
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map(v => {
            const thumb = getThumbnail(v.youtubeUrl);
            const vid   = extractYouTubeId(v.youtubeUrl);
            return (
              <div key={v.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm transition-all ${v.active === false ? 'border-slate-100 opacity-60' : 'border-slate-100 hover:border-blue-200 hover:shadow-md'}`}>
                {/* Thumbnail */}
                <div className="relative h-40 bg-slate-900 overflow-hidden">
                  {thumb ? (
                    <img src={thumb} alt={v.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Youtube className="w-10 h-10 text-slate-600" />
                    </div>
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                  {/* Status badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${v.active !== false ? 'bg-green-500 text-white' : 'bg-slate-500 text-white'}`}>
                      {v.active !== false ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1 mb-1">{v.title}</h3>
                  {v.description && <p className="text-slate-400 text-xs line-clamp-2 mb-2">{v.description}</p>}
                  {/* Linked product badge */}
                  {v.productId && (() => {
                    const linked = products.find(p => p.id === v.productId);
                    return linked ? (
                      <div className="flex items-center gap-2 mb-3 bg-blue-50 rounded-lg px-2.5 py-1.5">
                        <img src={linked.image} alt={linked.name} className="w-6 h-6 object-contain rounded" />
                        <span className="text-xs font-semibold text-blue-700 line-clamp-1">{linked.name}</span>
                        <span className="text-[10px] text-blue-500 ml-auto shrink-0">AED {linked.price}</span>
                      </div>
                    ) : null;
                  })()}
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 truncate">
                    <Youtube className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{v.youtubeUrl}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(v)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-[12px] font-bold text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-300 py-1.5 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => toggleActive(v)}
                      title={v.active !== false ? 'Hide from homepage' : 'Show on homepage'}
                      className="p-1.5 rounded-lg border border-slate-200 hover:border-amber-300 text-slate-400 hover:text-amber-500 transition-colors"
                    >
                      {v.active !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    {vid && (
                      <a
                        href={`https://www.youtube.com/shorts/${vid}`}
                        target="_blank" rel="noreferrer"
                        className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-400 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => setDeleteId(v.id)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:border-red-300 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Modal ──────────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-extrabold text-slate-900">{editing ? 'Edit Video' : 'Add New Video'}</h2>
              <button onClick={closeForm} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">

              {/* ① Link a Product (optional) — goes first for auto-fill */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Link a Product (optional)</span>
                </label>
                <select
                  name="productId"
                  value={form.productId ?? ''}
                  onChange={handleChange}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 bg-white"
                >
                  <option value="">— No linked product —</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} · AED {p.price}
                    </option>
                  ))}
                </select>
                {form.productId && (() => {
                  const sel = products.find(p => p.id === form.productId);
                  return sel ? (
                    <div className="mt-2 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3">
                      <img src={sel.image} alt={sel.name} className="w-10 h-10 object-contain rounded-lg bg-white p-1" />
                      <div>
                        <p className="text-sm font-bold text-slate-900 line-clamp-1">{sel.name}</p>
                        <p className="text-xs text-blue-600 font-bold">AED {sel.price}</p>
                      </div>
                    </div>
                  ) : null;
                })()}
                <p className="text-slate-400 text-[11px] mt-1">
                  Product name will be used as the video label. Title &amp; description are automatic.
                </p>
              </div>

              <div className="border-t border-slate-100 pt-1" />

              {/* ② YouTube URL */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  YouTube Shorts URL *
                </label>
                <input
                  required name="youtubeUrl" value={form.youtubeUrl} onChange={handleChange}
                  placeholder="https://www.youtube.com/shorts/abc123"
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${urlError ? 'border-red-300 focus:border-red-400 focus:ring-red-50' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-50'}`}
                />
                {urlError && <p className="text-red-500 text-xs mt-1">{urlError}</p>}
                <p className="text-slate-400 text-[11px] mt-1">
                  Accepts: youtube.com/shorts/…, youtube.com/watch?v=…, youtu.be/…
                </p>
              </div>

              {/* ③ Preview */}
              {previewId && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Preview</label>
                  <div className="relative w-full rounded-xl overflow-hidden bg-slate-900" style={{ paddingTop: '56.25%' }}>
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${previewId}?mute=1&controls=1`}
                      title="Preview"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* ④ Active toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="active" checked={form.active ?? true} onChange={handleChange} className="w-4 h-4 accent-blue-600" />
                <span className="text-sm font-semibold text-slate-700">Show on homepage</span>
              </label>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm} className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
                  {saving ? 'Saving…' : <><Save className="w-4 h-4" /> {editing ? 'Save Changes' : 'Add Video'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete confirm ────────────────────────────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-center mb-2">Delete Video?</h3>
            <p className="text-slate-500 text-sm text-center mb-6">This will permanently remove the video from the homepage.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-60">
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
