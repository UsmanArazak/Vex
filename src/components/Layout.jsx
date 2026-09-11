import React from 'react';
import { Home, List, Target, Settings, Plus, Banknote, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import InstallPrompt from './InstallPrompt';

const Layout = ({ children, currentPath, onNavigate, onOpenAdd, isAdminAccount, onSwitchToAdmin }) => {
  const { signOut } = useAuth();
  // Mobile bottom nav stays exactly as-is — "Me" is intentionally not here.
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'transactions', icon: List, label: 'Activity' },
    { id: 'goals', icon: Target, label: 'Goals' },
    { id: 'debts', icon: Banknote, label: 'Debts' },
  ];

  // Desktop sidebar gets "Me" too, since there's no separate avatar button there.
  const desktopNavItems = [...navItems, { id: 'me', icon: User, label: 'Me' }];

  return (
    <div className="min-h-screen bg-brand-gray dark:bg-brand-dark">
      <div className="md:flex md:min-h-screen">

        {/* Desktop Sidebar (hidden on mobile) */}
        <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 md:sticky md:top-0 md:h-screen bg-white dark:bg-brand-darkCard border-r border-gray-100 dark:border-brand-darkBorder px-6 py-8">
          <div className="flex items-center gap-2.5 mb-10 px-2">
            <div className="w-9 h-9 rounded-xl bg-brand-gold flex items-center justify-center shrink-0">
              <span className="font-black text-brand-charcoal text-base">M</span>
            </div>
            <span className="font-bold text-lg text-brand-charcoal dark:text-white">Mopal</span>
          </div>

          <nav className="flex flex-col gap-1 flex-1">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                    isActive
                      ? 'bg-brand-gold/20 text-brand-charcoal dark:text-white'
                      : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-brand-darkBorder hover:text-brand-charcoal dark:hover:text-white'
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {isAdminAccount && (
            <button
              onClick={onSwitchToAdmin}
              className="w-full flex items-center justify-center gap-2 bg-brand-charcoal text-brand-gold font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors mb-2"
            >
              Admin Dashboard
            </button>
          )}

          {currentPath === 'dashboard' ? (
            <button
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-brand-darkBorder text-brand-charcoal dark:text-white font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors mt-4"
            >
              <LogOut size={18} strokeWidth={2} />
              Sign Out
            </button>
          ) : (
            <button onClick={onOpenAdd} className="btn-primary w-full mt-4">
              <Plus size={18} strokeWidth={2.5} className="mr-1.5" />
              Add Transaction
            </button>
          )}
        </aside>

        {/* Content column — mobile keeps the phone-frame look, desktop widens and drops the frame */}
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-md md:max-w-4xl bg-brand-gray dark:bg-brand-dark h-screen md:h-auto md:min-h-screen relative shadow-2xl md:shadow-none flex flex-col overflow-hidden md:overflow-visible">

            <InstallPrompt />
            {isAdminAccount && (
              <button
                onClick={onSwitchToAdmin}
                className="md:hidden mx-6 mt-3 flex items-center justify-center gap-2 bg-brand-charcoal text-brand-gold font-semibold text-sm py-2.5 rounded-xl"
              >
                Switch to Admin Dashboard
              </button>
            )}
            <main className="flex-1 overflow-y-auto md:overflow-visible pb-24 md:pb-16 hide-scrollbar">
              {children}
            </main>

            {/* Floating Add Button (mobile only) */}
            <button
              onClick={onOpenAdd}
              className="md:hidden fixed bottom-24 bg-brand-gold text-brand-charcoal dark:text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-transform active:scale-95 z-40 flex items-center justify-center"
              style={{ right: 'calc(max(1.5rem, 50vw - 14rem + 1.5rem))' }}
              aria-label="Add Transaction"
            >
              <Plus size={24} strokeWidth={2.5} />
            </button>

            {/* Bottom Navigation (mobile only) */}
            <nav className="md:hidden fixed bottom-0 w-full max-w-md bg-white dark:bg-brand-darkCard rounded-t-3xl shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.05)] px-6 py-4 flex justify-between items-center z-40">
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
      </div>
    </div>
  );
};

export default Layout;
