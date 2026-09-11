import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  getTransactions, getCategories, getBudgets, getDebts,
  exportData, importData, clearAllData,
  getRecurringRules, saveRecurringRule, deleteRecurringRule,
} from '../utils/storage';
import { format, parseISO, isSameMonth, subMonths } from 'date-fns';
import BudgetModal from '../components/BudgetModal';
import CategoriesListModal from '../components/CategoriesListModal';
import RecurringModal from '../components/RecurringModal';
import { SkeletonList } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { useTheme } from '../context/ThemeContext';
import InfoButton from '../components/ui/InfoButton';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];
const FREQ_LABEL = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };

const BackHeader = ({ title, onBack, infoTitle, infoText, infoKey }) => (
  <header className="flex items-center gap-3 mb-6">
    <button onClick={onBack} className="btn-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <h1 className="text-2xl font-bold text-brand-charcoal dark:text-white">{title}</h1>
    {infoText && <InfoButton title={infoTitle || `About ${title}`} pageKey={infoKey}>{infoText}</InfoButton>}
  </header>
);

// ============================= HUB =============================
const MeHub = ({ user, onNavigate, onSignOut }) => (
  <div className="min-h-full flex flex-col p-6 pt-12 pb-6">
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-brand-gold flex items-center justify-center shadow-md shrink-0">
          <span className="font-black text-brand-charcoal text-lg">{(user?.email || '?').charAt(0).toUpperCase()}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Signed in as</p>
          <p className="font-bold text-brand-charcoal dark:text-white truncate">{user?.email}</p>
        </div>
        <InfoButton title="About Me" pageKey="me_hub_v2">
          This page shows your account. From here, you can view your spending, manage your budgets, set up repeating payments, or open Settings.
        </InfoButton>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate('spending')}
          className="card p-5 border border-gray-100 dark:border-brand-darkBorder shadow-sm text-left hover:shadow-md transition-shadow group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-gold/20 flex items-center justify-center mb-3 group-hover:bg-brand-gold/30 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>
          </div>
          <p className="font-bold text-brand-charcoal dark:text-white text-sm">My Spending</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Insights & trends</p>
        </button>

        <button
          onClick={() => onNavigate('budgets')}
          className="card p-5 border border-gray-100 dark:border-brand-darkBorder shadow-sm text-left hover:shadow-md transition-shadow group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center mb-3 group-hover:bg-emerald-200 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 13h3M8 17h6M8 9h1"/></svg>
          </div>
          <p className="font-bold text-brand-charcoal dark:text-white text-sm">Budgets</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Set category limits</p>
        </button>

        <button
          onClick={() => onNavigate('recurring')}
          className="card p-5 border border-gray-100 dark:border-brand-darkBorder shadow-sm text-left hover:shadow-md transition-shadow group"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/40 flex items-center justify-center mb-3 group-hover:bg-sky-200 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 2.1l4 4-4 4"/><path d="M3 12.2v-2a4 4 0 0 1 4-4h12.8M7 21.9l-4-4 4-4"/><path d="M21 11.8v2a4 4 0 0 1-4 4H4.2"/></svg>
          </div>
          <p className="font-bold text-brand-charcoal dark:text-white text-sm">Recurring</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Repeating payments</p>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className="card p-5 border border-gray-100 dark:border-brand-darkBorder shadow-sm text-left hover:shadow-md transition-shadow group"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-brand-darkBorder flex items-center justify-center mb-3 group-hover:bg-gray-200 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </div>
          <p className="font-bold text-brand-charcoal dark:text-white text-sm">Settings</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Appearance & more</p>
        </button>
      </div>
    </div>

    <button
      onClick={onSignOut}
      className="md:hidden sticky bottom-4 z-10 mt-auto w-full flex items-center justify-center gap-2 bg-brand-gold text-brand-charcoal font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      Sign Out
    </button>

    {/* Desktop still needs a way to sign out on this page even though the sidebar has one too */}
    <button
      onClick={onSignOut}
      className="hidden md:flex w-full items-center justify-center gap-2 bg-gray-100 dark:bg-brand-darkBorder text-brand-charcoal dark:text-white font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors mt-6"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      Sign Out
    </button>
  </div>
);

