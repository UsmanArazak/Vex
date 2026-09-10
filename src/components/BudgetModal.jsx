// src/components/BudgetModal.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { saveBudget, deleteBudget } from '../utils/storage';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';

const BudgetModal = ({ isOpen, onClose, category, month, existingBudget, onSaved }) => {
  const [limitAmount, setLimitAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    if (isOpen) {
      setLimitAmount(existingBudget ? String(existingBudget.limitAmount) : '');
    }
  }, [isOpen, existingBudget]);

  if (!isOpen || !category) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!limitAmount || saving) return;
    setSaving(true);
    try {
      await saveBudget({
        id: existingBudget?.id,
        categoryId: category.id,
        month,
        limitAmount: Number(limitAmount),
      });
      toast.success(`Budget set for ${category.name}`);
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save budget');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({ title: 'Remove this budget?', confirmLabel: 'Remove', danger: true });
    if (!ok) return;
    await deleteBudget(existingBudget.id);
    toast.success('Budget removed');
    onSaved();
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-brand-charcoal/50 backdrop-blur-sm animate-toast-in" onClick={onClose}>
      <div
        className="bg-white dark:bg-brand-darkCard rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shrink-0" style={{ backgroundColor: category.color }}>
            {category.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-brand-charcoal dark:text-white">{category.name} Budget</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500">Monthly spending limit</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Limit (₦)</label>
          <input
            type="number"
            inputMode="decimal"
            required
            min="0"
            value={limitAmount}
            onChange={(e) => setLimitAmount(e.target.value)}
            autoFocus
            className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-brand-darkBorder dark:bg-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold text-lg font-bold"
            placeholder="0"
          />

          <div className="flex gap-3 mt-5">
            {existingBudget && (
              <button type="button" onClick={handleDelete} className="px-4 py-3 rounded-xl font-semibold text-sm text-danger bg-red-50 dark:bg-red-950/30 hover:bg-red-100 transition-colors">
                Remove
              </button>
            )}
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default BudgetModal;
