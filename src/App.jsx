import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import Debts from './pages/Debts';
import Me from './pages/Me';
import Auth from './pages/Auth';
import TransactionModal from './components/TransactionModal';
import { useAuth } from './context/AuthContext';

function App() {
  const { session, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(() => {
    return localStorage.getItem('vex_current_path') || 'dashboard';
  });

  const navigate = (path) => {
    localStorage.setItem('vex_current_path', path);
    setCurrentPath(path);
  };
  const [isGlobalAddOpen, setIsGlobalAddOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
      <div className="min-h-screen flex items-center justify-center bg-brand-gray">
        <p className="text-gray-400 font-medium">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
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
