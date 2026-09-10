// src/components/RecurringModal.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getCategories, saveRecurringRule } from '../utils/storage';
import { useToast } from '../context/ToastContext';

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const todayStr = () => new Date().toISOString().split('T')[0];

const RecurringModal = ({ isOpen, onClose, initialData = null, onSaved }) => {
  const [categories, setCategories] = useState([]);
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [startDate, setStartDate] = useState(todayStr());
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      getCategories().then(cats => {
        setCategories(cats);
        if (initialData) {
          setType(initialData.type);
          setAmount(String(initialData.amount));
          setCategoryId(initialData.categoryId || '');
          setNote(initialData.note || '');
          setFrequency(initialData.frequency);
          setStartDate(initialData.nextRunDate);
        } else {
          setType('expense');
          setAmount('');
          setCategoryId(cats.find(c => c.type === 'expense')?.id || '');
          setNote('');
          setFrequency('monthly');
          setStartDate(todayStr());
        }
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !categoryId || saving) return;
    setSaving(true);
    try {
      await saveRecurringRule({
        id: initialData?.id,
        type,
        amount: Number(amount),
        categoryId,
        note,
        frequency,
        nextRunDate: startDate,
        isActive: true,
      });
      toast.success(initialData ? 'Recurring transaction updated' : 'Recurring transaction created');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = categories.filter(c => c.type === type);

  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-brand-charcoal/50 backdrop-blur-sm animate-toast-in" onClick={onClose}>
      <div
        className="bg-white dark:bg-brand-darkCard rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm p-6 max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-brand-charcoal dark:text-white mb-5">
          {initialData ? 'Edit Recurring Transaction' : 'New Recurring Transaction'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex bg-gray-100 dark:bg-brand-darkBorder p-1 rounded-xl">
            {['expense', 'income'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => { setType(t); setCategoryId(''); }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg capitalize transition-all ${
                  type === t ? 'bg-white dark:bg-brand-darkCard shadow-sm text-brand-charcoal dark:text-white' : 'text-gray-400'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount (₦)</label>
            <input
              type="number" inputMode="decimal" required min="0" value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-brand-darkBorder dark:bg-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold text-lg font-bold"
              placeholder="0"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</label>
            <select
              required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-brand-darkBorder dark:bg-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
            >
              <option value="" disabled>Select category</option>
              {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Repeats</label>
            <div className="flex bg-gray-100 dark:bg-brand-darkBorder p-1 rounded-xl mt-1">
              {FREQUENCIES.map(f => (
                <button
                  key={f.value} type="button" onClick={() => setFrequency(f.value)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    frequency === f.value ? 'bg-white dark:bg-brand-darkCard shadow-sm text-brand-charcoal dark:text-white' : 'text-gray-400'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Starting</label>
            <input
              type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-brand-darkBorder dark:bg-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Note (optional)</label>
            <input
              type="text" value={note} onChange={(e) => setNote(e.target.value)} maxLength={80}
              className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-brand-darkBorder dark:bg-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
              placeholder="e.g. Rent, Netflix, Salary"
            />
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full mt-2 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Recurring Transaction'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default RecurringModal;
