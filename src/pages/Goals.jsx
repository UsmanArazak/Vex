import React, { useState, useMemo, useEffect } from 'react';
import { getGoals, deleteGoal, saveGoal } from '../utils/storage';
import GoalModal from '../components/GoalModal';
import { format, parse } from 'date-fns';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState(null);

  const formatCurrency = (val) => `₦${Number(val).toLocaleString()}`;

  const refreshData = async () => {
    setGoals(await getGoals());
  };

  useEffect(() => { refreshData(); }, []);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await deleteGoal(id);
      refreshData();
    }
  };

  const openEdit = (goal) => {
    setActiveGoal(goal);
    setIsModalOpen(true);
  };

  const toggleComplete = async (goal) => {
    await saveGoal({ ...goal, isCompleted: !goal.isCompleted });
    refreshData();
  };

  // Summary total cost of UNCOMPLETED (active) goals
  const activeGoals = useMemo(() => goals.filter(g => !g.isCompleted), [goals]);
  const completedGoals = useMemo(() => goals.filter(g => g.isCompleted), [goals]);

  const totalCost = useMemo(() => {
    return activeGoals.filter(g => g.cost).reduce((acc, g) => acc + g.cost, 0);
  }, [activeGoals]);

  // Group active goals by targetMonth
  const groupedActiveGoals = useMemo(() => {
    const groups = {};
    const sorted = [...activeGoals].sort((a, b) => {
      if (a.targetMonth === b.targetMonth) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return a.targetMonth.localeCompare(b.targetMonth);
    });
    sorted.forEach(g => {
      const monthStr = g.targetMonth;
      if (!groups[monthStr]) groups[monthStr] = [];
      groups[monthStr].push(g);
    });
    return groups;
  }, [activeGoals]);

  const formatMonth = (monthStr) => {
    if (!monthStr) return 'Unplanned';
    try {
      const date = parse(monthStr, 'yyyy-MM', new Date());
      return format(date, 'MMMM yyyy');
    } catch {
      return monthStr;
    }
  };

  return (
    <div className="p-6 pt-12 pb-24 space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold text-brand-charcoal">Bucket List</h1>
        <button 
          onClick={() => { setActiveGoal(null); setIsModalOpen(true); }}
          className="bg-brand-charcoal text-white p-2 px-4 rounded-xl shadow-sm font-bold text-sm hover:bg-gray-800 transition-colors"
        >
          + Add Item
        </button>
      </div>

      {/* Total cost summary card (Active Goals Only) */}
      <div className="card bg-brand-charcoal text-white p-5 shadow-md border-0 flex items-center justify-between">
        <div>
          <p className="text-xs text-white/60 font-bold uppercase tracking-wider mb-1">Total Cost</p>
          <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
        </div>
      </div>

      {/* Active Goals Section */}
      <div className="space-y-6">
        {Object.keys(groupedActiveGoals).length > 0 ? (
          Object.keys(groupedActiveGoals).map(monthStr => (
            <div key={monthStr}>
              <h3 className="font-bold text-lg text-brand-gold mb-3 border-b-2 border-brand-gold pb-1 inline-block">
                {formatMonth(monthStr)}
              </h3>
              
              <div className="space-y-3 mt-2">
                {groupedActiveGoals[monthStr].map(goal => (
                  <div 
                    key={goal.id} 
                    className="card p-4 shadow-sm border border-gray-100 bg-white transition-all hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button 
                          onClick={() => toggleComplete(goal)}
                          className="w-6 h-6 shrink-0 rounded-md border-2 border-gray-300 flex items-center justify-center text-transparent hover:border-brand-charcoal transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </button>
                        
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-3 h-3 shrink-0 rounded-full" style={{ backgroundColor: goal.color }}></span>
                          <h4 className="font-bold text-brand-charcoal truncate">
                            {goal.name}
                          </h4>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {goal.cost && (
                          <span className="text-sm font-bold text-brand-charcoal bg-brand-gold/20 px-2 py-1 rounded-lg">
                            {formatCurrency(goal.cost)}
                          </span>
                        )}
                        <button onClick={() => openEdit(goal)} className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-charcoal rounded-lg">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </button>
                        <button onClick={() => handleDelete(goal.id)} className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-8 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 mb-4">Your bucket list is empty. What's next on your wish list?</p>
            <button onClick={() => { setActiveGoal(null); setIsModalOpen(true); }} className="text-brand-gold font-bold">Add your first item</button>
          </div>
        )}
      </div>

      {/* Completed Section */}
      {completedGoals.length > 0 && (
        <div className="pt-6 border-t border-gray-200">
          <h3 className="font-bold text-lg text-gray-500 mb-3">Completed ({completedGoals.length})</h3>
          <div className="space-y-3">
            {completedGoals.map(goal => (
              <div 
                key={goal.id} 
                className="card p-4 shadow-sm border border-gray-100 bg-gray-50/80 opacity-70 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button 
                    onClick={() => toggleComplete(goal)}
                    className="w-6 h-6 shrink-0 rounded-md bg-brand-charcoal border-2 border-brand-charcoal text-white flex items-center justify-center transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </button>
                  
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-3 h-3 shrink-0 rounded-full" style={{ backgroundColor: goal.color }}></span>
                    <h4 className="font-bold text-gray-400 line-through truncate">
                      {goal.name}
                    </h4>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {goal.cost && (
                    <span className="text-sm font-bold text-gray-400 bg-gray-200 px-2 py-1 rounded-lg">
                      {formatCurrency(goal.cost)}
                    </span>
                  )}
                  <button onClick={() => handleDelete(goal.id)} className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <GoalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialData={activeGoal}
        onSaved={refreshData}
      />
    </div>
  );
};

export default Goals;
