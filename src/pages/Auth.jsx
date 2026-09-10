// src/pages/Auth.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Auth = () => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        setInfo('Check your email to confirm your account, then log in.');
        setMode('login');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gray p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-soft p-8">
        <h1 className="text-3xl font-bold text-brand-charcoal mb-1">Vex</h1>
        <p className="text-gray-400 mb-6 text-sm">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          {info && <p className="text-sm text-green-600 font-medium">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-charcoal text-white p-3 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setInfo(''); }}
          className="w-full text-center text-sm text-gray-500 mt-5 hover:text-brand-charcoal transition-colors"
        >
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span className="font-bold text-brand-gold">{mode === 'login' ? 'Sign up' : 'Log in'}</span>
        </button>
      </div>
    </div>
  );
};

export default Auth;
