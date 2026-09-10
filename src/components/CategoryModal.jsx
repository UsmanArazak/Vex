import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getCategories, saveCategories } from '../utils/storage';
import { useToast } from '../context/ToastContext';

const CategoryModal = ({ isOpen, onClose, initialData = null, onSaved }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('expense');
  const [color, setColor] = useState('#FF6B6B');
  const toast = useToast();

  const presetColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFE066', '#4CAF50', '#9C27B0', '#F9A826', '#3F51B5'];

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setType(initialData.type);
        setColor(initialData.color);
      } else {
        setName('');
        setType('expense');
        setColor('#FF6B6B');
      }
    }
  }, [isOpen, initialData]);

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || saving) return;

    setSaving(true);
    try {
      let categories = await getCategories();

      if (initialData) {
        // Edit
        categories = categories.map(c => c.id === initialData.id ? { ...c, name, type, color } : c);
      } else {
        // Create
        categories.push({ id: crypto.randomUUID(), name, type, color });
      }

      await saveCategories(categories);
      onSaved();
      onClose();
      toast.success(initialData ? 'Category updated' : 'Category added');
    } catch (err) {
      toast.error(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex flex-col justify-end bg-brand-charcoal/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-brand-darkCard rounded-t-3xl p-6 w-full max-w-md mx-auto shadow-2xl animate-in slide-in-from-bottom-full duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{initialData ? 'Edit' : 'Add'} Category</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-brand-darkBorder rounded-full text-gray-500 dark:text-gray-400 hover:text-brand-charcoal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex bg-gray-100 dark:bg-brand-darkBorder p-1 rounded-xl">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${type === 'expense' ? 'bg-white dark:bg-brand-darkCard shadow-sm text-brand-charcoal dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => setType('expense')}
            >
              Expense
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${type === 'income' ? 'bg-white dark:bg-brand-darkCard shadow-sm text-brand-charcoal dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => setType('income')}
            >
              Income
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Category Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-brand-darkCard border border-gray-100 dark:border-brand-darkBorder rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all"
              placeholder="e.g. Groceries"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Color</label>
            <div className="flex flex-wrap gap-3">
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
            {saving ? 'Saving…' : 'Save Category'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CategoryModal;
