import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getCategories, saveTransaction } from '../utils/storage';

const TransactionModal = ({ isOpen, onClose, initialData = null, onSaved }) => {
  const categories = getCategories();
  
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setType(initialData.type);
        setAmount(initialData.amount);
        setCategoryId(initialData.categoryId);
        setNote(initialData.note || '');
      } else {
        setType('expense');
        setAmount('');
        setCategoryId(categories.find(c => c.type === 'expense')?.id || '');
        setNote('');
      }
    }
  }, [isOpen, initialData, categories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !categoryId) return;

    const transaction = {
      id: initialData?.id, // will be undefined for new
      type,
      amount: Number(amount),
      categoryId,
      note,
      date: initialData?.date || new Date().toISOString()
    };

    saveTransaction(transaction);
    onSaved();
    onClose();
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter(c => c.type === type);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-brand-charcoal/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl p-6 w-full max-w-md mx-auto shadow-2xl animate-in slide-in-from-bottom-full duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{initialData ? 'Edit' : 'Add'} Transaction</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-brand-charcoal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${type === 'expense' ? 'bg-white shadow-sm text-brand-charcoal' : 'text-gray-500'}`}
              onClick={() => { setType('expense'); setCategoryId(categories.find(c => c.type === 'expense')?.id || ''); }}
            >
              Expense
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${type === 'income' ? 'bg-white shadow-sm text-brand-charcoal' : 'text-gray-500'}`}
              onClick={() => { setType('income'); setCategoryId(categories.find(c => c.type === 'income')?.id || ''); }}
            >
              Income
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Amount (₦)</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-3xl font-bold bg-transparent border-b-2 border-gray-200 focus:border-brand-gold outline-none py-2 transition-colors"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {filteredCategories.map(cat => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    categoryId === cat.id ? 'ring-2 ring-brand-charcoal shadow-sm' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: `${cat.color}20`, color: cat.color }} // 20% opacity bg
                >
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: cat.color }}>
                    {cat.name.charAt(0)}
                  </span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Note (Optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-gold/50 transition-all"
              placeholder="What was this for?"
            />
          </div>

          <button type="submit" className="btn-primary w-full mt-4">
            Save {type === 'expense' ? 'Expense' : 'Income'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default TransactionModal;
