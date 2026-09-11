// src/pages/IntroCarousel.jsx
import React, { useState } from 'react';

// ---------- Mini in-app mockups (not real screenshots, but styled to look
// exactly like the real UI so the carousel feels like it's showing the app) ----------

const MockCard = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-brand-darkCard rounded-2xl shadow-xl p-4 ${className}`}>
    {children}
  </div>
);

const WelcomeMock = () => (
  <MockCard className="w-full">
    <div className="bg-brand-gold rounded-xl p-4 mb-3">
      <p className="text-[10px] font-bold text-brand-charcoal/70 uppercase tracking-wider mb-1">Today's Spendings</p>
      <p className="text-2xl font-black text-brand-charcoal">₦12,500</p>
    </div>
    <div className="space-y-2">
      {[['#FF6B6B', 'Food', '₦4,200'], ['#4ECDC4', 'Transport', '₦1,800']].map(([c, n, a]) => (
        <div key={n} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: c }} />
            <span className="text-xs font-semibold text-brand-charcoal dark:text-white">{n}</span>
          </div>
          <span className="text-xs font-bold text-gray-400">{a}</span>
        </div>
      ))}
    </div>
  </MockCard>
);

const TransactionsMock = () => (
  <MockCard className="w-full space-y-2.5">
    {[['#FF6B6B', 'F', 'Food', '-₦2,000'], ['#45B7D1', 'R', 'Rent', '-₦85,000'], ['#FFE066', 'S', 'Salary', '+₦250,000']].map(([c, i, n, a]) => (
      <div key={n} className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-[11px]" style={{ backgroundColor: c }}>{i}</div>
          <span className="text-xs font-bold text-brand-charcoal dark:text-white">{n}</span>
        </div>
        <span className={`text-xs font-bold ${a.startsWith('+') ? 'text-success' : 'text-gray-400'}`}>{a}</span>
      </div>
    ))}
  </MockCard>
);

const BudgetsMock = () => (
  <MockCard className="w-full space-y-4">
    <div>
      <div className="flex justify-between text-xs font-bold mb-1.5">
        <span className="text-brand-charcoal dark:text-white">Food</span>
        <span className="text-gray-400">₦18,000 / ₦20,000</span>
      </div>
      <div className="h-2 w-full bg-gray-100 dark:bg-brand-darkBorder rounded-full overflow-hidden">
        <div className="h-full w-[90%] rounded-full bg-warning" />
      </div>
    </div>
    <div>
      <div className="flex justify-between text-xs font-bold mb-1.5">
        <span className="text-brand-charcoal dark:text-white">Transport</span>
        <span className="text-gray-400">₦6,000 / ₦15,000</span>
      </div>
      <div className="h-2 w-full bg-gray-100 dark:bg-brand-darkBorder rounded-full overflow-hidden">
        <div className="h-full w-[40%] rounded-full bg-success" />
      </div>
    </div>
  </MockCard>
);

const DebtsMock = () => (
  <div className="w-full grid grid-cols-2 gap-2.5">
    <MockCard className="!bg-amber-50 dark:!bg-amber-950/30">
      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Owed to you</p>
      <p className="text-lg font-black text-amber-700">₦45,000</p>
    </MockCard>
    <MockCard className="!bg-emerald-50 dark:!bg-emerald-950/30">
      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">You owe</p>
      <p className="text-lg font-black text-emerald-700">₦10,000</p>
    </MockCard>
  </div>
);

const GoalsMock = () => (
  <MockCard className="w-full">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-5 h-5 rounded-md border-2 border-brand-gold shrink-0" />
      <span className="text-sm font-bold text-brand-charcoal dark:text-white">New Laptop</span>
    </div>
    <div className="h-2 w-full bg-gray-100 dark:bg-brand-darkBorder rounded-full overflow-hidden mb-2">
      <div className="h-full w-[65%] rounded-full bg-brand-gold" />
    </div>
    <div className="flex justify-between text-xs font-bold">
      <span className="text-brand-charcoal dark:text-white">₦325,000 saved</span>
      <span className="text-gray-400">of ₦500,000</span>
    </div>
  </MockCard>
);

const SLIDES = [
  { title: 'Welcome to Mopal', body: "Mopal is a money app. It helps you record your income and your spending, in one place.", mock: <WelcomeMock /> },
  { title: 'Record every transaction', body: 'You can record what you earn and what you spend. Each entry has a category. You can also set up payments that repeat, such as rent or salary.', mock: <TransactionsMock /> },
  { title: 'Budgets that help you', body: "Set a monthly limit for each category. We will warn you before you spend too much.", mock: <BudgetsMock /> },
  { title: 'Debts made simple', body: "Keep a record of money people owe you, and money you owe other people.", mock: <DebtsMock /> },
  { title: "Reach your goals", body: "Save money for what matters to you, such as a laptop or your rent. We show your progress as you save.", mock: <GoalsMock /> },
];

const IntroCarousel = ({ onDone }) => {
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;
  const slide = SLIDES[index];

  return (
    <div className="min-h-screen w-full flex flex-col md:items-center md:justify-center bg-gradient-to-br from-brand-charcoal via-gray-800 to-brand-charcoal dark:from-black dark:via-gray-900 dark:to-black md:p-8">
      <div className="flex flex-col md:grid md:grid-cols-2 w-full md:max-w-4xl md:h-[600px] flex-1 md:flex-none md:rounded-[2rem] md:overflow-hidden md:shadow-2xl">

        {/* Visual panel */}
        <div className="relative flex items-center justify-center bg-gradient-to-br from-brand-charcoal to-gray-800 dark:from-brand-darkCard dark:to-black min-h-[42vh] md:min-h-0 md:h-full p-8 overflow-hidden shrink-0">
          <div className="absolute -top-10 -right-10 w-52 h-52 bg-brand-gold/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-10 w-52 h-52 bg-brand-gold/10 rounded-full blur-3xl" />
          <div key={index} className="relative z-10 w-full max-w-[280px] animate-scale-in">
            {slide.mock}
          </div>
        </div>

        {/* Text panel */}
        <div className="flex-1 md:h-full flex flex-col justify-between bg-white dark:bg-brand-darkCard px-6 py-8 md:p-10">
          <div>
            <div className="flex gap-1.5 mb-8">
              {SLIDES.map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= index ? 'bg-brand-gold' : 'bg-gray-100 dark:bg-brand-darkBorder'}`} />
              ))}
            </div>
            <div key={index + '-text'} className="animate-scale-in">
              <h1 className="text-2xl md:text-3xl font-bold text-brand-charcoal dark:text-white mb-3">{slide.title}</h1>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed">{slide.body}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8">
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
    </div>
  );
};

export default IntroCarousel;
