import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, YAxis } from 'recharts';
import { getTransactions, getCategories } from '../utils/storage';
import { format, subMonths, isSameMonth, isToday, parseISO } from 'date-fns';

const Dashboard = ({ onNavigate }) => {
  const rawTransactions = getTransactions();
  const categories = getCategories();
  
  const hasData = rawTransactions.length > 0;

  // Mock data for initial empty state visualization if needed
  const mockTransactions = [
    { id: '1', amount: 4500, categoryId: 'cat-1', type: 'expense', date: new Date().toISOString() },
    { id: '2', amount: 50000, categoryId: 'cat-5', type: 'income', date: new Date().toISOString() },
    { id: '3', amount: 2000, categoryId: 'cat-2', type: 'expense', date: new Date().toISOString() },
  ];
  
  const transactions = hasData ? rawTransactions : mockTransactions;

  // Calculations
  const { totalBalance, todayExpense, currentMonthExpense } = useMemo(() => {
    let bal = 0;
    let tExp = 0;
    let mExp = 0;
    const now = new Date();

    transactions.forEach(t => {
      const amount = Number(t.amount);
      if (t.type === 'income') bal += amount;
      else bal -= amount;

      const tDate = parseISO(t.date);
      if (t.type === 'expense') {
        if (isToday(tDate)) tExp += amount;
        if (isSameMonth(tDate, now)) mExp += amount;
      }
    });
    return { totalBalance: bal, todayExpense: tExp, currentMonthExpense: mExp };
  }, [transactions]);

  // Today's Transactions
  const todaysActivity = useMemo(() => {
    return transactions
      .filter(t => isToday(parseISO(t.date)))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions]);

  const formatCurrency = (val) => `₦${val.toLocaleString()}`;

  const getCategory = (id) => categories.find(c => c.id === id) || { name: 'Other', color: '#ccc' };

  return (
    <div className="p-6 pt-12 space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-brand-charcoal">Good day 👋</h1>
        <button
          onClick={() => onNavigate('me')}
          className="w-11 h-11 rounded-full bg-brand-gold flex items-center justify-center shadow-md active:scale-95 transition-transform"
        >
          <span className="font-black text-brand-charcoal text-sm">Me</span>
        </button>
      </header>

      {/* Today's Focus Card */}
      <section className="card bg-brand-gold relative overflow-hidden shadow-[0_10px_30px_-10px_rgba(255,215,0,0.5)] border-0">
        <div className="relative z-10">
          <h2 className="text-brand-charcoal/80 font-medium mb-1 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-white/40 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </span>
            Today's Spendings
          </h2>
          <div className="mt-4">
            <p className="text-4xl font-bold">{formatCurrency(todayExpense)}</p>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
        <div className="absolute left-1/2 -bottom-10 w-24 h-24 bg-white/30 rounded-full blur-xl"></div>
      </section>

      {/* Today's Activity List */}
      <section>
        <div className="flex justify-between items-center mb-4 mt-2">
          <h3 className="font-bold text-lg">Today's Activity</h3>
        </div>
        <div className="space-y-3">
          {todaysActivity.length > 0 ? (
            todaysActivity.map(t => {
              const cat = getCategory(t.categoryId);
              return (
                <div key={t.id} className="card p-4 flex items-center justify-between shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: cat.color }}>
                      {cat.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-charcoal text-sm">{cat.name}</h4>
                      <p className="text-xs text-gray-400">{format(parseISO(t.date), 'h:mm a')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${t.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                      {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                    </p>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center p-6 text-gray-400 text-sm bg-white rounded-3xl border border-dashed border-gray-200">
              No spendings yet today! 🎉
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Dashboard;
