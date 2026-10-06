import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Trash2, Calendar, MapPin, LogOut, 
  Sparkles, X, Search, Heart, Camera, BookOpen, Edit2, Lock, Tag, Maximize2, Compass
} from 'lucide-react';

export default function Gallery({ token, setToken }) {
  const [memories, setMemories] = useState([]);
  const [filteredMemories, setFilteredMemories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [unlockedIds, setUnlockedIds] = useState([]);
  const SECRET_PIN = "1234";

  const [formData, setFormData] = useState({ 
    title: '', caption: '', memoryDate: '', location: '', tags: '', isLocked: false, image: null 
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchMemories = async () => {
    try {
      const res = await axios.get('https://scrapbook-270h.onrender.com/api/memories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMemories(res.data);
    } catch (err) {
      if (err.response?.status === 401) setToken('');
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  useEffect(() => {
    let result = memories;

    if (showFavoritesOnly) {
      result = result.filter(m => m.isFavorite);
    }

    if (selectedTag !== 'ALL') {
      result = result.filter(m => m.tags && m.tags.includes(selectedTag));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.title.toLowerCase().includes(query) || 
        m.caption.toLowerCase().includes(query) ||
        (m.location && m.location.toLowerCase().includes(query))
      );
    }

    setFilteredMemories(result);
  }, [searchQuery, selectedTag, showFavoritesOnly, memories]);

  const allTags = ['ALL', ...new Set(memories.flatMap(m => m.tags || []))];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleFavoriteToggle = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await axios.patch(`https://scrapbook-270h.onrender.com/api/memories/${id}/favorite`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMemories(memories.map(m => m._id === id ? res.data : m));
    } catch (err) {
      alert('Failed to update favorite status');
    }
  };

  const handleOpenEdit = (m, e) => {
    e.stopPropagation();
    setEditingId(m._id);
    setFormData({
      title: m.title,
      caption: m.caption,
      memoryDate: m.memoryDate.split('T')[0],
      location: m.location || '',
      tags: m.tags ? m.tags.join(', ') : '',
      isLocked: m.isLocked || false,
      image: null
    });
    setPreview(m.imageUrl);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await axios.put(`https://scrapbook-270h.onrender.com/api/memories/${editingId}`, {
          title: formData.title,
          caption: formData.caption,
          memoryDate: formData.memoryDate,
          location: formData.location,
          tags: formData.tags,
          isLocked: formData.isLocked
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        const data = new FormData();
        data.append('title', formData.title);
        data.append('caption', formData.caption);
        data.append('memoryDate', formData.memoryDate);
        data.append('location', formData.location);
        data.append('tags', formData.tags);
        data.append('isLocked', formData.isLocked);
        data.append('image', formData.image);

        await axios.post('https://scrapbook-270h.onrender.com/api/memories', data, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
      }

      setShowModal(false);
      setEditingId(null);
      setFormData({ title: '', caption: '', memoryDate: '', location: '', tags: '', isLocked: false, image: null });
      setPreview(null);
      fetchMemories();
    } catch (err) {
      alert('Failed to save memory');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this memory photo?')) return;
    try {
      await axios.delete(`https://scrapbook-270h.onrender.com/api/memories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMemories();
    } catch (err) {
      alert('Failed to delete memory');
    }
  };

  const handleCardClick = (m) => {
    if (m.isLocked && !unlockedIds.includes(m._id)) {
      const input = prompt("Enter 4-digit PIN to unlock this memory (Default PIN: 1234):");
      if (input === SECRET_PIN) {
        setUnlockedIds([...unlockedIds, m._id]);
        setSelectedImage(m);
      } else {
        alert("Incorrect PIN!");
      }
    } else {
      setSelectedImage(m);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf8f2] text-stone-800 selection:bg-amber-200 selection:text-amber-900 pb-28 font-serif relative overflow-x-hidden">
      {/* Top Floral Ribbon */}
      <div className="fixed top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-600 via-amber-500 to-rose-400 z-50" />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#fcf8f2]/90 border-b border-stone-200/80 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-800 text-amber-100 rounded-2xl shadow-md rotate-[-3deg]">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-stone-800 flex items-center gap-2 font-serif">
                My Life Journal 🌿
              </h1>
              <p className="text-xs font-sans text-stone-500">Decorated Polaroid Memory Vault</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto font-sans">
            <div className="relative flex-1 md:w-60">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search scrapbook..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-stone-200 focus:border-emerald-600 rounded-2xl pl-10 pr-4 py-2 text-xs text-stone-700 focus:outline-none shadow-sm"
              />
            </div>

            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`p-2.5 rounded-2xl border transition ${showFavoritesOnly ? 'bg-rose-100 text-rose-700 border-rose-300' : 'bg-white border-stone-200 text-stone-600'}`}
              title="Filter Favorites"
            >
              <Heart size={16} fill={showFavoritesOnly ? "currentColor" : "none"} />
            </button>

            <button
              onClick={() => { setEditingId(null); setPreview(null); setShowModal(true); }}
              className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-amber-50 text-xs font-medium px-4 py-2.5 rounded-2xl shadow-md transition shrink-0"
            >
              <Plus size={16} /> Add Snapshot
            </button>

            <button onClick={() => setToken('')} className="p-2.5 text-stone-500 hover:text-rose-700 rounded-2xl transition shrink-0">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Tags Bar */}
        {allTags.length > 1 && (
          <div className="max-w-7xl mx-auto flex items-center gap-2 mt-4 overflow-x-auto pb-1 font-sans text-xs">
            <Tag size={13} className="text-stone-400 shrink-0" />
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-xl transition uppercase text-[10px] font-bold tracking-wider shrink-0 ${
                  selectedTag === tag 
                    ? 'bg-emerald-800 text-amber-50 shadow-sm' 
                    : 'bg-stone-200/60 text-stone-600 hover:bg-stone-300/60'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-6 mt-12">
        {filteredMemories.length === 0 ? (
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 rounded-3xl p-16 text-center bg-white/60">
            <Camera size={36} className="text-stone-400 mb-3" />
            <h3 className="text-xl font-bold text-stone-800 font-serif">No Memories Found</h3>
            <p className="text-xs font-sans text-stone-500 mt-1">Try changing filters or add a new memory.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredMemories.map((m, idx) => {
              const isLockedCard = m.isLocked && !unlockedIds.includes(m._id);
              
              // Alternating rotations for scrapbook feel
              const rotations = ['rotate-[1.5deg]', 'rotate-[-2deg]', 'rotate-[1deg]', 'rotate-[-1.5deg]'];
              const cardRotation = rotations[idx % rotations.length];

              return (
                <div
                  key={m._id}
                  onClick={() => handleCardClick(m)}
                  className={`group relative bg-white border border-stone-200/90 rounded-2xl p-4 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col cursor-pointer ${cardRotation}`}
                >
                  {/* Decorative Washi Tape Accent */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-amber-100/90 border border-amber-200/60 shadow-sm rotate-[-1deg] z-20 pointer-events-none opacity-90" />

                  {/* Photo Frame Container */}
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-stone-100 border border-stone-200">
                    {isLockedCard ? (
                      <div className="w-full h-full bg-stone-900/95 backdrop-blur-md flex flex-col items-center justify-center text-stone-300 p-4">
                        <Lock size={32} className="text-amber-400 mb-2 animate-bounce" />
                        <span className="text-xs font-sans font-semibold">Locked Memory</span>
                        <span className="text-[10px] text-stone-500 mt-1">Click to unlock with PIN</span>
                      </div>
                    ) : (
                      <>
                        <img src={m.imageUrl} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </>
                    )}

                    {/* Favorite Button (Heart Badge) */}
                    <button
                      onClick={(e) => handleFavoriteToggle(m._id, e)}
                      className="absolute top-2.5 left-2.5 p-2 bg-white/90 backdrop-blur-md rounded-xl text-rose-600 hover:bg-white shadow-md transition z-10"
                    >
                      <Heart size={14} fill={m.isFavorite ? "currentColor" : "none"} />
                    </button>

                    {/* Action Overlay */}
                    <div className="absolute top-2.5 right-2.5 flex gap-1.5 opacity-0 group-hover:opacity-100 transition z-10">
                      <button onClick={(e) => handleOpenEdit(m, e)} className="p-2 bg-white/90 text-stone-700 hover:text-emerald-800 rounded-xl shadow-md transition">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={(e) => handleDelete(m._id, e)} className="p-2 bg-white/90 text-stone-700 hover:text-rose-600 rounded-xl shadow-md transition">
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {!isLockedCard && (
                      <div className="absolute bottom-2.5 left-2.5 opacity-0 group-hover:opacity-100 transition">
                        <span className="flex items-center gap-1 bg-white/90 backdrop-blur-md text-[10px] text-stone-700 font-sans px-2.5 py-1 rounded-lg font-medium shadow-sm">
                          <Maximize2 size={11} /> Expand
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Caption & Metadata Details */}
                  <div className="pt-4 pb-2 px-1 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-stone-800 group-hover:text-emerald-800 transition line-clamp-1 font-serif">
                        {m.title}
                      </h3>
                      <p className="text-xs font-sans text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                        {isLockedCard ? "••••••••••••••••••••••••" : m.caption}
                      </p>
                    </div>

                    {/* Tags Pills Display */}
                    {m.tags && m.tags.length > 0 && !isLockedCard && (
                      <div className="flex flex-wrap gap-1.5 mt-3 font-sans">
                        {m.tags.slice(0, 3).map(t => (
                          <span key={t} className="text-[9px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium border border-stone-200/60">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] font-sans text-stone-500 gap-2">
                      <div className="flex items-center gap-1.5 bg-stone-100 px-2.5 py-1 rounded-lg">
                        <Calendar size={12} className="text-emerald-700" />
                        <span>{new Date(m.memoryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      {m.location && (
                        <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg truncate border border-amber-200/50">
                          <MapPin size={12} className="text-amber-700 shrink-0" />
                          <span className="truncate text-amber-900">{m.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Expanded Lightbox View */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
          <div className="relative max-w-4xl w-full bg-[#fcf8f2] border border-stone-300 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-stone-800/20 hover:bg-stone-800/40 text-stone-800 rounded-full transition"
            >
              <X size={18} />
            </button>

            <div className="md:w-3/5 bg-stone-950 flex items-center justify-center max-h-[70vh] md:max-h-[80vh]">
              <img src={selectedImage.imageUrl} alt={selectedImage.title} className="w-full h-full object-contain" />
            </div>

            <div className="md:w-2/5 p-8 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-md inline-block mb-4">
                  Memory Entry
                </span>
                <h2 className="text-2xl font-bold text-stone-800 font-serif">{selectedImage.title}</h2>
                <p className="text-xs text-stone-600 mt-4 leading-relaxed whitespace-pre-line">{selectedImage.caption}</p>

                {selectedImage.tags && selectedImage.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {selectedImage.tags.map(t => (
                      <span key={t} className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-lg font-medium">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 pt-4 border-t border-stone-200 space-y-2 text-xs text-stone-500">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-emerald-700" />
                  <span>{new Date(selectedImage.memoryDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                {selectedImage.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-amber-700" />
                    <span>{selectedImage.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Add / Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm font-sans">
          <div className="bg-[#fcf8f2] border border-stone-300 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-base font-bold text-stone-800 font-serif">
                {editingId ? 'Edit Memory Entry' : 'Add to Scrapbook'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-700"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                required
                className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <textarea
                placeholder="Caption & Notes..."
                required
                rows={3}
                className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none resize-none"
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  required
                  className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2 text-xs"
                  value={formData.memoryDate}
                  onChange={(e) => setFormData({ ...formData, memoryDate: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Location (Optional)"
                  className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2 text-xs"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <input
                type="text"
                placeholder="Tags (e.g. travel, beach, friends)"
                className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2 text-xs"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="lockCheckbox"
                  checked={formData.isLocked}
                  onChange={(e) => setFormData({ ...formData, isLocked: e.target.checked })}
                />
                <label htmlFor="lockCheckbox" className="text-xs text-stone-700 flex items-center gap-1">
                  <Lock size={12} /> Lock with PIN (Default: 1234)
                </label>
              </div>

              {!editingId && (
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleImageChange}
                  className="w-full text-xs text-stone-500"
                />
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs text-stone-500">Cancel</button>
                <button type="submit" disabled={loading} className="bg-emerald-800 text-amber-50 text-xs px-5 py-2 rounded-xl">
                  {loading ? 'Saving...' : 'Save Memory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}