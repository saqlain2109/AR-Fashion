'use client';
import { useState, useEffect } from 'react';
import UniversalDataTable from '@/components/admin/UniversalDataTable';
import Portal from '@/components/ui/Portal';
import {
  ShoppingBag,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  CheckCheck,
  XCircle,
  Printer,
  FileText,
  Save,
  X,
  Loader2,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Order Details Drawer/Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusVal, setStatusVal] = useState('PENDING');
  const [internalNotesVal, setInternalNotesVal] = useState('');
  const [savingOrder, setSavingOrder] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState(
    (typeof window !== 'undefined' && (window.__STORE_CURRENCY_SYMBOL__ || localStorage.getItem('ar_currency_symbol'))) || '₹'
  );

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = selectedStatusFilter !== 'ALL'
        ? `/api/orders?status=${selectedStatusFilter}`
        : '/api/orders';

      const token = typeof window !== 'undefined' ? localStorage.getItem('ar_admin_token') : null;
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, { headers, credentials: 'include' });
      const data = await res.json();
      if (data.success && data.orders) {
        setOrders(data.orders);
      }

      const sRes = await fetch('/api/settings');
      const sData = await sRes.json();
      if (sData.success && sData.settings?.currencySymbol) {
        setCurrencySymbol(sData.settings.currencySymbol);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatusFilter]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const openOrderDrawer = (order) => {
    setSelectedOrder(order);
    setStatusVal(order.status);
    setInternalNotesVal(order.internalNotes || '');
  };

  const handleSaveOrderChanges = async () => {
    if (!selectedOrder) return;
    setSavingOrder(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('ar_admin_token') : null;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          status: statusVal,
          internalNotes: internalNotesVal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Order ${selectedOrder.orderNumber} updated!`);
        setSelectedOrder(data.order);
        fetchOrders();
      } else {
        alert(data.error || 'Failed to update order');
      }
    } catch (e) {
      alert('Error updating order');
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDeleteOrder = async (order) => {
    try {
      const res = await fetch(`/api/orders/${order.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast(`Order deleted`);
        fetchOrders();
      }
    } catch (e) {
      alert('Failed to delete order');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      key: 'orderNumber',
      label: 'Order ID',
      sortable: true,
      render: (val) => (
        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
          {val}
        </span>
      ),
    },
    {
      key: 'customerName',
      label: 'Customer Name',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-bold text-slate-800">{val}</p>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">{row.customerPhone}</p>
        </div>
      ),
    },
    {
      key: 'itemsSummary',
      label: 'Ordered Items',
      sortable: false,
      render: (_, row) => (
        <div>
          <p className="font-semibold text-slate-800">
            {row.items?.length || 0} product(s)
          </p>
          <p className="text-[11px] text-slate-400 truncate max-w-xs">
            {row.items?.map((i) => `${i.productName} (${i.colour}-${i.size}) x${i.quantity}`).join(', ')}
          </p>
        </div>
      ),
    },
    {
      key: 'city',
      label: 'Delivery City',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-700">{val}</span>
          <p className="text-[10px] text-slate-400 truncate max-w-xs">{row.deliveryAddress}</p>
        </div>
      ),
    },
    {
      key: 'total',
      label: 'Estimated Total',
      sortable: true,
      render: (val) => <span className="font-black text-slate-900">{formatPrice(val, currencySymbol)}</span>,
    },
    {
      key: 'status',
      label: 'Order Status',
      sortable: true,
      render: (val) => {
        let badge = 'bg-amber-100 text-amber-800 border-amber-200';
        if (val === 'CONFIRMED') badge = 'bg-teal-100 text-teal-800 border-teal-200';
        else if (val === 'PROCESSING') badge = 'bg-indigo-100 text-indigo-800 border-indigo-200';
        else if (val === 'SHIPPED') badge = 'bg-blue-100 text-blue-800 border-blue-200';
        else if (val === 'DELIVERED') badge = 'bg-emerald-100 text-emerald-800 border-emerald-200';
        else if (val === 'CANCELLED') badge = 'bg-rose-100 text-rose-800 border-rose-200';

        return (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border tracking-wider ${badge}`}>
            {val}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Order Date',
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
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order Management</h1>
          <p className="text-xs text-slate-500">
            Review incoming WhatsApp checkout orders, update delivery statuses, add internal notes, and print receipts.
          </p>
        </div>

        {/* Status Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                selectedStatusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'ALL' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Universal Data Table */}
      <UniversalDataTable
        title="Orders"
        data={orders}
        columns={columns}
        defaultSortKey="createdAt"
        defaultSortDir="desc"
        onView={(ord) => openOrderDrawer(ord)}
        onEdit={(ord) => openOrderDrawer(ord)}
        onDelete={(ord) => handleDeleteOrder(ord)}
      />

      {/* Order Details & Status Drawer (Portal) */}
      {selectedOrder && (
        <Portal>
          <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-xs flex justify-end">
            <div className="bg-white w-full max-w-2xl h-full shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
              {/* Drawer Top Header */}
              <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={20} className="text-emerald-400" />
                    <h3 className="font-black text-base tracking-tight">
                      Order: {selectedOrder.orderNumber}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Placed on {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    title="Print Summary / Invoice"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  >
                    <Printer size={16} />
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700 printable-area">
                {/* 1. Status & WhatsApp Direct Contact */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="font-bold text-slate-800 text-sm">Update Order Status:</label>
                    <select
                      value={statusVal}
                      onChange={(e) => setStatusVal(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-xs"
                    >
                      <option value="PENDING">Pending WhatsApp Confirmation</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
                    <a
                      href={`https://wa.me/${selectedOrder.customerPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white font-bold rounded-xl text-xs hover:bg-[#20ba59] transition-colors"
                    >
                      <MessageSquare size={14} />
                      <span>Chat Customer on WhatsApp</span>
                    </a>
                    <span className="text-slate-400 text-[11px]">
                      Customer Phone: <strong>{selectedOrder.customerPhone}</strong>
                    </span>
                  </div>
                </div>

                {/* 2. Customer & Delivery Information */}
                <div className="border border-slate-200 rounded-2xl p-4 space-y-2 bg-white">
                  <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
                    Customer & Shipping Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Customer Name:</span>
                      <strong className="text-slate-800">{selectedOrder.customerName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Phone / WhatsApp:</span>
                      <strong className="text-slate-800 font-mono">{selectedOrder.customerPhone}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">City:</span>
                      <strong className="text-slate-800">{selectedOrder.city}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Postal Code:</span>
                      <strong className="text-slate-800">{selectedOrder.postalCode || 'N/A'}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block">Delivery Address:</span>
                      <p className="text-slate-800 font-medium">{selectedOrder.deliveryAddress}</p>
                    </div>
                    {selectedOrder.notes && (
                      <div className="col-span-2 p-2 bg-amber-50 rounded-xl border border-amber-200">
                        <span className="font-bold text-amber-800 block">Customer Instructions:</span>
                        <p className="text-amber-900">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Ordered Items List */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
                    Ordered Products ({selectedOrder.items?.length || 0})
                  </h4>

                  <div className="divide-y divide-slate-100">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border shrink-0">
                            {item.productImage ? (
                              <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-400">
                                No Img
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{item.productName}</p>
                            <p className="text-[11px] text-slate-500">
                              Colour: <strong>{item.colour}</strong> | Size: <strong>{item.size}</strong>
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-extrabold text-slate-900">
                            {formatPrice(item.totalPrice, currencySymbol)}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {item.quantity} × {formatPrice(item.unitPrice, currencySymbol)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal:</span>
                      <span className="font-bold text-slate-800">{formatPrice(selectedOrder.subtotal, currencySymbol)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Delivery Fee:</span>
                      <span className="font-bold text-slate-800">
                        {selectedOrder.shippingCharge === 0 ? 'FREE' : formatPrice(selectedOrder.shippingCharge, currencySymbol)}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                      <span>Estimated Total:</span>
                      <span className="text-emerald-700">{formatPrice(selectedOrder.total, currencySymbol)}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Internal Notes Editor */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-indigo-600" />
                    <h4 className="font-bold text-slate-800 text-sm">Internal Staff Notes</h4>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Add notes regarding payment confirmation, courier consignment numbers, or customer communication.
                  </p>
                  <textarea
                    rows={3}
                    value={internalNotesVal}
                    onChange={(e) => setInternalNotesVal(e.target.value)}
                    placeholder="e.g. Courier tracking #DELHIVERY-8849. Paid advance UPI ₹500..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleSaveOrderChanges}
                  disabled={savingOrder}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {savingOrder ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span>Save Order Updates</span>
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
