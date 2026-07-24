import React, { useState, useMemo } from 'react';
import { getGoals, deleteGoal, saveGoal } from '../utils/storage';
import GoalModal from '../components/GoalModal';
import { format, parse } from 'date-fns';

const Goals = () => {
  const [goals, setGoals] = useState(getGoals());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState(null);

  const refreshData = () => {
    setGoals(getGoals());
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteGoal(id);
      refreshData();
    }
  };

  const openEdit = (goal) => {
    setActiveGoal(goal);
    setIsModalOpen(true);
  };

  const toggleComplete = (goal) => {
    saveGoal({ ...goal, isCompleted: !goal.isCompleted });
    refreshData();
  };

  // Group by targetMonth (e.g., "2023-10")
  const groupedGoals = useMemo(() => {
    const groups = {};
    
    // Sort goals by targetMonth ascending, then by createdAt descending
    const sortedGoals = [...goals].sort((a, b) => {
      if (a.targetMonth === b.targetMonth) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return a.targetMonth.localeCompare(b.targetMonth);
    });

    sortedGoals.forEach(g => {
      const monthStr = g.targetMonth;
      if (!groups[monthStr]) groups[monthStr] = [];
      groups[monthStr].push(g);
    });

    return groups;
  }, [goals]);

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
    <div className="p-6 pt-12 pb-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-charcoal">Bucket List</h1>
        <button 
          onClick={() => { setActiveGoal(null); setIsModalOpen(true); }}
          className="bg-brand-charcoal text-white p-2 px-4 rounded-xl shadow-sm font-bold text-sm"
        >
          + Add Item
        </button>
      </div>

      <div className="space-y-8">
        {Object.keys(groupedGoals).length > 0 ? (
          Object.keys(groupedGoals).map(monthStr => (
            <div key={monthStr}>
              <h3 className="font-bold text-lg text-brand-gold mb-3 border-b-2 border-brand-gold pb-1 inline-block">
                {formatMonth(monthStr)}
              </h3>
              
              <div className="space-y-3 mt-2">
                {groupedGoals[monthStr].map(goal => (
                  <div 
                    key={goal.id} 
                    className={`card p-4 flex items-center justify-between shadow-sm border border-gray-100 transition-all ${
                      goal.isCompleted ? 'opacity-60 bg-gray-50' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => toggleComplete(goal)}
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                          goal.isCompleted ? 'bg-brand-charcoal border-brand-charcoal text-white' : 'border-gray-300 text-transparent'
                        }`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </button>
                      
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: goal.color }}></span>
                        <h4 className={`font-bold text-brand-charcoal ${goal.isCompleted ? 'line-through text-gray-400' : ''}`}>
                          {goal.name}
                        </h4>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(goal)} className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-charcoal rounded-lg">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      </button>
                      <button onClick={() => handleDelete(goal.id)} className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
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
