'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const searchParams = useSearchParams();
  const redirect     = searchParams.get('redirect') || '/';
  const supabase     = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = redirect;
    }
  };

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-10">
          <Link
            href="/"
            className="font-cinzel tracking-logo text-espresso text-base uppercase hover:text-accent-warm transition-colors duration-200"
          >
            Kazi Manufacturing
          </Link>
          <h1 className="font-cinzel text-2xl text-espresso mt-5 mb-1">
            Welcome back
          </h1>
          <p className="font-inter text-text-muted text-sm">
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-rule px-8 py-9">

          {error && (
            <div className="mb-5 border border-red-200 bg-red-50 text-red-700 px-4 py-3 font-inter text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block font-inter text-xs tracking-nav text-text-muted uppercase mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-rule bg-cream/40 font-inter text-sm text-text-primary placeholder:text-text-light focus:outline-none focus:border-accent-warm transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block font-inter text-xs tracking-nav text-text-muted uppercase mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-rule bg-cream/40 font-inter text-sm text-text-primary focus:outline-none focus:border-accent-warm transition-colors duration-200"
              />
            </div>

            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="font-inter text-xs text-text-muted hover:text-accent-warm transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-espresso text-cream font-inter text-xs tracking-button uppercase py-4 hover:bg-accent-warm disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-rule-light text-center font-inter text-sm text-text-muted">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              className="text-accent-warm hover:text-espresso transition-colors duration-200"
            >
              Create account
            </Link>
          </div>
        </div>

        {/* Back to store */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="font-inter text-xs text-text-light hover:text-text-muted tracking-nav transition-colors duration-200"
          >
            ← Return to store
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <span className="font-cinzel text-text-muted text-sm tracking-widest uppercase">Loading…</span>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
