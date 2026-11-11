'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldCheck, ArrowRight, Loader2, AlertCircle, Eye, EyeOff, Crown } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      // Successful login
      if (data.token && typeof window !== 'undefined') {
        localStorage.setItem('ar_admin_token', data.token);
      }
      router.push('/admin/dashboard');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060608] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle royal gold ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#0E0E14] border border-amber-500/30 rounded-3xl p-7 sm:p-8 shadow-2xl shadow-black text-stone-100">
        {/* Brand Crest */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden border border-amber-500/30 bg-black flex items-center justify-center shadow-lg shadow-amber-500/10 mb-3">
            <img
              src="/images/ar-fashion-logo.jpg"
              alt="AR Fashion House"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="font-royal-title text-xl sm:text-2xl font-black tracking-[0.14em] uppercase gold-gradient-text">
            AR FASHION HOUSE
          </h1>
          <p className="text-[11px] text-amber-300/80 mt-1 uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5">
            <Crown size={12} className="text-amber-400" />
            <span>Authorized Admin Portal</span>
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-semibold rounded-xl flex items-center gap-2.5 animate-shake">
            <AlertCircle size={16} className="shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300">Administrator Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400/70" />
              <input
                type="email"
                name="ar_admin_email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter administrator email"
                className="w-full pl-10 pr-4 py-2.5 bg-[#14141C] border border-white/10 rounded-xl text-sm text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-300">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400/70" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="ar_admin_pass"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-11 py-2.5 bg-[#14141C] border border-white/10 rounded-xl text-sm text-white placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-amber-300 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 gold-gradient-btn text-black font-black rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 uppercase tracking-wider cursor-pointer"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Security Notice (No hardcoded or exposed credentials) */}
        <div className="mt-7 pt-5 border-t border-white/5 text-center">
          <p className="text-[11px] text-stone-500 flex items-center justify-center gap-1.5">
            <ShieldCheck size={14} className="text-amber-400 shrink-0" />
            <span>Protected Administrator Access Only. Unauthorized login attempts are restricted.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
