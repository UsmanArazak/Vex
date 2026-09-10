import React, { useState, useMemo, useEffect } from 'react';
import { getDebts, saveDebt, deleteDebt } from '../utils/storage';
import DebtModal from '../components/DebtModal';
import { format, parseISO } from 'date-fns';

const formatCurrency = (val) => `₦${Number(val).toLocaleString()}`;

const Debts = () => {
  const [debts, setDebts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDebt, setActiveDebt] = useState(null);
  const [activeTab, setActiveTab] = useState('owed_to_me');

  const refresh = async () => setDebts(await getDebts());

  useEffect(() => { refresh(); }, []);

  const owedToMe = useMemo(() => debts.filter(d => d.type === 'owed_to_me').sort((a, b) => new Date(b.date) - new Date(a.date)), [debts]);
  const iOwe = useMemo(() => debts.filter(d => d.type === 'i_owe').sort((a, b) => new Date(b.date) - new Date(a.date)), [debts]);

  const totalOwedToMe = owedToMe.reduce((a, d) => a + Number(d.amount), 0);
  const totalIOwe = iOwe.reduce((a, d) => a + Number(d.amount), 0);

  const openEdit = (debt) => { setActiveDebt(debt); setIsModalOpen(true); };
  const handleDelete = async (id) => { if (confirm('Delete this debt entry?')) { await deleteDebt(id); refresh(); } };

  const activeList = activeTab === 'owed_to_me' ? owedToMe : iOwe;

  const formatDate = (dateStr) => {
    try { return format(parseISO(dateStr), 'MMM d, yyyy'); } catch { return dateStr; }
  };

  return (
    <div className="p-6 pt-12 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-brand-charcoal">Debts</h1>
        <button
          onClick={() => { setActiveDebt(null); setIsModalOpen(true); }}
          className="bg-brand-charcoal text-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm hover:bg-gray-800 transition-colors"
        >+ Add</button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card p-5 border-0 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <p className="text-xs font-bold uppercase text-amber-600/70 tracking-wider">Owed</p>
          </div>
          <p className="text-2xl font-black text-amber-700">{formatCurrency(totalOwedToMe)}</p>
          <p className="text-xs text-amber-600/50 mt-1">{owedToMe.length} {owedToMe.length === 1 ? 'person' : 'people'}</p>
        </div>
        <div className="card p-5 border-0 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <p className="text-xs font-bold uppercase text-emerald-600/70 tracking-wider">I Owe</p>
          </div>
          <p className="text-2xl font-black text-emerald-700">{formatCurrency(totalIOwe)}</p>
          <p className="text-xs text-emerald-600/50 mt-1">{iOwe.length} {iOwe.length === 1 ? 'person' : 'people'}</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-5">
        <button
          onClick={() => setActiveTab('owed_to_me')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
            activeTab === 'owed_to_me' ? 'bg-white shadow-sm text-brand-charcoal' : 'text-gray-400'
          }`}
        >Owed</button>
        <button
          onClick={() => setActiveTab('i_owe')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
            activeTab === 'i_owe' ? 'bg-white shadow-sm text-brand-charcoal' : 'text-gray-400'
          }`}
        >I Owe</button>
      </div>

      {/* Debt List */}
      {activeList.length > 0 ? (
        <div className="space-y-3">
          {activeList.map((d, i) => {
            const initials = d.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
            const colors = ['#FF6B6B', '#4ECDC4', '#FFE066', '#45B7D1', '#96CEB4', '#F9A826', '#9C27B0', '#3F51B5'];
            const bgColor = colors[i % colors.length];
            return (
              <div key={d.id} className="card p-4 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                {/* Avatar */}
                <div className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm" style={{ backgroundColor: bgColor }}>
                  {initials}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-brand-charcoal truncate">{d.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(d.date)}</p>
                </div>
                {/* Amount + Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`font-black text-base ${activeTab === 'owed_to_me' ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {formatCurrency(d.amount)}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(d)} className="p-1.5 text-gray-300 hover:text-brand-charcoal hover:bg-gray-100 rounded-lg transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </button>
                    <button onClick={() => handleDelete(d.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <p className="text-gray-400 font-medium mb-1">No {activeTab === 'owed_to_me' ? 'debts owed to you' : 'debts you owe'}</p>
          <p className="text-xs text-gray-300">Tap + Add to track a debt</p>
        </div>
      )}

      <DebtModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={activeDebt}
        onSaved={async (debt) => { await saveDebt(debt); refresh(); setIsModalOpen(false); }}
      />
    </div>
  );
};

export default Debts;