// ============================= SPENDING =============================
const SpendingScreen = ({ onBack }) => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const currentMonthKey = format(new Date(), 'yyyy-MM');
  const now = new Date();
  const incomeEstimate = Number(user?.user_metadata?.monthly_income_estimate || 0);

  const loadAll = async () => {
    const [txs, cats, buds, debtsList] = await Promise.all([getTransactions(), getCategories(), getBudgets(currentMonthKey), getDebts()]);
    setTransactions(txs);
    setCategories(cats);
    setBudgets(buds);
    setDebts(debtsList);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const getBudgetForCategory = (categoryId) => budgets.find(b => b.categoryId === categoryId) || null;
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
      return { label: format(month, 'MMM'), total, isCurrent: i === 3 };
    });
  }, [transactions]);

  const maxTrend = Math.max(...monthlyTrend.map(m => m.total), 1);
  const spentPct = incomeEstimate > 0 ? Math.round((monthExpense / incomeEstimate) * 100) : 0;

  // Last month's per-category totals, for comparison
  const lastMonthByCategory = useMemo(() => {
    const lastMonth = subMonths(now, 1);
    const map = {};
    transactions.forEach(t => {
      if (t.type !== 'expense') return;
      if (!isSameMonth(parseISO(t.date), lastMonth)) return;
      map[t.categoryId] = (map[t.categoryId] || 0) + Number(t.amount);
    });
    return map;
  }, [transactions]);

  // Simple, rule-based insights — computed entirely from this person's own
  // data. No AI, no external calls: just comparisons on real numbers.
  const insights = useMemo(() => {
    const list = [];

    // 1. Budget overage — highest priority
    const overBudget = byCategory.filter(({ cat, total }) => {
      const b = getBudgetForCategory(cat.id);
      return b && total > b.limitAmount;
    });
    if (overBudget.length > 0) {
      const names = overBudget.map(o => o.cat.name).join(', ');
      list.push({ icon: '⚠️', text: `You are over budget on ${names} this month.` });
    }

    // 2. Income usage warning
    if (incomeEstimate > 0 && spentPct >= 80) {
      list.push({ icon: '💰', text: `You have spent ${spentPct}% of your income this month.` });
    }

    // 3. Biggest month-over-month category change
    let biggestChange = null;
    byCategory.forEach(({ cat, total }) => {
      const last = lastMonthByCategory[cat.id] || 0;
      if (last < 1000) return; // ignore tiny/noisy baselines
      const pctChange = Math.round(((total - last) / last) * 100);
      if (Math.abs(pctChange) >= 20 && (!biggestChange || Math.abs(pctChange) > Math.abs(biggestChange.pctChange))) {
        biggestChange = { cat, pctChange };
      }
    });
    if (biggestChange) {
      const direction = biggestChange.pctChange > 0 ? 'up' : 'down';
      list.push({ icon: biggestChange.pctChange > 0 ? '📈' : '📉', text: `${biggestChange.cat.name} spending is ${direction} ${Math.abs(biggestChange.pctChange)}% compared to last month.` });
    }

    // 4. Top spending category, if nothing more urgent already said
    if (list.length < 2 && byCategory.length > 0) {
      const top = byCategory[0];
      list.push({ icon: '🏆', text: `Your biggest spend this month is ${top.cat.name}, at ${formatCurrency(top.total)}.` });
    }

    return list.slice(0, 3);
  }, [byCategory, lastMonthByCategory, incomeEstimate, spentPct]);

  // Financial Health Score (0-100) — savings rate (40pts) + budget
  // adherence (30pts) + debt balance (30pts). Fully computed from this
  // person's own numbers, no external calls.
  const healthScore = useMemo(() => {
    const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

    // Savings rate: how much of income is left after this month's spending
    let savingsScore;
    if (incomeEstimate > 0) {
      const savingsRate = (incomeEstimate - monthExpense) / incomeEstimate;
      savingsScore = clamp(Math.round(((savingsRate + 0.3) / 0.6) * 40), 0, 40);
    } else {
      savingsScore = 20; // neutral — no income set yet
    }

    // Budget adherence: share of budgeted categories still within limit
    let budgetScore;
    if (budgets.length === 0) {
      budgetScore = 20; // neutral — no budgets set yet
    } else {
      const withinBudget = budgets.filter(b => {
        const spent = byCategory.find(c => c.cat.id === b.categoryId)?.total || 0;
        return spent <= b.limitAmount;
      }).length;
      budgetScore = Math.round((withinBudget / budgets.length) * 30);
    }

    // Debt balance: being owed more than you owe is healthier
    const totalOwedToMe = debts.filter(d => d.type === 'owed_to_me').reduce((a, d) => a + Number(d.amount), 0);
    const totalIOwe = debts.filter(d => d.type === 'i_owe').reduce((a, d) => a + Number(d.amount), 0);
    let debtScore;
    if (totalOwedToMe + totalIOwe === 0) {
      debtScore = 30; // neutral — no debts tracked
    } else {
      debtScore = Math.round((totalOwedToMe / (totalOwedToMe + totalIOwe)) * 30);
    }

    const total = savingsScore + budgetScore + debtScore;
    const band = total >= 70 ? 'Good' : total >= 40 ? 'Fair' : 'Needs attention';
    const color = total >= 70 ? '#4CAF50' : total >= 40 ? '#F59E0B' : '#EF4444';
    return { total, band, color };
  }, [incomeEstimate, monthExpense, budgets, byCategory, debts]);

  return (
    <div className="p-6 pt-12 pb-24 space-y-6">
      <BackHeader
        title="My Spending"
        onBack={onBack}
        infoKey="spending"
        infoText="This page shows how much you have spent and earned this month, and your budgets, so you can see if you are spending too much in any category."
      />

      {!loading && (
        <div className="card p-5 border border-gray-100 dark:border-brand-darkBorder shadow-sm flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 border-4"
            style={{ borderColor: healthScore.color }}
          >
            <span className="text-xl font-black text-brand-charcoal dark:text-white">{healthScore.total}</span>
          </div>
          <div className="flex-1 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Financial Health Score</p>
              <p className="font-bold" style={{ color: healthScore.color }}>{healthScore.band}</p>
            </div>
            <InfoButton title="About your Health Score" pageKey="health_score">
              Your score is based on three things: how much of your income you have left after spending, whether you are staying within your budgets, and whether you are owed more than you owe. A higher score means your money situation is healthier.
            </InfoButton>
          </div>
        </div>
      )}

      <div className="card p-5 bg-gradient-to-br from-brand-charcoal to-gray-800 text-white shadow-md border-0">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-gold bg-brand-gold/10 px-2.5 py-1 rounded-full border border-brand-gold/20">
            Active Month — {currentMonthName}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-xs text-gray-400 font-medium mb-0.5">Total Spent</p>
            {loading ? <div className="skeleton w-20 h-7 bg-white/10" /> : <p className="text-2xl font-black text-red-400">{formatCurrency(monthExpense)}</p>}
          </div>
          <div className="border-l border-gray-700/80 pl-4">
            <p className="text-xs text-gray-400 font-medium mb-0.5">Total Earned</p>
            {loading ? <div className="skeleton w-20 h-7 bg-white/10" /> : <p className="text-2xl font-black text-emerald-400">{formatCurrency(monthIncome)}</p>}
          </div>
        </div>

        {incomeEstimate > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700/60">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-bold text-gray-300">
                {spentPct}% of your income spent this month
              </span>
              <span className="text-xs text-gray-400">of {formatCurrency(incomeEstimate)}</span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${spentPct >= 100 ? 'bg-danger' : spentPct >= 70 ? 'bg-warning' : 'bg-brand-gold'}`}
                style={{ width: `${Math.min(100, spentPct)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {insights.length > 0 && (
        <section className="space-y-2">
          {insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-3 bg-white dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl px-4 py-3">
              <span className="text-lg shrink-0">{insight.icon}</span>
              <p className="text-sm font-semibold text-brand-charcoal dark:text-white leading-snug">{insight.text}</p>
            </div>
          ))}
        </section>
      )}

      <section className="card p-5 border border-gray-100 dark:border-brand-darkBorder shadow-sm">
        <div className="mb-4">
          <h2 className="font-bold text-base text-brand-charcoal dark:text-white">4-Month Spending Trend</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">Comparing your monthly expenses</p>
        </div>
        <div className="flex items-end justify-between gap-3 h-36 pt-4 pb-1">
          {monthlyTrend.map((m) => {
            const heightPct = maxTrend > 0 ? Math.round((m.total / maxTrend) * 100) : 0;
            return (
              <div key={m.label} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                <p className={`text-[11px] font-bold ${m.isCurrent ? 'text-brand-charcoal dark:text-white' : 'text-gray-400'}`}>
                  {m.total > 0 ? formatCurrency(m.total) : '₦0'}
                </p>
                <div className="w-full relative flex items-end justify-center rounded-xl bg-gray-100 dark:bg-brand-darkBorder overflow-hidden h-full max-h-[90px]">
                  <div
                    className={`w-full rounded-t-xl transition-all duration-500 ${m.isCurrent ? 'bg-gradient-to-t from-amber-400 to-brand-gold shadow-md' : 'bg-gray-300/80'}`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <p className={`text-xs font-bold ${m.isCurrent ? 'text-brand-charcoal dark:text-white' : 'text-gray-400'}`}>{m.label}</p>
                  {m.isCurrent && <span className="w-1.5 h-1.5 bg-brand-gold rounded-full mt-0.5"></span>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};

// ============================= BUDGETS =============================
const BudgetsScreen = ({ onBack }) => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [budgetModalCategory, setBudgetModalCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentMonthKey = format(new Date(), 'yyyy-MM');
  const now = new Date();
  const formatCurrency = (val) => `₦${Number(val).toLocaleString()}`;
  const getCategory = (id) => categories.find(c => c.id === id) || { name: 'Other', color: '#ccc' };

  const loadAll = async () => {
    const [txs, cats, buds] = await Promise.all([getTransactions(), getCategories(), getBudgets(currentMonthKey)]);
    setTransactions(txs);
    setCategories(cats);
    setBudgets(buds);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const getBudgetForCategory = (categoryId) => budgets.find(b => b.categoryId === categoryId) || null;

  const { monthExpense, byCategory } = useMemo(() => {
    let mExp = 0;
    const catMap = {};
    transactions.forEach(t => {
      if (t.type !== 'expense') return;
      if (!isSameMonth(parseISO(t.date), now)) return;
      const amount = Number(t.amount);
      const cat = getCategory(t.categoryId);
      mExp += amount;
      if (!catMap[t.categoryId]) catMap[t.categoryId] = { cat, total: 0, count: 0 };
      catMap[t.categoryId].total += amount;
      catMap[t.categoryId].count += 1;
    });
    return { monthExpense: mExp, byCategory: Object.values(catMap).sort((a, b) => b.total - a.total) };
  }, [transactions, categories]);

  return (
    <div className="p-6 pt-12 pb-24 space-y-6">
      <BackHeader
        title="Budgets"
        onBack={onBack}
        infoKey="budgets"
        infoText="This page shows your spending against the monthly limits you set for each category. Tap a category to set or change its budget. We will warn you before you spend too much."
      />

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
                    <button onClick={() => setBudgetModalCategory(cat)} className="text-xs font-bold text-brand-goldDark dark:text-brand-gold flex items-center gap-1">
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

// ============================= SETTINGS =============================
const SettingsScreen = ({ onBack }) => {
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [income, setIncome] = useState('');
  const [savingIncome, setSavingIncome] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();
  const confirm = useConfirm();
  const { theme, setTheme } = useTheme();
  const { user, updateIncomeEstimate } = useAuth();

  useEffect(() => {
    setIncome(user?.user_metadata?.monthly_income_estimate ? String(user.user_metadata.monthly_income_estimate) : '');
  }, []);

  const handleSaveIncome = async () => {
    setSavingIncome(true);
    try {
      await updateIncomeEstimate(income ? Number(income) : null);
      toast.success('Income updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update income');
    } finally {
      setSavingIncome(false);
    }
  };

  const handleExport = async () => {
    const data = await exportData();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `mopal_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success('Backup downloaded');
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        await importData(jsonData);
        toast.success('Data imported successfully — reloading…');
        setTimeout(() => window.location.reload(), 900);
      } catch (err) {
        toast.error('Failed to import data. Check the file is a valid backup JSON.');
        console.error(err);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearData = async () => {
    const ok = await confirm({
      title: 'Delete all data?',
      message: 'This permanently deletes all your transactions, goals, debts, and custom categories. This cannot be undone.',
      confirmLabel: 'Delete Everything',
      danger: true,
    });
    if (!ok) return;
    await clearAllData();
    toast.success('All data cleared — reloading…');
    setTimeout(() => window.location.reload(), 900);
  };

  return (
    <div className="p-6 pt-12 pb-24 space-y-8">
      <BackHeader
        title="Settings"
        onBack={onBack}
        infoKey="settings"
        infoText="This page lets you change our look, manage your categories, set up repeating payments, back up your data, or sign out."
      />

      {/* Appearance */}
      <section>
        <h2 className="font-bold text-xl mb-4">Appearance</h2>
        <div className="card border border-gray-100 dark:border-brand-darkBorder shadow-sm p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Choose how Mopal looks on this device.</p>
          <div className="flex bg-gray-100 dark:bg-brand-darkBorder p-1 rounded-xl">
            {THEME_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                  theme === opt.value ? 'bg-white dark:bg-brand-darkCard shadow-sm text-brand-charcoal dark:text-white' : 'text-gray-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Income */}
      <section>
        <h2 className="font-bold text-xl mb-4">Monthly Income</h2>
        <div className="card border border-gray-100 dark:border-brand-darkBorder shadow-sm p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Used to show how much of your income you're spending each month.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full sm:flex-1 p-3 rounded-xl border border-gray-200 dark:border-brand-darkBorder dark:bg-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold font-bold"
              placeholder="e.g. 250000"
            />
            <button
              onClick={handleSaveIncome}
              disabled={savingIncome}
              className="btn-primary w-full sm:w-auto px-5 disabled:opacity-50"
            >
              {savingIncome ? '…' : 'Save'}
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="font-bold text-xl mb-4">Categories</h2>
        <div className="card border border-gray-100 dark:border-brand-darkBorder shadow-sm p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Add, edit or delete your spending and income categories.</p>
          <button
            onClick={() => setIsCategoriesModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-brand-charcoal text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Manage Categories
          </button>
        </div>
      </section>

      {/* Data Backup */}
      <section>
        <h2 className="font-bold text-xl mb-4">Data Backup</h2>
        <div className="card space-y-3 shadow-sm border border-gray-100 dark:border-brand-darkBorder p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Export regularly to keep a personal copy of your data.</p>
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 bg-brand-charcoal text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Backup (JSON)
          </button>
          <div className="relative">
            <input type="file" accept=".json" ref={fileInputRef} onChange={handleImport} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <button className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-brand-darkBorder text-brand-charcoal dark:text-white font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Import Backup (JSON)
            </button>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <h2 className="font-bold text-xl mb-4 text-red-500">Danger Zone</h2>
        <div className="card shadow-sm border border-red-100 dark:border-red-900/40 p-5 bg-red-50/30 dark:bg-red-950/20">
          <button
            onClick={handleClearData}
            className="w-full bg-red-100 text-red-600 font-bold py-3 rounded-xl hover:bg-red-200 transition-colors"
          >
            Clear All App Data
          </button>
        </div>
      </section>

      <CategoriesListModal isOpen={isCategoriesModalOpen} onClose={() => setIsCategoriesModalOpen(false)} />
    </div>
  );
};

// ============================= RECURRING =============================
const RecurringScreen = ({ onBack }) => {
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [recurringRules, setRecurringRules] = useState([]);
  const [categories, setCategories] = useState([]);
  const toast = useToast();
  const confirm = useConfirm();

  const loadRecurring = async () => {
    const [rules, cats] = await Promise.all([getRecurringRules(), getCategories()]);
    setRecurringRules(rules);
    setCategories(cats);
  };

  useEffect(() => { loadRecurring(); }, []);

  const getCategoryName = (id) => categories.find(c => c.id === id)?.name || 'Uncategorized';

  const handleDeleteRule = async (id) => {
    const ok = await confirm({ title: 'Delete recurring transaction?', confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    await deleteRecurringRule(id);
    toast.success('Recurring transaction deleted');
    loadRecurring();
  };

  const toggleRuleActive = async (rule) => {
    await saveRecurringRule({ ...rule, isActive: !rule.isActive });
    loadRecurring();
  };

  return (
    <div className="p-6 pt-12 pb-24 space-y-6">
      <BackHeader
        title="Recurring"
        onBack={onBack}
        infoKey="recurring"
        infoText="Recurring transactions are payments or income that repeat, such as rent, salary, or a subscription. Add one here, and we will record it for you automatically on each date, so you do not have to remember to enter it every time."
      />

      <div className="flex justify-end">
        <button
          onClick={() => { setEditingRule(null); setIsRecurringModalOpen(true); }}
          className="text-xs font-bold text-brand-goldDark dark:text-brand-gold flex items-center gap-1"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Add
        </button>
      </div>

      {recurringRules.length === 0 ? (
        <div className="card border border-dashed border-gray-200 dark:border-brand-darkBorder shadow-none p-5 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">No recurring transactions yet — rent, salary, subscriptions, etc.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recurringRules.map(rule => (
            <div key={rule.id} className="card p-4 border border-gray-100 dark:border-brand-darkBorder shadow-sm flex items-center justify-between gap-3">
              <button className="flex-1 text-left min-w-0" onClick={() => { setEditingRule(rule); setIsRecurringModalOpen(true); }}>
                <p className="font-bold text-brand-charcoal dark:text-white text-sm truncate">
                  {rule.note || getCategoryName(rule.categoryId)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {FREQ_LABEL[rule.frequency]} · ₦{Number(rule.amount).toLocaleString()} · {rule.type === 'expense' ? 'Expense' : 'Income'}
                </p>
              </button>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleRuleActive(rule)}
                  className={`w-9 h-5 rounded-full relative transition-colors ${rule.isActive ? 'bg-brand-gold' : 'bg-gray-200 dark:bg-brand-darkBorder'}`}
                  title={rule.isActive ? 'Active' : 'Paused'}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${rule.isActive ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
                <button onClick={() => handleDeleteRule(rule.id)} className="text-gray-300 hover:text-danger transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <RecurringModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        initialData={editingRule}
        onSaved={loadRecurring}
      />
    </div>
  );
};

// ============================= ROOT =============================
const Me = () => {
  const [screen, setScreen] = useState('hub'); // 'hub' | 'spending' | 'settings'
  const { user, signOut } = useAuth();

  if (screen === 'spending') return <SpendingScreen onBack={() => setScreen('hub')} />;
  if (screen === 'budgets') return <BudgetsScreen onBack={() => setScreen('hub')} />;
  if (screen === 'recurring') return <RecurringScreen onBack={() => setScreen('hub')} />;
  if (screen === 'settings') return <SettingsScreen onBack={() => setScreen('hub')} />;
  return <MeHub user={user} onNavigate={setScreen} onSignOut={signOut} />;
};

export default Me;
