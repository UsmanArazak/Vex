import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getCategories, saveTransaction, getGoals } from '../utils/storage';
import { useToast } from '../context/ToastContext';

const TransactionModal = ({ isOpen, onClose, initialData = null, onSaved }) => {
  const [categories, setCategories] = useState([]);
  const [goals, setGoals] = useState([]);
  const toast = useToast();

  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [goalId, setGoalId] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      Promise.all([getCategories(), getGoals()]).then(([cats, allGoals]) => {
        setCategories(cats);
        setGoals(allGoals.filter(g => !g.isCompleted));
        if (initialData) {
          setType(initialData.type);
          setAmount(initialData.amount);
          setCategoryId(initialData.categoryId);
          setGoalId(initialData.goalId || '');
          setNote(initialData.note || '');
        } else {
          setType('expense');
          setAmount('');
          setCategoryId(cats.find(c => c.type === 'expense')?.id || '');
          setGoalId('');
          setNote('');
        }
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !categoryId || saving) return;

    const transaction = {
      id: initialData?.id, // will be undefined for new
      type,
      amount: Number(amount),
      categoryId,
      goalId: type === 'expense' ? (goalId || null) : null,
      note,
      date: initialData?.date || new Date().toISOString()
    };

    setSaving(true);
    try {
      await saveTransaction(transaction);
      onSaved();
      onClose();
      toast.success(initialData ? 'Transaction updated' : 'Transaction added');
    } catch (err) {
      toast.error(err.message || 'Failed to save transaction');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter(c => c.type === type);

  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-brand-charcoal/50 backdrop-blur-sm animate-toast-in" onClick={onClose}>
      <div
        className="bg-white dark:bg-brand-darkCard rounded-t-3xl sm:rounded-3xl p-6 w-full sm:max-w-md shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{initialData ? 'Edit' : 'Add'} Transaction</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-brand-darkBorder rounded-full text-gray-500 dark:text-gray-400 hover:text-brand-charcoal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Toggle */}
          <div className="flex bg-gray-100 dark:bg-brand-darkBorder p-1 rounded-xl">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${type === 'expense' ? 'bg-white dark:bg-brand-darkCard shadow-sm text-brand-charcoal dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => { setType('expense'); setCategoryId(categories.find(c => c.type === 'expense')?.id || ''); }}
            >
              Expense
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${type === 'income' ? 'bg-white dark:bg-brand-darkCard shadow-sm text-brand-charcoal dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => { setType('income'); setCategoryId(categories.find(c => c.type === 'income')?.id || ''); }}
            >
              Income
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Amount (₦)</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-3xl font-bold bg-transparent border-b-2 border-gray-200 dark:border-brand-darkBorder focus:border-brand-gold outline-none py-2 transition-colors"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Category</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {filteredCategories.map(cat => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    categoryId === cat.id ? 'bg-white dark:bg-brand-darkCard shadow-md scale-105 border border-brand-charcoal/10 dark:border-white/10' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ 
                    backgroundColor: categoryId === cat.id ? '#fff' : `${cat.color}20`, 
                    color: categoryId === cat.id ? '#000' : cat.color,
                    boxShadow: categoryId === cat.id ? `0 4px 12px ${cat.color}40` : 'none'
                  }}
                >
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: cat.color }}>
                    {cat.name.charAt(0)}
                  </span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {type === 'expense' && goals.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Link to a goal (optional)</label>
              <div className="flex gap-2 flex-wrap mt-2">
                <button
                  type="button"
                  onClick={() => setGoalId('')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    !goalId ? 'bg-brand-charcoal text-white dark:bg-white dark:text-brand-charcoal' : 'bg-gray-100 dark:bg-brand-darkBorder text-gray-500 dark:text-gray-400'
                  }`}
                >
                  None
                </button>
                {goals.map(g => (
                  <button
                    type="button"
                    key={g.id}
                    onClick={() => setGoalId(g.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
                      goalId === g.id
                        ? 'shadow-md scale-105 border-transparent'
                        : 'bg-gray-100 dark:bg-brand-darkBorder text-gray-600 dark:text-gray-300 border-transparent opacity-90 hover:opacity-100'
                    }`}
                    style={goalId === g.id ? { backgroundColor: g.color, color: '#2D3142' } : {}}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Note (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-gray-50 dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all"
              placeholder="What was this for?"
            />
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full mt-4 disabled:opacity-50">
            {saving ? 'Saving…' : `Save ${type === 'expense' ? 'Expense' : 'Income'}`}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default TransactionModal;
