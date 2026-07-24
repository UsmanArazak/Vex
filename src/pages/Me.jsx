import React, { useState, useMemo } from 'react';
import { getTransactions, getCategories } from '../utils/storage';
import { format, parseISO, isSameMonth, startOfMonth, subMonths } from 'date-fns';

const Me = () => {
  const transactions = getTransactions();
  const categories = getCategories();

  const now = new Date();

  const formatCurrency = (val) => `₦${Number(val).toLocaleString()}`;
  const getCategory = (id) => categories.find(c => c.id === id) || { name: 'Other', color: '#ccc' };

  // Current month breakdown by category
  const { monthExpense, monthIncome, byCategory } = useMemo(() => {
    let mExp = 0;
    let mInc = 0;
    const catMap = {};

    transactions.forEach(t => {
      const tDate = parseISO(t.date);
      if (!isSameMonth(tDate, now)) return;

      const amount = Number(t.amount);
      const cat = getCategory(t.categoryId);

      if (t.type === 'expense') {
        mExp += amount;
        if (!catMap[t.categoryId]) catMap[t.categoryId] = { cat, total: 0, count: 0 };
        catMap[t.categoryId].total += amount;
        catMap[t.categoryId].count += 1;
      } else {
        mInc += amount;
      }
    });

    // Sort by total descending
    const sorted = Object.values(catMap).sort((a, b) => b.total - a.total);
    return { monthExpense: mExp, monthIncome: mInc, byCategory: sorted };
  }, [transactions]);

  // Last 3 months trend
  const monthlyTrend = useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => {
      const month = subMonths(now, 3 - i);
      const total = transactions
        .filter(t => t.type === 'expense' && isSameMonth(parseISO(t.date), month))
        .reduce((acc, t) => acc + Number(t.amount), 0);
      return { label: format(month, 'MMM'), total };
    });
  }, [transactions]);

  const maxTrend = Math.max(...monthlyTrend.map(m => m.total), 1);

  return (
    <div className="p-6 pt-12 pb-24 space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">{format(now, 'MMMM yyyy')}</p>
          <h1 className="text-3xl font-bold text-brand-charcoal">My Spending</h1>
        </div>
        <div className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center shadow-md">
          <span className="font-black text-brand-charcoal text-lg">Me</span>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 border border-red-100 bg-red-50/50">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Spent</p>
          <p className="text-xl font-bold text-red-500">{formatCurrency(monthExpense)}</p>
        </div>
        <div className="card p-4 border border-green-100 bg-green-50/50">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Earned</p>
          <p className="text-xl font-bold text-green-500">{formatCurrency(monthIncome)}</p>
        </div>
      </div>

      {/* 4-month bar trend */}
      <section className="card p-5 border border-gray-100 shadow-sm">
        <h2 className="font-bold text-base mb-4">Spending Trend</h2>
        <div className="flex items-end justify-between gap-3 h-24">
          {monthlyTrend.map((m, i) => {
            const isCurrentMonth = i === 3;
            const heightPct = maxTrend > 0 ? Math.max(8, Math.round((m.total / maxTrend) * 100)) : 8;
            return (
              <div key={m.label} className="flex flex-col items-center gap-2 flex-1">
                <p className="text-xs font-bold text-gray-400">{formatCurrency(m.total)}</p>
                <div className="w-full rounded-xl transition-all" style={{
                  height: `${heightPct}%`,
                  backgroundColor: isCurrentMonth ? '#FFE066' : '#E5E7EB',
                  minHeight: '8px'
                }} />
                <p className={`text-xs font-bold ${isCurrentMonth ? 'text-brand-charcoal' : 'text-gray-400'}`}>{m.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Category Breakdown */}
      <section>
        <h2 className="font-bold text-lg mb-3">Where did it go?</h2>
        {byCategory.length > 0 ? (
          <div className="space-y-3">
            {byCategory.map(({ cat, total, count }) => {
              const pct = monthExpense > 0 ? Math.round((total / monthExpense) * 100) : 0;
              return (
                <div key={cat.id} className="card p-4 border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: cat.color }}>
                        {cat.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-brand-charcoal text-sm">{cat.name}</p>
                        <p className="text-xs text-gray-400">{count} transaction{count !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-500 text-sm">{formatCurrency(total)}</p>
                      <p className="text-xs text-gray-400">{pct}%</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-8 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">No expenses logged this month yet.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Me;
