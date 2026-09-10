import React, { useState, useRef, useEffect } from 'react';
import { exportData, importData, clearAllData, getRecurringRules, deleteRecurringRule, saveRecurringRule, getCategories } from '../utils/storage';
import CategoriesListModal from '../components/CategoriesListModal';
import RecurringModal from '../components/RecurringModal';
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

const Settings = () => {
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [recurringRules, setRecurringRules] = useState([]);
  const [categories, setCategories] = useState([]);
  const fileInputRef = useRef(null);
  const { user, signOut } = useAuth();
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

  // Export Data
  const handleExport = async () => {
    const data = await exportData();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `vex_wallet_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success('Backup downloaded');
  };

  // Import Data
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

  // Clear Data
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
      <h1 className="text-3xl font-bold text-brand-charcoal dark:text-white mb-8">Settings</h1>

      {/* Account */}
      <section>
        <h2 className="font-bold text-xl mb-4">Account</h2>
        <div className="card border border-gray-100 dark:border-brand-darkBorder shadow-sm p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 truncate">Signed in as <span className="font-semibold text-brand-charcoal dark:text-white">{user?.email}</span></p>
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-brand-darkBorder text-brand-charcoal dark:text-white font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </section>

      {/* Appearance */}
      <section>
        <h2 className="font-bold text-xl mb-4">Appearance</h2>
        <div className="card border border-gray-100 dark:border-brand-darkBorder shadow-sm p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Choose how Vex looks on this device.</p>
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
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Your data is stored locally. Export regularly to avoid losing it.</p>

          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 bg-brand-charcoal text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Backup (JSON)
          </button>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
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

      <CategoriesListModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
      />
      <RecurringModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        initialData={editingRule}
        onSaved={loadRecurring}
      />
    </div>
  );
};

export default Settings;
