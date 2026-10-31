'use client';
import { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Shield,
  Truck,
  RotateCcw,
  Scale,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminPoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('privacy-policy');
  const [currentContent, setCurrentContent] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/policies');
      const data = await res.json();
      if (data.success && data.policies) {
        setPolicies(data.policies);
        const match = data.policies.find((p) => p.slug === activeTab) || data.policies[0];
        if (match) {
          setActiveTab(match.slug);
          setCurrentContent(match.content);
          setCurrentTitle(match.title);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const selectPolicyTab = (slug) => {
    setActiveTab(slug);
    const match = policies.find((p) => p.slug === slug);
    if (match) {
      setCurrentContent(match.content);
      setCurrentTitle(match.title);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleSavePolicy = async (e) => {
    e.preventDefault();
    const activePolicyObj = policies.find((p) => p.slug === activeTab);
    if (!activePolicyObj) return;

    setSaving(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/policies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activePolicyObj.id,
          title: currentTitle,
          content: currentContent,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update policy');

      showToast(`"${currentTitle}" updated successfully!`);
      // Update local state
      setPolicies((prev) =>
        prev.map((p) => (p.slug === activeTab ? { ...p, title: currentTitle, content: currentContent } : p))
      );
    } catch (err) {
      setErrorMessage(err.message || 'Error saving policy');
    } finally {
      setSaving(false);
    }
  };

  const tabIcons = {
    'privacy-policy': Shield,
    'shipping-policy': Truck,
    'return-policy': RotateCcw,
    'terms-conditions': Scale,
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 size={32} className="animate-spin text-emerald-600 mx-auto mb-2" />
        <p className="text-xs text-slate-500 font-semibold">Loading policies...</p>
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Legal & Store Policies</h1>
          <p className="text-xs text-slate-500">
            Maintain transparent, compliant policies for customer shopping, deliveries, returns, and terms.
          </p>
        </div>

        <Link
          href={`/policies/${activeTab}`}
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
        >
          <ExternalLink size={14} />
          <span>Preview on Website</span>
        </Link>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle size={16} className="text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Policy Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {policies.map((p) => {
          const Icon = tabIcons[p.slug] || FileText;
          const isActive = activeTab === p.slug;
          return (
            <button
              key={p.slug}
              onClick={() => selectPolicyTab(p.slug)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon size={15} />
              <span>{p.title}</span>
            </button>
          );
        })}
      </div>

      {/* Policy Editor Form */}
      <form onSubmit={handleSavePolicy} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
        <div className="space-y-1">
          <label className="font-bold text-slate-700">Policy Title</label>
          <input
            type="text"
            required
            value={currentTitle}
            onChange={(e) => setCurrentTitle(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="font-bold text-slate-700">Policy Terms & Body Content (Markdown Supported)</label>
            <span className="text-[11px] text-slate-400">Slug: /policies/{activeTab}</span>
          </div>
          <textarea
            rows={14}
            required
            value={currentContent}
            onChange={(e) => setCurrentContent(e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl font-mono leading-relaxed text-xs"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs shadow-md shadow-emerald-700/20 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save & Publish Policy</span>
          </button>
        </div>
      </form>
    </div>
  );
}
