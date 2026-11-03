'use client';
import { useState, useEffect } from 'react';
import UniversalDataTable from '@/components/admin/UniversalDataTable';
import Portal from '@/components/ui/Portal';
import {
  FolderTree,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  Upload,
  X,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  // Category Modal (Add / Edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    displayOrder: 0,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories?admin=true');
      const data = await res.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      image: '',
      displayOrder: categories.length + 1,
      isActive: true,
    });
    setModalError('');
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
      displayOrder: cat.displayOrder,
      isActive: cat.isActive,
    });
    setModalError('');
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setModalError('');
    const body = new FormData();
    body.append('files', file);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('ar_admin_token') : null;
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers,
        credentials: 'include',
        body,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Upload failed');
      setFormData((prev) => ({ ...prev, image: data.urls[0] }));
    } catch (err) {
      setModalError(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setModalError('Category name is required.');
      return;
    }

    setSaving(true);
    setModalError('');

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const token = typeof window !== 'undefined' ? localStorage.getItem('ar_admin_token') : null;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, {
        method,
        headers,
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save category');
      }

      showToast(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
      setModalOpen(false);
      fetchCategories();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('categories_updated'));
      }
    } catch (err) {
      setModalError(err.message || 'Error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    try {
      const res = await fetch(`/api/categories/${cat.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Category deleted successfully');
        fetchCategories();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('categories_updated'));
        }
      } else {
        alert(data.error || 'Cannot delete category');
      }
    } catch (e) {
      alert('Failed to delete category');
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !cat.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Category status updated`);
        fetchCategories();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('categories_updated'));
        }
      }
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const columns = [
    {
      key: 'image',
      label: 'Photo',
      sortable: false,
      render: (val) => (
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
          {val ? (
            <img src={val} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-semibold">
              No Img
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Category Name',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-bold text-slate-900 leading-snug">{val}</p>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">slug: {row.slug}</p>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      render: (val) => (
        <p className="text-xs text-slate-600 line-clamp-2 max-w-xs">{val || '-'}</p>
      ),
    },
    {
      key: 'productCount',
      label: 'Total Products',
      sortable: true,
      getRawValue: (row) => row._count?.products || 0,
      render: (_, row) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          {row._count?.products || 0} product(s)
        </span>
      ),
    },
    {
      key: 'displayOrder',
      label: 'Display Order',
      sortable: true,
      render: (val) => <span className="font-mono font-bold text-slate-700">{val}</span>,
    },
    {
      key: 'isActive',
      label: 'Active Status',
      sortable: true,
      render: (val, row) => (
        <button
          onClick={() => handleToggleActive(row)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
            val
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-slate-200 text-slate-600 border-slate-300'
          }`}
        >
          {val ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          <span>{val ? 'Active' : 'Inactive'}</span>
        </button>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date Created',
      sortable: true,
      isDate: true,
      render: (val) => formatDate(val),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} className="text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Category Masters</h1>
          <p className="text-xs text-slate-500">
            Define apparel categories, banner photographs, and ordering for storefront navigation.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all"
        >
          <PlusCircle size={16} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Universal Data Table Engine */}
      <UniversalDataTable
        title="Categories"
        data={categories}
        columns={columns}
        defaultSortKey="displayOrder"
        defaultSortDir="asc"
        primaryAction={{
          label: 'Add Category',
          onClick: openAddModal,
          icon: <PlusCircle size={16} />,
        }}
        onView={(cat) => openEditModal(cat)}
        onEdit={(cat) => openEditModal(cat)}
        onDelete={(cat) => handleDelete(cat)}
      />

      {/* Add / Edit Category Modal (Portal) */}
      {modalOpen && (
        <Portal>
          <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <FolderTree size={18} className="text-emerald-600" />
                  <span>{editingCategory ? 'Edit Category' : 'Add New Category'}</span>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
                {modalError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-semibold">
                    {modalError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Men's Panjabi & Kurta"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Short description for storefront header..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                {/* Category Photograph */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-700 block">Category Photograph</label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border shrink-0 relative group">
                      {formData.image ? (
                        <>
                          <img src={formData.image} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                            className="absolute inset-0 bg-black/60 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                          No Photo
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                          <Upload size={13} />
                          <span>{uploadingImage ? 'Uploading...' : 'Upload File'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        {formData.image && (
                          <span className="text-[11px] text-emerald-600 font-semibold truncate max-w-[180px]">
                            Image ready
                          </span>
                        )}
                      </div>
                      <input
                        type="url"
                        placeholder="Or paste image URL (Unsplash, CDN, etc.)..."
                        value={formData.image || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Display Order</label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) =>
                        setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 0 })
                      }
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Status</label>
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-semibold text-slate-700">Active on Storefront</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {saving && <Loader2 size={13} className="animate-spin" />}
                    <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
