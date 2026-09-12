// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';

const formatCurrency = (val) => `₦${Number(val || 0).toLocaleString()}`;

const StatCard = ({ label, value, accent }) => (
  <div className="card p-5 border border-gray-100 dark:border-brand-darkBorder shadow-sm">
    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-2xl font-black ${accent || 'text-brand-charcoal dark:text-white'}`}>{value}</p>
  </div>
);

const AdminDashboard = ({ onSwitchToPersonal, onSignOut }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-stats`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load admin stats');
      setStats(json);
    } catch (err) {
      setError(err.message || 'Something went wrong');
      toast.error('Could not load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const signupDays = stats ? stats.signup_trend.map(t => [t.day, t.count]) : [];
  const maxSignups = Math.max(...signupDays.map(([, v]) => v), 1);

  return (
    <div className="min-h-screen bg-brand-gray dark:bg-brand-dark">
      <div className="max-w-5xl mx-auto p-6 pt-10 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-charcoal flex items-center justify-center shrink-0">
              <span className="font-black text-brand-gold text-base">A</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-brand-charcoal dark:text-white">Admin Dashboard</h1>
              <p className="text-xs text-gray-400 dark:text-gray-500">Mopal — internal metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onSwitchToPersonal}
              className="text-sm font-bold px-4 py-2 rounded-xl bg-white dark:bg-brand-darkCard border border-gray-200 dark:border-brand-darkBorder text-brand-charcoal dark:text-white hover:bg-gray-50 transition-colors"
            >
              My Account
            </button>
            <button
              onClick={onSignOut}
              className="text-sm font-bold px-4 py-2 rounded-xl bg-gray-100 dark:bg-brand-darkBorder text-brand-charcoal dark:text-white hover:bg-gray-200 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-20">
            <p className="text-gray-400 dark:text-gray-500 font-medium">Loading admin data…</p>
          </div>
        )}

        {!loading && error && (
          <div className="card p-6 border border-red-100 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/20 text-center">
            <p className="text-red-500 font-semibold mb-3">{error}</p>
            <button onClick={load} className="btn-primary px-6">Retry</button>
          </div>
        )}

        {!loading && stats && (
          <div className="space-y-8">
            {/* Overview */}
            <div>
              <h2 className="font-bold text-lg text-brand-charcoal dark:text-white mb-3">Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <StatCard label="Total Users" value={stats.total_users} />
                <StatCard label="Transactions" value={stats.total_transactions.toLocaleString()} />
                <StatCard label="Total Volume" value={formatCurrency(stats.total_volume)} accent="text-brand-goldDark dark:text-brand-gold" />
                <StatCard label="Active Today" value={stats.dau} accent="text-success" />
                <StatCard label="Active This Week" value={stats.wau} accent="text-info" />
              </div>
            </div>

            {/* Signup trend */}
            <div>
              <h2 className="font-bold text-lg text-brand-charcoal dark:text-white mb-3">Signups (Last 30 Days)</h2>
              <div className="card p-5 border border-gray-100 dark:border-brand-darkBorder shadow-sm">
                {signupDays.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No signups in the last 30 days.</p>
                ) : (
                  <div className="flex items-end gap-1 h-32 overflow-x-auto">
                    {signupDays.map(([day, count]) => (
                      <div key={day} className="flex flex-col items-center gap-1 min-w-[10px] flex-1" title={`${day}: ${count}`}>
                        <div className="w-full bg-brand-gold rounded-t" style={{ height: `${Math.max(8, (count / maxSignups) * 100)}%` }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Feature adoption */}
            <div>
              <h2 className="font-bold text-lg text-brand-charcoal dark:text-white mb-3">Feature Adoption</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  ['Budgets', stats.users_with_budgets],
                  ['Recurring', stats.users_with_recurring],
                  ['Goals', stats.users_with_goals],
                ].map(([label, count]) => {
                  const pct = stats.total_users > 0 ? Math.round((count / stats.total_users) * 100) : 0;
                  return (
                    <div key={label} className="card p-4 border border-gray-100 dark:border-brand-darkBorder shadow-sm text-center">
                      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{label}</p>
                      <p className="text-xl font-black text-brand-charcoal dark:text-white mb-1">{pct}%</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{count} of {stats.total_users} users</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* User list */}
            <div>
              <h2 className="font-bold text-lg text-brand-charcoal dark:text-white mb-3">Users</h2>
              <div className="card border border-gray-100 dark:border-brand-darkBorder shadow-sm overflow-x-auto p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-brand-darkBorder text-left">
                      <th className="p-3 font-bold text-gray-400 dark:text-gray-500 text-xs uppercase">Email</th>
                      <th className="p-3 font-bold text-gray-400 dark:text-gray-500 text-xs uppercase">Joined</th>
                      <th className="p-3 font-bold text-gray-400 dark:text-gray-500 text-xs uppercase">Last Active</th>
                      <th className="p-3 font-bold text-gray-400 dark:text-gray-500 text-xs uppercase text-right">Transactions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.users.map((u) => (
                      <tr key={u.email} className="border-b border-gray-50 dark:border-brand-darkBorder last:border-0">
                        <td className="p-3 text-brand-charcoal dark:text-white font-medium truncate max-w-[200px]">{u.email}</td>
                        <td className="p-3 text-gray-500 dark:text-gray-400">{new Date(u.joined_at).toLocaleDateString()}</td>
                        <td className="p-3 text-gray-500 dark:text-gray-400">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : '—'}</td>
                        <td className="p-3 text-right font-bold text-brand-charcoal dark:text-white">{u.transaction_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
