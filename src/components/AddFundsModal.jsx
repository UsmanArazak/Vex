import React, { useState, useEffect } from 'react';
import { saveGoal } from '../utils/storage';

const AddFundsModal = ({ isOpen, onClose, goal, onSaved }) => {
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount('');
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !goal) return;

    const updatedGoal = {
      ...goal,
      currentAmount: goal.currentAmount + Number(amount)
    };

    saveGoal(updatedGoal);
    onSaved();
    onClose();
  };

  if (!isOpen || !goal) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-brand-charcoal/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl p-6 w-full max-w-md mx-auto shadow-2xl animate-in slide-in-from-bottom-full duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Add Funds to {goal.name}</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-brand-charcoal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Amount to Add (₦)</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-3xl font-bold bg-transparent border-b-2 border-gray-200 focus:border-brand-gold outline-none py-2 transition-colors"
              placeholder="0"
            />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-xl text-sm flex justify-between">
            <span className="text-gray-500">New Progress:</span>
            <span className="font-bold text-brand-charcoal">
              ₦{(goal.currentAmount + Number(amount || 0)).toLocaleString()} / ₦{goal.targetAmount.toLocaleString()}
            </span>
          </div>

          <button type="submit" className="btn-primary w-full mt-4">
            Add Funds
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFundsModal;
