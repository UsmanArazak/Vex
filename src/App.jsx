import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import Debts from './pages/Debts';
import Me from './pages/Me';
import TransactionModal from './components/TransactionModal';

function App() {
  const [currentPath, setCurrentPath] = useState('dashboard');
  const [isGlobalAddOpen, setIsGlobalAddOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const renderContent = () => {
    switch (currentPath) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPath} />;
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
        onNavigate={setCurrentPath} 
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
