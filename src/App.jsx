import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';

function App() {
  const [currentPath, setCurrentPath] = useState('dashboard');

  const renderContent = () => {
    switch (currentPath) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <Transactions />;
      case 'goals':
        return <Goals />;
      case 'settings':
        return <div className="p-6 pt-12"><h1 className="text-2xl font-bold mb-4">Settings</h1></div>;
      default:
        return null;
    }
  };

  return (
    <Layout currentPath={currentPath} onNavigate={setCurrentPath}>
      {renderContent()}
    </Layout>
  );
}

export default App;
