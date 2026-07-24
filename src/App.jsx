import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import Settings from './pages/Settings';
import TransactionModal from './components/TransactionModal';

function App() {
  const [currentPath, setCurrentPath] = useState('dashboard');
  const [isGlobalAddOpen, setIsGlobalAddOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const renderContent = () => {
    switch (currentPath) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <Transactions />;
      case 'goals':
        return <Goals />;
      case 'settings':
        return <Settings />;
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
