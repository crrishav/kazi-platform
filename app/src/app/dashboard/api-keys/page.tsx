'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Navigation from '@/components/Navigation';
import { Eye, EyeOff, Copy, Plus, Trash2 } from 'lucide-react';

export default function ApiKeysPage() {
  const [keys, setKeys]           = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newKey, setNewKey]       = useState<string | null>(null);
  const [copied, setCopied]       = useState(false);
  const [keyName, setKeyName]     = useState('');
  const [showForm, setShowForm]   = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchKeys();
  }, []);

  async function fetchKeys() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('api_keys').select('id, name, key_preview, is_active, last_used_at, created_at')
      .eq('user_id', user.id).order('created_at', { ascending: false });

    setKeys(data ?? []);
    setLoading(false);
  }

  async function generateKey() {
    if (!keyName.trim()) return;
    setGenerating(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const rawKey = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawKey));
    const hash    = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');

    await supabase.from('api_keys').insert({
      user_id:     user.id,
      name:        keyName.trim(),
      key_hash:    hash,
      key_preview: `${rawKey.slice(0, 8)}…${rawKey.slice(-4)}`,
      is_active:   true,
    });

    setNewKey(rawKey);
    setKeyName('');
    setShowForm(false);
    fetchKeys();
    setGenerating(false);
  }

  async function revokeKey(id: string) {
    await supabase.from('api_keys').update({ is_active: false }).eq('id', id);
    fetchKeys();
  }

  async function copyKey() {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-screen bg-cream">
      <Navigation />
      <div className="pt-28 pb-16 px-6 max-w-3xl mx-auto">

        <div className="mb-8">
          <Link href="/dashboard" className="font-inter text-xs text-text-muted hover:text-accent-warm tracking-nav transition-colors">
            ← Dashboard
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-inter text-xs text-text-muted uppercase tracking-nav mb-1">Developer</p>
            <h1 className="font-cinzel text-2xl text-espresso">API Keys</h1>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-espresso text-cream font-inter text-xs tracking-button uppercase px-4 py-2.5 hover:bg-accent-warm transition-colors duration-200">
            <Plus size={14} /> New Key
          </button>
        </div>

        {/* New key revealed */}
        {newKey && (
          <div className="bg-white border border-accent-warm px-5 py-4 mb-6">
            <p className="font-inter text-xs text-accent-warm uppercase tracking-nav mb-2">
              Copy your key now — it will not be shown again
            </p>
            <div className="flex items-center gap-3">
              <code className="flex-1 font-mono text-xs text-text-primary bg-cream px-3 py-2 truncate">
                {newKey}
              </code>
              <button onClick={copyKey}
                className="shrink-0 flex items-center gap-1.5 font-inter text-xs text-accent-warm hover:text-espresso transition-colors">
                <Copy size={14} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <button onClick={() => setNewKey(null)}
              className="mt-3 font-inter text-xs text-text-light hover:text-text-muted transition-colors">
              Dismiss
            </button>
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <div className="bg-white border border-rule px-5 py-5 mb-6">
            <h3 className="font-cinzel text-sm text-espresso mb-4">Create New Key</h3>
            <div className="flex gap-3">
              <input type="text" placeholder="Key name (e.g. Production, Staging)"
                value={keyName} onChange={e => setKeyName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generateKey()}
                className="flex-1 px-4 py-2.5 border border-rule bg-cream/40 font-inter text-sm text-text-primary focus:outline-none focus:border-accent-warm transition-colors" />
              <button onClick={generateKey} disabled={generating || !keyName.trim()}
                className="bg-espresso text-cream font-inter text-xs tracking-button uppercase px-4 py-2.5 hover:bg-accent-warm disabled:opacity-40 transition-colors">
                {generating ? 'Generating…' : 'Generate'}
              </button>
            </div>
          </div>
        )}

        {/* Keys list */}
        <div className="bg-white border border-rule">
          {loading ? (
            <div className="px-6 py-10 text-center font-inter text-sm text-text-muted">Loading…</div>
          ) : keys.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="font-inter text-sm text-text-muted mb-2">No API keys yet</p>
              <p className="font-inter text-xs text-text-light">Generate a key to access the REST API programmatically.</p>
            </div>
          ) : (
            keys.map((key, i) => (
              <div key={key.id} className={`flex items-center justify-between px-5 py-4 ${i < keys.length - 1 ? 'border-b border-rule' : ''}`}>
                <div>
                  <div className="font-inter text-sm font-medium text-text-primary">{key.name}</div>
                  <div className="font-mono text-xs text-text-muted mt-0.5">{key.key_preview}</div>
                  {key.last_used_at && (
                    <div className="font-inter text-xs text-text-light mt-0.5">
                      Last used {new Date(key.last_used_at).toLocaleDateString('en-GB')}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-inter text-xs uppercase tracking-wide px-2 py-0.5 border ${
                    key.is_active ? 'text-green-700 border-green-200 bg-green-50' : 'text-text-light border-rule'
                  }`}>{key.is_active ? 'Active' : 'Revoked'}</span>
                  {key.is_active && (
                    <button onClick={() => revokeKey(key.id)}
                      className="text-text-light hover:text-red-500 transition-colors" title="Revoke">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <p className="font-inter text-xs text-text-light mt-4">
          Use the API key in the <code className="font-mono bg-cream px-1">Authorization: Bearer {'<key>'}</code> header when calling <code className="font-mono bg-cream px-1">/api/v1/orders</code>.
        </p>
      </div>
    </main>
  );
}
