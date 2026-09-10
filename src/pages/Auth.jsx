// src/pages/Auth.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const EyeIcon = ({ open }) => (
  open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 0 1-4.24-4.24" />
      <path d="M6.61 6.61A18.5 18.5 0 0 0 1 12s4 8 11 8a10.43 10.43 0 0 0 5.39-1.61" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
);

const Auth = () => {
  const { signIn, signUp, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setInfo('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (mode === 'signup' && password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else if (mode === 'signup') {
        await signUp(email, password);
        // No email confirmation required — signUp signs the user in directly,
        // AuthContext picks up the new session and the app takes over from here.
      } else if (mode === 'forgot') {
        await sendPasswordReset(email);
        setInfo("If that email has an account, we've sent a password reset link.");
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gray dark:bg-brand-dark p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-brand-gold/40 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-28 -right-16 w-96 h-96 bg-brand-gold/25 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-1/4 right-6 md:right-16 w-16 h-16 md:w-24 md:h-24 border-[3px] border-brand-gold/50 rounded-3xl rotate-12 pointer-events-none" />
      <div className="absolute bottom-1/4 left-6 md:left-16 w-10 h-10 md:w-16 md:h-16 border-[3px] border-brand-charcoal/25 dark:border-white/25 rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-8 w-3 h-3 bg-brand-gold/60 rounded-full hidden md:block pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-2.5 h-2.5 bg-brand-charcoal/20 dark:bg-white/20 rounded-full hidden md:block pointer-events-none" />

      <div className="w-full max-w-sm bg-white dark:bg-brand-darkCard rounded-3xl shadow-soft p-8 relative z-10">
        <h1 className="text-3xl font-bold text-brand-charcoal dark:text-white mb-1">Mopal</h1>
        <p className="text-gray-400 dark:text-gray-500 mb-6 text-sm">
          {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset your password'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-brand-darkBorder focus:outline-none focus:ring-2 focus:ring-brand-gold"
              placeholder="you@example.com"
            />
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pr-11 rounded-xl border border-gray-200 dark:border-brand-darkBorder focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-brand-charcoal transition-colors"
                  tabIndex={-1}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-xs font-semibold text-gray-400 dark:text-gray-500 hover:text-brand-goldDark dark:hover:text-brand-gold mt-2 transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Confirm Password</label>
              <div className="relative mt-1">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 pr-11 rounded-xl border border-gray-200 dark:border-brand-darkBorder focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-brand-charcoal transition-colors"
                  tabIndex={-1}
                >
                  <EyeIcon open={showConfirmPassword} />
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          {info && <p className="text-sm text-success font-medium">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-charcoal text-white p-3 rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : mode === 'signup' ? 'Sign Up' : 'Send Reset Link'}
          </button>
        </form>

        {mode === 'forgot' ? (
          <button
            onClick={() => switchMode('login')}
            className="w-full text-center text-sm text-gray-500 dark:text-gray-400 mt-5 hover:text-brand-charcoal dark:hover:text-white transition-colors"
          >
            <span className="font-bold text-brand-gold">Back to log in</span>
          </button>
        ) : (
          <button
            onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
            className="w-full text-center text-sm text-gray-500 dark:text-gray-400 mt-5 hover:text-brand-charcoal dark:hover:text-white transition-colors"
          >
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <span className="font-bold text-brand-gold">{mode === 'login' ? 'Sign up' : 'Log in'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Auth;
