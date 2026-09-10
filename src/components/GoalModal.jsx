import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { saveGoal } from '../utils/storage';
import { useToast } from '../context/ToastContext';
import { format } from 'date-fns';

const GoalModal = ({ isOpen, onClose, initialData = null, onSaved }) => {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [targetMonth, setTargetMonth] = useState('');
  const [color, setColor] = useState('#FFE066');
  const toast = useToast();

  const presetColors = ['#FFE066', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#9C27B0'];

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setCost(initialData.cost || '');
        setTargetMonth(initialData.targetMonth || format(new Date(), 'yyyy-MM'));
        setColor(initialData.color || '#FFE066');
      } else {
        setName('');
        setCost('');
        setTargetMonth(format(new Date(), 'yyyy-MM'));
        setColor('#FFE066');
      }
    }
  }, [isOpen, initialData]);

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || saving) return;

    const goal = {
      id: initialData?.id,
      name,
      cost: cost ? Number(cost) : null,
      targetMonth, // format: "YYYY-MM"
      isCompleted: initialData?.isCompleted || false,
      color,
      createdAt: initialData?.createdAt || new Date().toISOString()
    };

    setSaving(true);
    try {
      await saveGoal(goal);
      onSaved();
      onClose();
      toast.success(initialData ? 'Item updated' : 'Added to bucket list');
    } catch (err) {
      toast.error(err.message || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-brand-charcoal/50 backdrop-blur-sm animate-toast-in" onClick={onClose}>
      <div
        className="bg-white dark:bg-brand-darkCard rounded-t-3xl sm:rounded-3xl p-6 w-full sm:max-w-md shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{initialData ? 'Edit' : 'Add to'} Bucket List</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-brand-darkBorder rounded-full text-gray-500 dark:text-gray-400 hover:text-brand-charcoal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">What do you want to buy?</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-2xl font-bold bg-transparent border-b-2 border-gray-200 dark:border-brand-darkBorder focus:border-brand-gold outline-none py-2 transition-colors"
              placeholder="e.g. New Sneakers"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Estimated Cost (₦) <span className="text-gray-300 dark:text-gray-600">— optional</span></label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full bg-gray-50 dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Target Month</label>
            <input
              type="month"
              required
              value={targetMonth}
              onChange={(e) => setTargetMonth(e.target.value)}
              className="w-full bg-gray-50 dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Color</label>
            <div className="flex gap-3">
              {presetColors.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-brand-charcoal' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full mt-4 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Item'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default GoalModal;
