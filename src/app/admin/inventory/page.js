'use client';
import { useState, useEffect } from 'react';
import UniversalDataTable from '@/components/admin/UniversalDataTable';
import Portal from '@/components/ui/Portal';
import {
  Boxes,
  AlertTriangle,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Edit2,
  X,
  Loader2,
  Save,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function AdminInventoryPage() {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedStockFilter, setSelectedStockFilter] = useState('all'); // all, low, out

  // Quick Inline Edit Stock Modal
  const [editVariant, setEditVariant] = useState(null);
  const [newStockVal, setNewStockVal] = useState(0);
  const [savingStock, setSavingStock] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const url = selectedStockFilter !== 'all'
        ? `/api/inventory?status=${selectedStockFilter}`
        : '/api/inventory';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.variants) {
        setVariants(data.variants);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [selectedStockFilter]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!editVariant) return;

    setSavingStock(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: editVariant.id,
          stock: newStockVal,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Stock updated to ${newStockVal} for ${editVariant.productName} (${editVariant.colour} - ${editVariant.size})`);
        setEditVariant(null);
        fetchInventory();
      } else {
        alert(data.error || 'Failed to update stock');
      }
    } catch (err) {
      alert('Error updating stock');
    } finally {
      setSavingStock(false);
    }
  };

  const handleToggleActive = async (variant) => {
    try {
      const res = await fetch('/api/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: variant.id,
          isActive: !variant.isActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Variant availability updated`);
        fetchInventory();
      }
    } catch (e) {
      alert('Failed to update variant');
    }
  };

  const columns = [
    {
      key: 'productName',
      label: 'Product & SKU',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border shrink-0">
            {row.mainImage ? (
              <img src={row.mainImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-400">
                No Img
              </div>
            )}
          </div>
          <div>
            <p className="font-bold text-slate-900 leading-snug">{val}</p>
            <p className="text-[11px] font-mono text-slate-400">SKU: {row.productSku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'categoryName',
      label: 'Category',
      sortable: true,
      render: (val) => (
        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
          {val}
        </span>
      ),
    },
    {
      key: 'colour',
      label: 'Colour Variant',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-2">
          <span
            className="w-3.5 h-3.5 rounded-full border border-black/20"
            style={{ backgroundColor: row.colourCode || '#1E293B' }}
          />
          <span className="font-medium text-slate-800">{val}</span>
        </div>
      ),
    },
    {
      key: 'size',
      label: 'Size Variant',
      sortable: true,
      render: (val) => (
        <span className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold font-mono">
          {val}
        </span>
      ),
    },
    {
      key: 'stock',
      label: 'Stock Quantity',
      sortable: true,
      render: (val, row) => {
        let badge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        if (val === 0) badge = 'bg-rose-50 text-rose-800 border-rose-200';
        else if (val <= 5) badge = 'bg-amber-50 text-amber-800 border-amber-200';

        return (
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${badge}`}>
              {val} units
            </span>
            <button
              onClick={() => {
                setEditVariant(row);
                setNewStockVal(val);
              }}
              title="Quick Update Stock"
              className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
            >
              <Edit2 size={13} />
            </button>
          </div>
        );
      },
    },
    {
      key: 'stockStatus',
      label: 'Inventory State',
      sortable: true,
      render: (val) => {
        if (val === 'Out of Stock') {
          return (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 text-rose-700">
              Out of Stock
            </span>
          );
        }
        if (val === 'Low Stock') {
          return (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-700">
              Low Stock
            </span>
          );
        }
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700">
            In Stock
          </span>
        );
      },
    },
    {
      key: 'isActive',
      label: 'Availability',
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
          <span>{val ? 'Available' : 'Disabled'}</span>
        </button>
      ),
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inventory & Stock</h1>
          <p className="text-xs text-slate-500">
            Real-time stock level monitoring and instant quantity adjustments across all size/colour variations.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setSelectedStockFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-colors ${
              selectedStockFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Variants
          </button>
          <button
            onClick={() => setSelectedStockFilter('low')}
            className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
              selectedStockFilter === 'low'
                ? 'bg-amber-600 text-white'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            <AlertTriangle size={13} />
            <span>Low Stock (&le; 5)</span>
          </button>
          <button
            onClick={() => setSelectedStockFilter('out')}
            className={`px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 ${
              selectedStockFilter === 'out'
                ? 'bg-rose-600 text-white'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <AlertTriangle size={13} />
            <span>Out of Stock (0)</span>
          </button>
        </div>
      </div>

      {/* Universal Data Table */}
      <UniversalDataTable
        title="Inventory"
        data={variants}
        columns={columns}
        defaultSortKey="stock"
        defaultSortDir="asc"
        onView={(row) => {
          setEditVariant(row);
          setNewStockVal(row.stock);
        }}
        onEdit={(row) => {
          setEditVariant(row);
          setNewStockVal(row.stock);
        }}
      />

      {/* Quick Edit Stock Quantity Modal (Portal) */}
      {editVariant && (
        <Portal>
          <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 overflow-hidden animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <Boxes size={18} className="text-emerald-600" />
                  <span className="font-bold text-slate-800 text-sm">Update Stock Quantity</span>
                </div>
                <button
                  onClick={() => setEditVariant(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleUpdateStock} className="space-y-4 text-xs">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{editVariant.productName}</p>
                  <p className="text-slate-500 mt-1">
                    Variant: <strong className="text-slate-700">{editVariant.colour}</strong> | Size:{' '}
                    <strong className="text-slate-700">{editVariant.size}</strong>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Available Quantity in Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newStockVal}
                    onChange={(e) => setNewStockVal(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-black text-lg text-emerald-800 text-center"
                  />
                  <p className="text-[11px] text-slate-400 text-center">
                    Changes reflect immediately on customer storefront checkout.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditVariant(null)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingStock}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    {savingStock && <Loader2 size={13} className="animate-spin" />}
                    <span>Save Stock</span>
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
