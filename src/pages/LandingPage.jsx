// src/pages/LandingPage.jsx
import React from 'react';
import { TransactionsMock, BudgetsMock, DebtsMock, GoalsMock } from './IntroCarousel';

const FEATURES = [
  { title: 'Track every transaction', body: 'Record income and expenses in seconds, organized by category.', mock: <TransactionsMock /> },
  { title: 'Budgets that help you', body: 'Set a monthly limit for each category. We will warn you before you spend too much.', mock: <BudgetsMock /> },
  { title: 'Debts made simple', body: 'Keep a record of money people owe you, and money you owe other people.', mock: <DebtsMock /> },
  { title: 'Reach your goals', body: 'Save money for what matters to you, and watch your progress as you save.', mock: <GoalsMock /> },
];

const LandingPage = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-brand-gray dark:bg-brand-dark">

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-brand-gold/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -top-10 -right-24 w-96 h-96 bg-brand-gold/25 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-1/3 right-6 md:right-16 w-16 h-16 md:w-24 md:h-24 border-[3px] border-brand-gold/50 rounded-3xl rotate-12 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-10 pb-16 md:pt-16 md:pb-24">
          <div className="flex items-center justify-between mb-16 md:mb-20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-gold flex items-center justify-center shrink-0">
                <span className="font-black text-brand-charcoal text-base">M</span>
              </div>
              <span className="font-bold text-lg text-brand-charcoal dark:text-white">Mopal</span>
            </div>
            <button
              onClick={onLogin}
              className="text-sm font-bold text-brand-charcoal dark:text-white hover:text-brand-goldDark dark:hover:text-brand-gold transition-colors"
            >
              Log In
            </button>
          </div>

          <div className="max-w-xl">
            <h1 className="text-3xl md:text-5xl font-bold text-brand-charcoal dark:text-white leading-tight mb-5">
              The money app built for how you actually live
            </h1>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
              Mopal helps you record your income and your spending, in one place — formal income, side hustles, and cash.
            </p>
            <p className="text-xs md:text-sm text-gray-400 dark:text-gray-500 mb-8">
              Mopal is designed to reflect real income and real spending, in a simple and clear way.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={onGetStarted} className="btn-primary px-8 py-3.5">
                Get Started
              </button>
              <button
                onClick={onLogin}
                className="px-8 py-3.5 rounded-full font-semibold text-sm bg-white dark:bg-brand-darkCard border border-gray-200 dark:border-brand-darkBorder text-brand-charcoal dark:text-white hover:bg-gray-50 transition-colors"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-6 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6 border border-gray-100 dark:border-brand-darkBorder shadow-sm">
              <div className="w-full max-w-[220px] mx-auto mb-5">{f.mock}</div>
              <h3 className="font-bold text-lg text-brand-charcoal dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="max-w-4xl mx-auto px-6 pb-16 md:pb-24">
        <div className="card bg-gradient-to-br from-brand-charcoal to-gray-800 text-white p-8 md:p-12 text-center shadow-md border-0">
          <h2 className="text-xl md:text-2xl font-bold mb-3">Ready to take control of your money?</h2>
          <p className="text-sm text-gray-300 mb-6 max-w-md mx-auto">
            Create a free account and start recording your income and spending today.
          </p>
          <button onClick={onGetStarted} className="btn-primary px-8 py-3.5 mx-auto">
            Get Started
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8">© {new Date().getFullYear()} Mopal. All rights reserved.</p>
      </div>
    </div>
  );
};

export default LandingPage;
