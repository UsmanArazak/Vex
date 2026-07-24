import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { format } from 'date-fns';

const DebtModal = ({ isOpen, onClose, initialData = null, onSaved }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('owed_to_me'); // or 'i_owe'

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setAmount(initialData.amount);
        setDate(initialData.date);
        setType(initialData.type);
      } else {
        setName('');
        setAmount('');
        setDate(format(new Date(), 'yyyy-MM-dd'));
        setType('owed_to_me');
      }
    }
  }, [isOpen, initialData]);

  const handleSave = () => {
    const debt = {
      id: initialData?.id,
      name,
      amount: Number(amount),
      date,
      type,
    };
    onSaved(debt);
    onClose();
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>✕</button>
        <h2 className="text-xl font-bold mb-4">{initialData ? 'Edit Debt' : 'Add Debt'}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Amount (₦)</label>
            <input
              type="number"
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Direction</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold/50">
              <option value="owed_to_me">Owed</option>
              <option value="i_owe">I Owe</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-6 space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-brand-charcoal text-white rounded-lg hover:bg-gray-800">Save</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DebtModal;
