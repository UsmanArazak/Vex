import React, { useState, useMemo, useEffect } from 'react';
import { getTransactions, getCategories, deleteTransaction } from '../utils/storage';
import { format, parseISO } from 'date-fns';
import TransactionModal from '../components/TransactionModal';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';
import { SkeletonList } from '../components/ui/Skeleton';
import InfoButton from '../components/ui/InfoButton';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const confirm = useConfirm();
  const toast = useToast();

  const [filterType, setFilterType] = useState('all'); // all, income, expense
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  const refreshData = async () => {
    const [txs, cats] = await Promise.all([getTransactions(), getCategories()]);
    setTransactions(txs);
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => { refreshData(); }, []);

  const handleDelete = async (id) => {
    const ok = await confirm({ title: 'Delete transaction?', confirmLabel: 'Delete', danger: true });
    if (!ok) return;
    await deleteTransaction(id);
    toast.success('Transaction deleted');
    refreshData();
  };

  const openEdit = (tx) => {
    setEditingTx(tx);
    setIsModalOpen(true);
  };

  // Group by date
  const groupedTransactions = useMemo(() => {
    const filtered = transactions
      .filter(t => filterType === 'all' || t.type === filterType)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const groups = {};
    filtered.forEach(t => {
      const dateStr = format(parseISO(t.date), 'yyyy-MM-dd');
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(t);
    });
    return groups;
  }, [transactions, filterType]);

  const formatCurrency = (val) => `₦${val.toLocaleString()}`;
  const getCategory = (id) => categories.find(c => c.id === id) || { name: 'Other', color: '#ccc' };

  return (
    <div className="p-6 pt-12">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-brand-charcoal dark:text-white">Activity</h1>
          <InfoButton title="About Activity" pageKey="activity">
            This page shows every payment and income you have recorded. You can filter them, edit any entry, or delete one.
          </InfoButton>
        </div>
        <button 
          onClick={() => { setEditingTx(null); setIsModalOpen(true); }}
          className="bg-brand-gold text-brand-charcoal dark:text-white p-2 rounded-xl shadow-sm font-bold text-sm px-4"
        >
          + Add New
        </button>
      </div>

      {/* Filters based on the image's pill filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
        {['all', 'expense', 'income'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filterType === type 
                ? 'bg-brand-gold text-brand-charcoal shadow-sm' 
                : 'bg-white dark:bg-brand-darkCard text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-brand-darkBorder hover:bg-gray-50 dark:hover:bg-brand-darkBorder'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-6 pb-12">
        {loading ? (
          <SkeletonList count={5} />
        ) : Object.keys(groupedTransactions).length > 0 ? (
          Object.keys(groupedTransactions).map(dateStr => (
            <div key={dateStr}>
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-wider">
                {format(parseISO(dateStr), 'MMMM d, yyyy')}
              </h3>
              <div className="space-y-3">
                {groupedTransactions[dateStr].map(t => {
                  const cat = getCategory(t.categoryId);
                  return (
                    <div key={t.id} className="card p-4 flex items-center justify-between shadow-sm border border-gray-100 dark:border-brand-darkBorder relative group overflow-hidden">
                      <div className="flex items-center gap-3 relative z-10">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-inner" style={{ backgroundColor: cat.color }}>
                          {cat.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-brand-charcoal dark:text-white">{cat.name}</h4>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{t.note || format(parseISO(t.date), 'h:mm a')}</p>
                        </div>
                      </div>
                      <div className="text-right relative z-10 flex flex-col items-end gap-1">
                        <p className={`font-bold ${t.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                          {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                        </p>
                        {/* Actions (visible on hover or focus for desktop, tap for mobile) */}
                        <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(t)} className="text-xs text-gray-400 dark:text-gray-500 hover:text-brand-charcoal bg-gray-100 dark:bg-brand-darkBorder px-2 py-1 rounded">Edit</button>
                          <button onClick={() => handleDelete(t.id)} className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 bg-red-50 px-2 py-1 rounded">Del</button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-12 text-gray-400 dark:text-gray-500 bg-white dark:bg-brand-darkCard rounded-3xl border border-dashed border-gray-200 dark:border-brand-darkBorder">
            No transactions found.
          </div>
        )}
      </div>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={editingTx}
        onSaved={refreshData}
      />
    </div>
  );
};

export default Transactions;
