import React, { useState, useMemo } from 'react';
import { getDebts, saveDebt, deleteDebt } from '../utils/storage';
import DebtModal from '../components/DebtModal';

const formatCurrency = (val) => `₦${Number(val).toLocaleString()}`;

const Debts = () => {
  const [debts, setDebts] = useState(getDebts());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDebt, setActiveDebt] = useState(null);

  const refresh = () => setDebts(getDebts());

  const totalOwedToMe = useMemo(() => debts.filter(d => d.type === 'owed_to_me').reduce((a, d) => a + Number(d.amount), 0), [debts]);
  const totalIOwe = useMemo(() => debts.filter(d => d.type === 'i_owe').reduce((a, d) => a + Number(d.amount), 0), [debts]);

  const openEdit = (debt) => { setActiveDebt(debt); setIsModalOpen(true); };
  const handleDelete = (id) => { deleteDebt(id); refresh(); };
  const handleSave = (debt) => { saveDebt(debt); refresh(); };

  return (
    <div className="p-6 pt-12 pb-24 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-brand-charcoal">Debts</h1>
        <button
          onClick={() => { setActiveDebt(null); setIsModalOpen(true); }}
          className="bg-brand-charcoal text-white p-2 px-4 rounded-xl shadow-sm font-bold text-sm"
        >+ Add Debt</button>
      </header>

      {/* Totals */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 bg-red-50/50 border border-red-100">
          <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Owed to Me</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(totalOwedToMe)}</p>
        </div>
        <div className="card p-4 bg-green-50/50 border border-green-100">
          <p className="text-xs font-semibold uppercase text-gray-500 mb-1">I Owe</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(totalIOwe)}</p>
        </div>
      </div>

      {/* Lists */}
      <section>
        <h2 className="font-bold text-lg mb-3">Owed to Me</h2>
        {debts.filter(d => d.type === 'owed_to_me').length > 0 ? (
          <div className="space-y-2">
            {debts.filter(d => d.type === 'owed_to_me').map(d => (
              <div key={d.id} className="card p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-brand-charcoal">{d.name}</p>
                  <p className="text-sm text-gray-500">{d.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-600">{formatCurrency(d.amount)}</span>
                  <button onClick={() => openEdit(d)} className="p-1 text-gray-400 hover:text-brand-charcoal">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  </button>
                  <button onClick={() => handleDelete(d.id)} className="p-1 text-gray-400 hover:text-red-500">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (<p className="text-gray-400">No debts owed to you.</p>)}
      </section>

      <section>
        <h2 className="font-bold text-lg mb-3">I Owe</h2>
        {debts.filter(d => d.type === 'i_owe').length > 0 ? (
          <div className="space-y-2">
            {debts.filter(d => d.type === 'i_owe').map(d => (
              <div key={d.id} className="card p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-brand-charcoal">{d.name}</p>
                  <p className="text-sm text-gray-500">{d.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-green-600">{formatCurrency(d.amount)}</span>
                  <button onClick={() => openEdit(d)} className="p-1 text-gray-400 hover:text-brand-charcoal">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  </button>
                  <button onClick={() => handleDelete(d.id)} className="p-1 text-gray-400 hover:text-red-500">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (<p className="text-gray-400">No debts you owe.</p>)}
      </section>

      <DebtModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={activeDebt}
        onSaved={(debt) => { saveDebt(debt); refresh(); setIsModalOpen(false); }}
      />
    </div>
  );
};

export default Debts;
