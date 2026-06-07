'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
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
            We&apos;ve sent a password reset link to{' '}
            <strong className="text-text-primary">{email}</strong>.
          </p>
          <Link
            href="/auth/login"
            className="font-inter text-xs tracking-button uppercase text-accent-warm hover:text-espresso transition-colors duration-200"
          >
            ← Back to login
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
            Sukkha Citta
          </Link>
          <h1 className="font-cinzel text-2xl text-espresso mt-5 mb-1">
            Reset password
          </h1>
          <p className="font-inter text-text-muted text-sm">
            Enter your email and we&apos;ll send a reset link
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-rule px-8 py-9">

          {error && (
            <div className="mb-5 border border-red-200 bg-red-50 text-red-700 px-4 py-3 font-inter text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-espresso text-cream font-inter text-xs tracking-button uppercase py-4 hover:bg-accent-warm disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-7 pt-6 border-t border-rule-light text-center">
            <Link
              href="/auth/login"
              className="font-inter text-xs text-accent-warm hover:text-espresso tracking-nav transition-colors duration-200"
            >
              ← Back to login
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
