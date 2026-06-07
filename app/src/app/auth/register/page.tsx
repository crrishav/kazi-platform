'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
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
      <main className="min-h-screen bg-cream flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 border border-rule-light flex items-center justify-center">
              <Mail className="w-7 h-7 text-accent-warm" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="font-cinzel text-2xl text-espresso mb-3">Check your email</h1>
          <p className="font-inter text-text-muted text-sm mb-8 max-w-xs mx-auto leading-relaxed">
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
    );
  }

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
            Create account
          </h1>
          <p className="font-inter text-text-muted text-sm">
            Join the Kazi Manufacturing community
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-rule px-8 py-9">

          {error && (
            <div className="mb-5 border border-red-200 bg-red-50 text-red-700 px-4 py-3 font-inter text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block font-inter text-xs tracking-nav text-text-muted uppercase mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border border-rule bg-cream/40 font-inter text-sm text-text-primary placeholder:text-text-light focus:outline-none focus:border-accent-warm transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block font-inter text-xs tracking-nav text-text-muted uppercase mb-1.5">
                Company <span className="normal-case text-text-light">(optional)</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-3 border border-rule bg-cream/40 font-inter text-sm text-text-primary placeholder:text-text-light focus:outline-none focus:border-accent-warm transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block font-inter text-xs tracking-nav text-text-muted uppercase mb-1.5">
                Email *
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
                Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-rule bg-cream/40 font-inter text-sm text-text-primary focus:outline-none focus:border-accent-warm transition-colors duration-200"
              />
              <p className="mt-1.5 font-inter text-xs text-text-light">Minimum 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-espresso text-cream font-inter text-xs tracking-button uppercase py-4 hover:bg-accent-warm disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-rule-light text-center font-inter text-sm text-text-muted">
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
