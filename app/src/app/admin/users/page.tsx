'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Navigation from '@/components/Navigation';

const ROLES = ['customer', 'employee', 'admin'];

export default function AdminUsersPage() {
  const [users,   setUsers]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    const { data } = await supabase
      .from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data ?? []);
    setLoading(false);
  }

  async function updateRole(id: string, role: string) {
    setSaving(id);
    await supabase.from('profiles').update({ role }).eq('id', id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    setSaving(null);
  }

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-white">
      <Navigation />

      <div className="pt-28 pb-16 px-6 max-w-5xl mx-auto">

        <div className="mb-6">
          <Link href="/admin" className="text-xs text-gray-500 hover:text-[#E5232A] tracking-widest uppercase transition-colors"
            style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>← Admin</Link>
        </div>

        <div className="mb-8">
          <p className="text-[11px] text-[#E5232A] tracking-[0.2em] uppercase mb-2"
            style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>ADMIN — USERS</p>
          <h1 className="font-cinzel text-3xl text-white">Users ({users.length})</h1>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading…</div>
        ) : (
          <div className="border border-[#1E1E24] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1E1E24] bg-[#111114]">
                  {['Name', 'Email', 'Company', 'Role', 'Joined'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-normal text-[10px] text-gray-500 tracking-widest uppercase"
                      style={{ fontFamily: "'SF Mono','Fira Code','Consolas',monospace" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id} className="border-b border-[#1E1E24] last:border-0 hover:bg-[#111114] transition-colors">
                    <td className="px-5 py-3 text-gray-300">{u.full_name ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{u.email ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{u.company_name ?? '—'}</td>
                    <td className="px-5 py-3">
                      <select value={u.role} disabled={saving === u.id}
                        onChange={e => updateRole(u.id, e.target.value)}
                        className="bg-[#111114] border border-[#1E1E24] text-gray-300 text-xs px-2 py-1.5 focus:border-[#E5232A]/60 outline-none cursor-pointer hover:border-gray-600 transition-colors">
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {new Date(u.created_at).toLocaleDateString('en-GB')}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-600">No users yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
