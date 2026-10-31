'use client';
import { useState, useEffect } from 'react';
import {
  Globe,
  Save,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  Layout,
  ExternalLink,
} from 'lucide-react';

export default function AdminContentPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingBrand, setUploadingBrand] = useState(false);

  useEffect(() => {
    async function loadContent() {
      try {
        const res = await fetch('/api/content');
        const data = await res.json();
        if (data.success && data.content) {
          setContent(data.content);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleHeroImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHero(true);
    const body = new FormData();
    body.append('files', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed');
      setContent((prev) => ({ ...prev, heroImage: data.urls[0] }));
      showToast('Hero image uploaded!');
    } catch (err) {
      setErrorMessage(err.message || 'Upload failed');
    } finally {
      setUploadingHero(false);
    }
  };

  const handleBrandImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingBrand(true);
    const body = new FormData();
    body.append('files', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed');
      setContent((prev) => ({ ...prev, brandStoryImage: data.urls[0] }));
      showToast('Brand story image uploaded!');
    } catch (err) {
      setErrorMessage(err.message || 'Upload failed');
    } finally {
      setUploadingBrand(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save content');

      setContent(data.content);
      showToast('Website content published successfully!');
    } catch (err) {
      setErrorMessage(err.message || 'Error saving content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 size={32} className="animate-spin text-emerald-600 mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-semibold">Loading content...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Website Content Management</h1>
          <p className="text-xs text-slate-500">
            Customize homepage hero banners, typography, CTA buttons, and brand story.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-700/20 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          <span>Publish to Storefront</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* 1. Hero Showcase Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layout size={18} className="text-emerald-600" />
            <span>Homepage Hero Banner</span>
          </h2>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Hero Main Heading *</label>
              <input
                type="text"
                required
                value={content.heroHeading || ''}
                onChange={(e) => setContent({ ...content, heroHeading: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Hero Subtitle / Description *</label>
              <textarea
                rows={2}
                required
                value={content.heroSubheading || ''}
                onChange={(e) => setContent({ ...content, heroSubheading: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl leading-relaxed"
              />
            </div>

            {/* Hero Image */}
            <div className="space-y-1.5 pt-1">
              <label className="font-bold text-slate-700 block">Hero Background / Banner Image</label>
              <div className="flex items-center gap-4">
                <div className="w-32 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  {content.heroImage ? (
                    <img src={content.heroImage} alt="Hero" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                      No Banner
                    </div>
                  )}
                </div>
                <label className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors">
                  <Upload size={14} />
                  <span>{uploadingHero ? 'Uploading...' : 'Upload Banner Photo'}</span>
                  <input type="file" accept="image/*" onChange={handleHeroImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Buttons & Destinations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block text-xs">Primary Call-to-Action</span>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">Button Label</label>
                  <input
                    type="text"
                    value={content.heroPrimaryBtnText || ''}
                    onChange={(e) => setContent({ ...content, heroPrimaryBtnText: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">Destination Link</label>
                  <input
                    type="text"
                    value={content.heroPrimaryBtnLink || ''}
                    onChange={(e) => setContent({ ...content, heroPrimaryBtnLink: e.target.value })}
                    placeholder="/shop"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block text-xs">Secondary Call-to-Action</span>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">Button Label</label>
                  <input
                    type="text"
                    value={content.heroSecondaryBtnText || ''}
                    onChange={(e) => setContent({ ...content, heroSecondaryBtnText: e.target.value })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500">Destination Link</label>
                  <input
                    type="text"
                    value={content.heroSecondaryBtnLink || ''}
                    onChange={(e) => setContent({ ...content, heroSecondaryBtnLink: e.target.value })}
                    placeholder="/#categories"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Brand Story / Introduction */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles size={18} className="text-emerald-600" />
            <span>Brand Story & Heritage Section</span>
          </h2>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Section Title</label>
              <input
                type="text"
                value={content.brandStoryTitle || ''}
                onChange={(e) => setContent({ ...content, brandStoryTitle: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Brand Story Narrative</label>
              <textarea
                rows={4}
                value={content.brandStoryText || ''}
                onChange={(e) => setContent({ ...content, brandStoryText: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl leading-relaxed"
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="font-bold text-slate-700 block">Brand Feature Image</label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  {content.brandStoryImage ? (
                    <img src={content.brandStoryImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                      No Photo
                    </div>
                  )}
                </div>
                <label className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors">
                  <Upload size={14} />
                  <span>{uploadingBrand ? 'Uploading...' : 'Upload Brand Image'}</span>
                  <input type="file" accept="image/*" onChange={handleBrandImageUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-extrabold shadow-lg shadow-emerald-700/20 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Publish Website Content</span>
          </button>
        </div>
      </form>
    </div>
  );
}
