import React, { useState, useMemo, useEffect } from 'react';
import { getTransactions, getCategories, getBudgets } from '../utils/storage';
import { format, parseISO, isSameMonth, subMonths } from 'date-fns';
import SettingsModal from '../components/SettingsModal';
import BudgetModal from '../components/BudgetModal';
import { SkeletonLine, SkeletonList } from '../components/ui/Skeleton';

const Me = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [budgetModalCategory, setBudgetModalCategory] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showSpending, setShowSpending] = useState(true);
  const [loading, setLoading] = useState(true);

  const currentMonthKey = format(new Date(), 'yyyy-MM');

  const loadAll = async () => {
    const [txs, cats, buds] = await Promise.all([getTransactions(), getCategories(), getBudgets(currentMonthKey)]);
    setTransactions(txs);
    setCategories(cats);
    setBudgets(buds);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const getBudgetForCategory = (categoryId) => budgets.find(b => b.categoryId === categoryId) || null;

  const now = new Date();
  const currentMonthName = format(now, 'MMMM yyyy');
  const formatCurrency = (val) => `₦${Number(val).toLocaleString()}`;
  const getCategory = (id) => categories.find(c => c.id === id) || { name: 'Other', color: '#ccc' };

  const { monthExpense, monthIncome, byCategory } = useMemo(() => {
    let mExp = 0, mInc = 0;
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
      } else { mInc += amount; }
    });
    return { monthExpense: mExp, monthIncome: mInc, byCategory: Object.values(catMap).sort((a, b) => b.total - a.total) };
  }, [transactions]);

  const monthlyTrend = useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => {
      const month = subMonths(now, 3 - i);
      const total = transactions
        .filter(t => t.type === 'expense' && isSameMonth(parseISO(t.date), month))
        .reduce((acc, t) => acc + Number(t.amount), 0);
      return { 
        label: format(month, 'MMM'), 
        fullMonth: format(month, 'MMMM yyyy'),
        total,
        isCurrent: i === 3
      };
    });
  }, [transactions]);

  const maxTrend = Math.max(...monthlyTrend.map(m => m.total), 1);

  return (
    <div className="p-6 pt-12 pb-24 space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-1">Account & Insights</p>
          <h1 className="text-3xl font-bold text-brand-charcoal dark:text-white">Me</h1>
        </div>
        <div className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center shadow-md">
          <span className="font-black text-brand-charcoal dark:text-white text-lg">Me</span>
        </div>
      </header>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowSpending(!showSpending)}
          className={`card p-5 border shadow-sm text-left transition-all group ${
            showSpending ? 'border-brand-gold bg-amber-50/30' : 'border-gray-100 hover:shadow-md'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-brand-gold/20 flex items-center justify-center mb-3 group-hover:bg-brand-gold/30 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <p className="font-bold text-brand-charcoal dark:text-white text-sm">My Spending</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{currentMonthName}</p>
        </button>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="card p-5 border border-gray-100 dark:border-brand-darkBorder shadow-sm text-left hover:shadow-md transition-shadow group"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-brand-darkBorder flex items-center justify-center mb-3 group-hover:bg-gray-200 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </div>
          <p className="font-bold text-brand-charcoal dark:text-white text-sm">Settings</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Categories & backup</p>
        </button>
      </div>

      {/* Spending Section */}
      {showSpending && (
        <div className="space-y-6 animate-fadeIn">
          {/* Active Month Banner */}
          <div className="card p-5 bg-gradient-to-br from-brand-charcoal to-gray-800 text-white shadow-md border-0">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-gold bg-brand-gold/10 px-2.5 py-1 rounded-full border border-brand-gold/20">
                Active Month — {currentMonthName}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-0.5">Total Spent</p>
                {loading ? <div className="skeleton w-20 h-7 bg-white/10" /> : <p className="text-2xl font-black text-red-400">{formatCurrency(monthExpense)}</p>}
              </div>
              <div className="border-l border-gray-700/80 pl-4">
                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-0.5">Total Earned</p>
                {loading ? <div className="skeleton w-20 h-7 bg-white/10" /> : <p className="text-2xl font-black text-emerald-400">{formatCurrency(monthIncome)}</p>}
              </div>
            </div>
          </div>

          {/* Revamped 4-month Spending Trend */}
          <section className="card p-5 border border-gray-100 dark:border-brand-darkBorder shadow-sm bg-white dark:bg-brand-darkCard">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-bold text-base text-brand-charcoal dark:text-white">4-Month Spending Trend</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500">Comparing your monthly expenses</p>
              </div>
            </div>
            <div className="flex items-end justify-between gap-3 h-36 pt-4 pb-1">
              {monthlyTrend.map((m) => {
                const heightPct = maxTrend > 0 ? Math.max(12, Math.round((m.total / maxTrend) * 100)) : 12;
                return (
                  <div key={m.label} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                    <p className={`text-[11px] font-bold ${m.isCurrent ? 'text-brand-charcoal' : 'text-gray-400'}`}>
                      {m.total > 0 ? formatCurrency(m.total) : '₦0'}
                    </p>
                    <div className="w-full relative flex items-end justify-center rounded-xl bg-gray-100 dark:bg-brand-darkBorder overflow-hidden h-full max-h-[90px]">
                      <div 
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          m.isCurrent ? 'bg-gradient-to-t from-amber-400 to-brand-gold shadow-md' : 'bg-gray-300/80'
                        }`} 
                        style={{ height: `${heightPct}%` }} 
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <p className={`text-xs font-bold ${m.isCurrent ? 'text-brand-charcoal' : 'text-gray-400'}`}>{m.label}</p>
                      {m.isCurrent && <span className="w-1.5 h-1.5 bg-brand-gold rounded-full mt-0.5"></span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Category Breakdown */}
          <section>
            <h2 className="font-bold text-lg mb-3">Where did it go?</h2>
            {loading ? (
              <SkeletonList count={3} />
            ) : byCategory.length > 0 ? (
              <div className="space-y-3">
                {byCategory.map(({ cat, total, count }) => {
                  const pct = monthExpense > 0 ? Math.round((total / monthExpense) * 100) : 0;
                  const budget = getBudgetForCategory(cat.id);
                  const budgetPct = budget ? Math.min(100, Math.round((total / budget.limitAmount) * 100)) : 0;
                  const isOver = budget && total > budget.limitAmount;
                  const barColor = isOver ? '#EF4444' : budgetPct >= 70 ? '#F59E0B' : '#4CAF50';
                  return (
                    <div key={cat.id} className="card p-4 border border-gray-100 dark:border-brand-darkBorder shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: cat.color }}>
                            {cat.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-brand-charcoal dark:text-white text-sm">{cat.name}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{count} transaction{count !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-500 text-sm">{formatCurrency(total)}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{pct}%</p>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 dark:bg-brand-darkBorder rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: cat.color }} />
                      </div>

                      {/* Budget row */}
                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-brand-darkBorder">
                        {budget ? (
                          <button onClick={() => setBudgetModalCategory(cat)} className="w-full text-left">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className={`text-xs font-bold ${isOver ? 'text-danger' : 'text-gray-500 dark:text-gray-400'}`}>
                                {isOver ? `Over by ${formatCurrency(total - budget.limitAmount)}` : `${formatCurrency(budget.limitAmount - total)} left`}
                              </span>
                              <span className="text-xs text-gray-400 dark:text-gray-500">Budget: {formatCurrency(budget.limitAmount)}</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-brand-darkBorder rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${budgetPct}%`, backgroundColor: barColor }} />
                            </div>
                          </button>
                        ) : (
                          <button
                            onClick={() => setBudgetModalCategory(cat)}
                            className="text-xs font-bold text-brand-goldDark dark:text-brand-gold flex items-center gap-1"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                            Set a budget
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-8 bg-white dark:bg-brand-darkCard rounded-3xl border border-dashed border-gray-200 dark:border-brand-darkBorder">
                <p className="text-gray-400 dark:text-gray-500 text-sm">No expenses logged this month yet.</p>
              </div>
            )}
          </section>
        </div>
      )}

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <BudgetModal
        isOpen={!!budgetModalCategory}
        onClose={() => setBudgetModalCategory(null)}
        category={budgetModalCategory}
        month={currentMonthKey}
        existingBudget={budgetModalCategory ? getBudgetForCategory(budgetModalCategory.id) : null}
        onSaved={loadAll}
      />
    </div>
  );
};

export default Me;
