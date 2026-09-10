// src/pages/IntroCarousel.jsx
import React, { useState } from 'react';

const SLIDES = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2D3142" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    ),
    title: 'Welcome to Mopal',
    body: "The money app built for how you actually live — formal income, side hustles, cash, all in one place.",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2D3142" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
    ),
    title: 'Track every transaction',
    body: 'Log income and expenses in seconds, organized by category — with recurring transactions for rent, salary, and subscriptions on autopilot.',
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2D3142" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 2v10l7 4"/></svg>
    ),
    title: 'Budgets that actually help',
    body: "Set a monthly limit per category and get a nudge before you overspend — not after.",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2D3142" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></svg>
    ),
    title: 'Debts, simplified',
    body: "Keep track of who owes you and who you owe — money between friends and family, without the awkwardness.",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2D3142" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
    ),
    title: 'Goals you\'ll actually hit',
    body: "Save toward what matters — a laptop, rent, travel — and watch your progress build, one transaction at a time.",
  },
];

const IntroCarousel = ({ onDone }) => {
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gray dark:bg-brand-dark p-6">
      <div className="w-full max-w-sm bg-white dark:bg-brand-darkCard rounded-3xl shadow-soft p-8">
        <div className="flex gap-1.5 mb-8">
          {SLIDES.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= index ? 'bg-brand-gold' : 'bg-gray-100 dark:bg-brand-darkBorder'}`} />
          ))}
        </div>

        <div key={index} className="animate-scale-in">
          <div className="w-14 h-14 rounded-2xl bg-brand-gold flex items-center justify-center mb-6">
            {slide.icon}
          </div>
          <h1 className="text-2xl font-bold text-brand-charcoal dark:text-white mb-3">{slide.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-10 min-h-[70px]">{slide.body}</p>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={onDone}
            className="text-sm font-semibold text-gray-400 dark:text-gray-500 hover:text-brand-charcoal dark:hover:text-white transition-colors"
          >
            Skip
          </button>
          <button
            onClick={() => (isLast ? onDone() : setIndex(i => i + 1))}
            className="btn-primary px-8"
          >
            {isLast ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntroCarousel;
