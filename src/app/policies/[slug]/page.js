import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Shield, Truck, RotateCcw, Scale, Crown } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const policy = await prisma.policy.findUnique({
    where: { slug: params.slug },
  });

  if (!policy) return { title: 'Policy | AR Fashion House' };

  return {
    title: `${policy.title} | AR Fashion House`,
  };
}

export default async function PolicyDetailPage({ params }) {
  const [settings, policy, allPolicies] = await Promise.all([
    prisma.storeSettings.findUnique({ where: { id: 'default' } }),
    prisma.policy.findUnique({ where: { slug: params.slug } }),
    prisma.policy.findMany({ orderBy: { title: 'asc' } }),
  ]);

  if (!policy) {
    notFound();
  }

  const icons = {
    'privacy-policy': Shield,
    'shipping-policy': Truck,
    'return-policy': RotateCcw,
    'terms-conditions': Scale,
  };
  const Icon = icons[policy.slug] || Shield;

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-stone-100 overflow-x-hidden">
      <StoreHeader settings={settings} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-400 font-medium mb-6">
          <Link href="/" className="hover:text-amber-300 transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-stone-300 font-bold">Policies</span>
          <span>/</span>
          <span className="text-amber-400 font-bold">{policy.title}</span>
        </div>

        {/* Policy Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {allPolicies.map((p) => (
            <Link
              key={p.slug}
              href={`/policies/${p.slug}`}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                p.slug === policy.slug
                  ? 'gold-gradient-btn text-black shadow-md font-black'
                  : 'bg-[#121218] text-stone-300 hover:text-white border border-white/5'
              }`}
            >
              {p.title}
            </Link>
          ))}
        </div>

        {/* Content Card */}
        <article className="bg-[#0E0E14] rounded-3xl border border-amber-500/20 p-8 sm:p-12 shadow-2xl space-y-6">
          <div className="border-b border-white/5 pb-5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-4">
              <Icon size={24} />
            </div>
            <h1 className="font-royal-title text-2xl sm:text-3xl font-black text-white tracking-tight">
              {policy.title}
            </h1>
            <p className="text-xs text-stone-400 mt-1">
              Last updated on: {formatDate(policy.updatedAt)} &bull; Official AR Fashion House Policy
            </p>
          </div>

          <div className="prose prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-stone-300 whitespace-pre-line space-y-4 font-normal">
            {policy.content}
          </div>
        </article>
      </main>

      <StoreFooter settings={settings} />
    </div>
  );
}
