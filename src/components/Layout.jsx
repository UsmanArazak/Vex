import React from 'react';
import { Home, List, Target, Settings, Plus, Banknote } from 'lucide-react';

const Layout = ({ children, currentPath, onNavigate, onOpenAdd }) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'transactions', icon: List, label: 'Activity' },
    { id: 'goals', icon: Target, label: 'Goals' },
    { id: 'debts', icon: Banknote, label: 'Debts' },
  ];

  return (
    <div className="flex justify-center min-h-screen bg-brand-gray dark:bg-brand-dark w-full">
      {/* Mobile container - restricts width on desktop to look like an app */}
      <div className="w-full max-w-md bg-brand-gray dark:bg-brand-dark h-screen relative shadow-2xl flex flex-col overflow-hidden">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-24 hide-scrollbar">
          {children}
        </main>

        {/* Floating Add Button */}
        <button 
          onClick={onOpenAdd}
          className="fixed bottom-24 bg-brand-gold text-brand-charcoal dark:text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-transform active:scale-95 z-40 flex items-center justify-center"
          style={{ right: 'calc(max(1.5rem, 50vw - 14rem + 1.5rem))' }}
          aria-label="Add Transaction"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 w-full max-w-md bg-white dark:bg-brand-darkCard rounded-t-3xl shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.05)] px-6 py-4 flex justify-between items-center z-40">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${
                  isActive ? 'text-brand-charcoal dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <div className={`relative ${isActive ? 'bg-brand-gold/20' : ''} p-2 rounded-full mb-1 transition-colors duration-300`}>
                  <Icon 
                    size={24} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className={isActive ? 'text-brand-charcoal dark:text-white' : ''} 
                  />
                  {isActive && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-gold rounded-full border-2 border-white"></span>
                  )}
                </div>
                <span className="text-[10px] font-semibold">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
