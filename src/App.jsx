import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import Debts from './pages/Debts';
import Me from './pages/Me';
import TransactionModal from './components/TransactionModal';

function App() {
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
