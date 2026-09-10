import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  getTransactions, getCategories, getBudgets,
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

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];
const FREQ_LABEL = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };

const BackHeader = ({ title, onBack }) => (
  <header className="flex items-center gap-3 mb-6">
    <button onClick={onBack} className="btn-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <h1 className="text-2xl font-bold text-brand-charcoal dark:text-white">{title}</h1>
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
        <div className="min-w-0">
          <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Signed in as</p>
          <p className="font-bold text-brand-charcoal dark:text-white truncate">{user?.email}</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate('spending')}
          className="card p-5 border border-gray-100 dark:border-brand-darkBorder shadow-sm text-left hover:shadow-md transition-shadow group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-gold/20 flex items-center justify-center mb-3 group-hover:bg-brand-gold/30 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <p className="font-bold text-brand-charcoal dark:text-white text-sm">My Spending</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Insights & budgets</p>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className="card p-5 border border-gray-100 dark:border-brand-darkBorder shadow-sm text-left hover:shadow-md transition-shadow group"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-brand-darkBorder flex items-center justify-center mb-3 group-hover:bg-gray-200 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </div>
          <p className="font-bold text-brand-charcoal dark:text-white text-sm">Settings</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Appearance, categories & more</p>
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
  const [budgetModalCategory, setBudgetModalCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentMonthKey = format(new Date(), 'yyyy-MM');
  const now = new Date();

  const loadAll = async () => {
    const [txs, cats, buds] = await Promise.all([getTransactions(), getCategories(), getBudgets(currentMonthKey)]);
    setTransactions(txs);
    setCategories(cats);
    setBudgets(buds);
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

  return (
    <div className="p-6 pt-12 pb-24 space-y-6">
      <BackHeader title="My Spending" onBack={onBack} />

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
      </div>

      <section className="card p-5 border border-gray-100 dark:border-brand-darkBorder shadow-sm">
        <div className="mb-4">
          <h2 className="font-bold text-base text-brand-charcoal dark:text-white">4-Month Spending Trend</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">Comparing your monthly expenses</p>
        </div>
        <div className="flex items-end justify-between gap-3 h-36 pt-4 pb-1">
          {monthlyTrend.map((m) => {
            const heightPct = maxTrend > 0 ? Math.max(12, Math.round((m.total / maxTrend) * 100)) : 12;
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
      </section>

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
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [recurringRules, setRecurringRules] = useState([]);
  const [categories, setCategories] = useState([]);
  const fileInputRef = useRef(null);
  const toast = useToast();
  const confirm = useConfirm();
  const { theme, setTheme } = useTheme();

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
      <BackHeader title="Settings" onBack={onBack} />

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

      {/* Recurring Transactions */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-xl">Recurring</h2>
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
  if (screen === 'settings') return <SettingsScreen onBack={() => setScreen('hub')} />;
  return <MeHub user={user} onNavigate={setScreen} onSignOut={signOut} />;
};

export default Me;
