'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Navigation from '@/components/Navigation';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';

export default function RegisterPage() {
  useSmoothScroll();
  const [fullName, setFullName] = useState('');
  const [company, setCompany]   = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);

  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          company_name: company,
          role: 'customer',
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Fire welcome email — non-blocking
      fetch('/api/welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: fullName }),
      }).catch(() => {});
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <>
        <Navigation />
        <main className="h-screen overflow-hidden bg-cream flex items-center justify-center px-6 pt-20 pb-3">
          <div className="w-full max-w-md text-center">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 border border-rule-light flex items-center justify-center">
                <Mail className="w-6 h-6 text-accent-warm" strokeWidth={1.5} />
              </div>
            </div>
            <h1 className="font-cinzel text-xl text-espresso mb-2">Check your email</h1>
            <p className="font-inter text-text-muted text-sm mb-5 max-w-xs mx-auto leading-relaxed">
              We&apos;ve sent a confirmation link to <strong className="text-text-primary">{email}</strong>.
              Click it to activate your account.
            </p>
            <Link
              href="/auth/login"
              className="font-inter text-xs tracking-button uppercase text-accent-warm hover:text-espresso transition-colors duration-200"
            >
              Go to login →
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="h-screen overflow-hidden bg-cream flex items-center justify-center px-6 pt-20 pb-3">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="text-center mb-3">
          <Link
            href="/"
            className="font-cinzel tracking-logo text-espresso text-sm uppercase hover:text-accent-warm transition-colors duration-200"
          >
            Kazi Manufacturing
          </Link>
          <h1 className="font-cinzel text-lg text-espresso mt-1.5 mb-0.5">
            Create account
          </h1>
          <p className="font-inter text-text-muted text-xs">
            Join the Kazi Manufacturing community
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-rule px-7 py-4">

          {error && (
            <div className="mb-2.5 border border-red-200 bg-red-50 text-red-700 px-4 py-2 font-inter text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-2.5">
            <div>
              <label className="block font-inter text-xs tracking-nav text-text-muted uppercase mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-rule bg-cream/40 font-inter text-sm text-text-primary placeholder:text-text-light focus:outline-none focus:border-accent-warm transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block font-inter text-xs tracking-nav text-text-muted uppercase mb-1">
                Company <span className="normal-case text-text-light">(optional)</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-2 border border-rule bg-cream/40 font-inter text-sm text-text-primary placeholder:text-text-light focus:outline-none focus:border-accent-warm transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block font-inter text-xs tracking-nav text-text-muted uppercase mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-rule bg-cream/40 font-inter text-sm text-text-primary placeholder:text-text-light focus:outline-none focus:border-accent-warm transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block font-inter text-xs tracking-nav text-text-muted uppercase mb-1">
                Password * <span className="normal-case text-text-light">(min. 6 characters)</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-rule bg-cream/40 font-inter text-sm text-text-primary focus:outline-none focus:border-accent-warm transition-colors duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-espresso text-cream font-inter text-xs tracking-button uppercase py-3 hover:bg-accent-warm disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="mt-3 pt-3 border-t border-rule-light text-center font-inter text-sm text-text-muted">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-accent-warm hover:text-espresso transition-colors duration-200"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Back to store */}
        <div className="mt-2 text-center">
          <Link
            href="/"
            className="font-inter text-xs text-text-light hover:text-text-muted tracking-nav transition-colors duration-200"
          >
            ← Return to store
          </Link>
        </div>
      </div>
      </main>
    </>
  );
}
