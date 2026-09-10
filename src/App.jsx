import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import Debts from './pages/Debts';
import Me from './pages/Me';
import Auth from './pages/Auth';
import IntroCarousel from './pages/IntroCarousel';
import ResetPassword from './pages/ResetPassword';
import Onboarding from './pages/Onboarding';
import TransactionModal from './components/TransactionModal';
import { useAuth } from './context/AuthContext';
import { runDueRecurringRules } from './utils/storage';
import { useToast } from './context/ToastContext';

function App() {
  const { session, loading, isPasswordRecovery, markIntroSeen } = useAuth();
  const toast = useToast();
  const [justOnboarded, setJustOnboarded] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const [currentPath, setCurrentPath] = useState(() => {
    return localStorage.getItem('mopal_current_path') || 'dashboard';
  });

  const navigate = (path) => {
    localStorage.setItem('mopal_current_path', path);
    setCurrentPath(path);
  };
  const [isGlobalAddOpen, setIsGlobalAddOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Generate any due recurring transactions once per session, right after login.
  useEffect(() => {
    if (!session) return;
    runDueRecurringRules().then(({ generated }) => {
      if (generated > 0) {
        toast.success(`${generated} recurring transaction${generated !== 1 ? 's' : ''} added`);
        setRefreshKey(k => k + 1);
      }
    }).catch(() => {});
  }, [session?.user?.id]);

  const renderContent = () => {
    switch (currentPath) {
      case 'dashboard':
        return <Dashboard onNavigate={navigate} />;
      case 'transactions':
        return <Transactions />;
      case 'goals':
        return <Goals />;
      case 'debts':
        return <Debts />;
      case 'me':
        return <Me />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-gray dark:bg-brand-dark">
        <p className="text-gray-400 font-medium">Loading…</p>
      </div>
    );
  }

  // A password-recovery link takes priority over everything else, even if
  // the recovery session technically counts as "logged in".
  if (isPasswordRecovery) {
    return <ResetPassword />;
  }

  if (!session) {
    return <Auth />;
  }

  // Post-login setup: first the feature intro, then personalization.
  if (!session.user.user_metadata?.intro_seen && !hasSeenIntro) {
    return (
      <IntroCarousel
        onDone={async () => {
          try { await markIntroSeen(); } catch {}
          setHasSeenIntro(true);
        }}
      />
    );
  }

  // First-time users get a short setup flow before landing in the app.
  if (!session.user.user_metadata?.onboarded && !justOnboarded) {
    return <Onboarding onComplete={() => setJustOnboarded(true)} />;
  }

  return (
    <>
      <Layout 
        currentPath={currentPath} 
        onNavigate={navigate} 
        onOpenAdd={() => setIsGlobalAddOpen(true)}
      >
        <div key={refreshKey}>
          {renderContent()}
        </div>
      </Layout>
      
      <TransactionModal 
        isOpen={isGlobalAddOpen}
        onClose={() => setIsGlobalAddOpen(false)}
        onSaved={() => setRefreshKey(k => k + 1)}
      />
    </>
  );
}

export default App;
