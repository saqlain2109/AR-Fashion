'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  FolderTree,
  Clock,
  CheckCheck,
  TrendingUp,
  PlusCircle,
  Boxes,
  ShoppingBag,
  ArrowRight,
  Eye,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState(
    (typeof window !== 'undefined' && (window.__STORE_CURRENCY_SYMBOL__ || localStorage.getItem('ar_currency_symbol'))) || '₹'
  );

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('ar_admin_token') : null;
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/dashboard/stats', { headers, credentials: 'include' });
      if (res.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('ar_admin_token');
          window.location.href = '/admin/login';
        }
        return;
      }
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
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

  const handleSeedCatalog = async () => {
    try {
      setSeeding(true);
      setSeedMessage('');
      const token = typeof window !== 'undefined' ? localStorage.getItem('ar_admin_token') : null;
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/seed', {
        method: 'POST',
        headers,
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Seed failed');
      setSeedMessage('Sample boutique catalog loaded successfully!');
      await fetchStats();
      setTimeout(() => setSeedMessage(''), 5000);
    } catch (err) {
      alert(err.message || 'Failed to seed catalog');
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const metricCards = [
    {
      label: 'Total Products',
      value: stats?.totalProducts ?? 0,
      icon: Package,
      color: 'text-blue-600',
      bg: 'bg-blue-50 border-blue-100',
      href: '/admin/products',
    },
    {
      label: 'Active Products',
      value: stats?.activeProducts ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100',
      href: '/admin/products?status=PUBLISHED',
    },
    {
      label: 'Out-of-Stock Products',
      value: stats?.outOfStockProducts ?? 0,
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50 border-rose-100',
      href: '/admin/inventory?status=out',
    },
    {
      label: 'Total Categories',
      value: stats?.totalCategories ?? 0,
      icon: FolderTree,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 border-indigo-100',
      href: '/admin/categories',
    },
    {
      label: 'Pending Orders',
      value: stats?.pendingOrders ?? 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-100',
      href: '/admin/orders?status=PENDING',
    },
    {
      label: 'Confirmed Orders',
      value: stats?.confirmedOrders ?? 0,
      icon: CheckCheck,
      color: 'text-teal-600',
      bg: 'bg-teal-50 border-teal-100',
      href: '/admin/orders?status=CONFIRMED',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Store Dashboard</h1>
          <p className="text-xs text-slate-500">
            Real-time operational summary & live database statistics for AR Fashion House.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchStats}
            title="Refresh Metrics"
            className="p-2 border border-slate-300 rounded-xl bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleSeedCatalog}
            disabled={seeding}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 hover:border-emerald-600 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            title="Populate initial categories, sample products and store settings"
          >
            <Sparkles size={14} className={seeding ? 'animate-spin text-emerald-600' : 'text-amber-500'} />
            <span>{seeding ? 'Loading Catalog...' : 'Seed Sample Catalog'}</span>
          </button>

          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all"
          >
            <PlusCircle size={16} />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {seedMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{seedMessage}</span>
        </div>
      )}

      {/* Zero Catalog Alert Banner (Shown if fresh deployment or wiped DB) */}
      {!loading && stats && stats.totalProducts === 0 && stats.totalCategories === 0 && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">Live Database Is Fresh & Empty</h3>
              <p className="text-xs text-amber-700">
                Total products and categories are currently 0. You can populate the entire boutique catalog with 1 click.
              </p>
            </div>
          </div>
          <button
            onClick={handleSeedCatalog}
            disabled={seeding}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all shrink-0 flex items-center gap-2"
          >
            <Sparkles size={14} />
            <span>{seeding ? 'Seeding Catalog...' : '⚡ Populate Full Boutique Catalog'}</span>
          </button>
        </div>
      )}

      {/* 1. Mandatory 6 Primary Metric Cards (Rule A) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metricCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={i}
              href={card.href}
              className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] hover:shadow-md bg-white ${card.bg}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {card.label}
                </span>
                <Icon size={18} className={card.color} />
              </div>
              <p className="text-2xl font-black text-slate-900">
                {loading ? '...' : card.value}
              </p>
            </Link>
          );
        })}
      </div>

      {/* 2. Revenue & Quick Action Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total Revenue Card */}
        <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <TrendingUp size={16} />
              <span>Confirmed Store Revenue</span>
            </div>
            <h3 className="text-3xl font-black text-white">
              {loading ? '...' : formatPrice(stats?.totalRevenue ?? 0, currencySymbol)}
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Calculated from confirmed, processing, shipped, and completed WhatsApp orders.
            </p>
          </div>

          <div className="pt-6 mt-4 border-t border-slate-700/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">Total orders in DB:</span>
            <span className="font-bold text-white text-sm">
              {(stats?.recentOrders?.length || 0)} shown
            </span>
          </div>
        </div>

        {/* Quick Operations Shortcuts */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Quick Operational Actions</h3>
            <p className="text-xs text-slate-500 mb-4">
              Instantly manage products, stock variations, or inspect WhatsApp orders.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/admin/products/new"
              className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-all flex flex-col justify-between group"
            >
              <PlusCircle size={22} className="text-emerald-600 mb-2" />
              <div>
                <p className="text-xs font-extrabold text-slate-800 group-hover:text-emerald-700">
                  Add New Product
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Upload photos & variants</p>
              </div>
            </Link>

            <Link
              href="/admin/inventory"
              className="p-4 rounded-2xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-all flex flex-col justify-between group"
            >
              <Boxes size={22} className="text-blue-600 mb-2" />
              <div>
                <p className="text-xs font-extrabold text-slate-800 group-hover:text-blue-700">
                  Inventory & Stock
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Quick stock quantity updates</p>
              </div>
            </Link>

            <Link
              href="/admin/orders"
              className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-all flex flex-col justify-between group"
            >
              <ShoppingBag size={22} className="text-amber-600 mb-2" />
              <div>
                <p className="text-xs font-extrabold text-slate-800 group-hover:text-amber-700">
                  Orders Management
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Inspect & update statuses</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Recent Orders Table (Rule A) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Recent WhatsApp Orders</h3>
            <p className="text-xs text-slate-500">
              Latest incoming checkout orders awaiting owner review.
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors"
          >
            <span>View All Orders</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading recent orders...
                  </td>
                </tr>
              ) : !stats?.recentOrders || stats.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                    No orders recorded yet. Place an order on the storefront to test!
                  </td>
                </tr>
              ) : (
                stats.recentOrders.map((order) => {
                  let badgeColor = 'bg-amber-100 text-amber-800';
                  if (order.status === 'CONFIRMED') badgeColor = 'bg-teal-100 text-teal-800';
                  else if (order.status === 'SHIPPED') badgeColor = 'bg-blue-100 text-blue-800';
                  else if (order.status === 'DELIVERED') badgeColor = 'bg-emerald-100 text-emerald-800';
                  else if (order.status === 'CANCELLED') badgeColor = 'bg-rose-100 text-rose-800';

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800">{order.customerName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{order.customerPhone}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {order.items?.length || 0} item(s)
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatPrice(order.total, currencySymbol)}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${badgeColor}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Link
                          href={`/admin/orders`}
                          className="inline-flex p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Open in Orders Management"
                        >
                          <Eye size={15} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
