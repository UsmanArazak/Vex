// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { clearStorageCache } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    clearStorageCache();
    if (error) throw error;
  };

  const sendPasswordReset = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    setIsPasswordRecovery(false);
  };

  const markOnboarded = async () => {
    const { error } = await supabase.auth.updateUser({ data: { onboarded: true } });
    if (error) throw error;
  };

  const markIntroSeen = async () => {
    const { error } = await supabase.auth.updateUser({ data: { intro_seen: true } });
    if (error) throw error;
  };

  const updateIncomeEstimate = async (amount) => {
    const { error } = await supabase.auth.updateUser({ data: { monthly_income_estimate: amount } });
    if (error) throw error;
  };

  const value = {
    session,
    user: session?.user ?? null,
    isAdmin: session?.user?.app_metadata?.is_admin === true,
    loading,
    isPasswordRecovery,
    signUp,
    signIn,
    signOut,
    sendPasswordReset,
    updatePassword,
    markOnboarded,
    markIntroSeen,
    updateIncomeEstimate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
