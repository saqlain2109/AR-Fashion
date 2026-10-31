import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminSidebar from '@/components/admin/AdminSidebar';
import Link from 'next/link';
import { ExternalLink, ShieldCheck, User } from 'lucide-react';

export const metadata = {
  title: 'Admin Dashboard | AR Fashion House',
  description: 'Enterprise Store Management Portal for AR Fashion House',
};

export default async function AdminLayout({ children }) {
  const cookieStore = cookies();
  const token = cookieStore.get('ar_admin_token')?.value;

  // Verify auth on server
  const user = token ? verifyToken(token) : null;

  // Allow login page without auth
  // In Next.js App Router, layouts wrap all sub-routes.
  // We can let child check or wrap conditionally.
  // But let's check pathname or pass user to sidebar.

  // Fetch category count for sidebar Masters badge
  let categoryCount = 0;
  if (user) {
    categoryCount = await prisma.category.count();
  }

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-800">
      {user ? (
        <>
          {/* Collapsible Accordion Sidebar (Rule 1) */}
          <AdminSidebar userRole={user.role || 'ADMIN'} categoryCount={categoryCount} />

          {/* Main Area Offset by Sidebar */}
          <div className="flex-1 flex flex-col min-w-0 pl-20 lg:pl-64 transition-all duration-300">
            {/* Topbar */}
            <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-emerald-600" />
                  <span className="font-extrabold text-slate-900 text-sm tracking-tight hidden sm:inline">
                    AR Fashion House
                  </span>
                </div>
                <span className="text-slate-300 hidden sm:inline">|</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Store Administration
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* View Live Storefront Button */}
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors"
                >
                  <ExternalLink size={14} />
                  <span>View Public Store</span>
                </Link>

                {/* Administrator Profile Pill */}
                <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-emerald-400 font-bold text-xs flex items-center justify-center">
                    {user.name ? user.name[0].toUpperCase() : 'A'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-slate-800 leading-tight">
                      {user.name || 'Store Owner'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
                  </div>
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </>
      ) : (
        <div className="w-full">{children}</div>
      )}
    </div>
  );
}
