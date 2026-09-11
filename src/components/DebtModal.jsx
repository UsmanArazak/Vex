import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { useToast } from '../context/ToastContext';

const DebtModal = ({ isOpen, onClose, initialData = null, onSaved }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [type, setType] = useState('owed_to_me'); // or 'i_owe'
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setAmount(initialData.amount);
        setDate(initialData.date);
        setDueDate(initialData.dueDate || '');
        setType(initialData.type);
      } else {
        setName('');
        setAmount('');
        setDate(format(new Date(), 'yyyy-MM-dd'));
        setDueDate('');
        setType('owed_to_me');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !amount || saving) return;
    setSaving(true);
    try {
      await onSaved({
        id: initialData?.id,
        name,
        amount: Number(amount),
        date,
        dueDate: dueDate || null,
        type,
      });
      toast.success(initialData ? 'Debt updated' : 'Debt added');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save debt');
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-brand-charcoal/50 backdrop-blur-sm animate-toast-in" onClick={onClose}>
      <div
        className="bg-white dark:bg-brand-darkCard rounded-t-3xl sm:rounded-3xl p-6 w-full sm:max-w-md shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-brand-charcoal dark:text-white">{initialData ? 'Edit' : 'Add'} Debt</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-brand-darkBorder rounded-full text-gray-500 dark:text-gray-400 hover:text-brand-charcoal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex bg-gray-100 dark:bg-brand-darkBorder p-1 rounded-xl">
            {[['owed_to_me', 'Owed to Me'], ['i_owe', 'I Owe']].map(([val, label]) => (
              <button
                key={val}
                type="button"
                onClick={() => setType(val)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  type === val ? 'bg-white dark:bg-brand-darkCard shadow-sm text-brand-charcoal dark:text-white' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-brand-darkBorder dark:bg-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
              placeholder="e.g. Tunde"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount (₦)</label>
            <input
              type="number"
              inputMode="decimal"
              required
              min="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-brand-darkBorder dark:bg-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold text-lg font-bold"
              placeholder="0"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-brand-darkBorder dark:bg-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due date (optional)</label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-brand-darkBorder dark:bg-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">We'll remind you when this is due or overdue.</p>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full mt-2 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Debt'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default DebtModal;
