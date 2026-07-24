import React, { useState, useMemo } from 'react';
import { getGoals, deleteGoal } from '../utils/storage';
import GoalModal from '../components/GoalModal';
import AddFundsModal from '../components/AddFundsModal';
import { format, parseISO } from 'date-fns';

const Goals = () => {
  const [goals, setGoals] = useState(getGoals());
  
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isFundsModalOpen, setIsFundsModalOpen] = useState(false);
  
  const [activeGoal, setActiveGoal] = useState(null); // Used for editing or adding funds

  const refreshData = () => {
    setGoals(getGoals());
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      deleteGoal(id);
      refreshData();
    }
  };

  const openEdit = (goal) => {
    setActiveGoal(goal);
    setIsGoalModalOpen(true);
  };

  const openAddFunds = (goal) => {
    setActiveGoal(goal);
    setIsFundsModalOpen(true);
  };

  const formatCurrency = (val) => `₦${val.toLocaleString()}`;

  // Summary logic
  const { totalSaved, totalTarget } = useMemo(() => {
    return goals.reduce((acc, g) => ({
      totalSaved: acc.totalSaved + g.currentAmount,
      totalTarget: acc.totalTarget + g.targetAmount
    }), { totalSaved: 0, totalTarget: 0 });
  }, [goals]);

  const overallProgress = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;

  return (
    <div className="p-6 pt-12 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-brand-charcoal">Savings</h1>
        <button 
          onClick={() => { setActiveGoal(null); setIsGoalModalOpen(true); }}
          className="bg-brand-charcoal text-white p-2 px-4 rounded-xl shadow-sm font-bold text-sm"
        >
          + New Goal
        </button>
      </div>

      {/* Overview Ring Chart matching the reference image concept */}
      <section className="card bg-white mb-8 p-6 flex items-center justify-between shadow-soft">
        <div>
          <h2 className="text-gray-500 text-sm font-medium">Total Saved</h2>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalSaved)}</p>
          <p className="text-xs text-gray-400 mt-1">out of {formatCurrency(totalTarget)}</p>
        </div>
        <div className="relative w-20 h-20">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="8" />
            <circle 
              cx="50" cy="50" r="40" 
              fill="transparent" 
              stroke="#FFE066" 
              strokeWidth="8" 
              strokeDasharray="251.2" 
              strokeDashoffset={251.2 - (251.2 * overallProgress) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-bold text-sm">{overallProgress}%</span>
          </div>
        </div>
      </section>

      {/* Goals List */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg mb-2">Your Goals</h3>
        
        {goals.length > 0 ? (
          goals.map(goal => {
            const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            
            return (
              <div key={goal.id} className="card p-5 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: goal.color }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-charcoal text-lg">{goal.name}</h4>
                      {goal.deadline && (
                        <p className="text-xs text-gray-400">Target: {format(parseISO(goal.deadline), 'MMM d, yyyy')}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions (hover/focus) */}
                  <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(goal)} className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:text-brand-charcoal"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></button>
                    <button onClick={() => handleDelete(goal.id)} className="p-1.5 bg-red-50 text-red-400 rounded-lg hover:text-red-600"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                  </div>
                </div>

                <div className="mt-4 relative z-10">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold">{formatCurrency(goal.currentAmount)}</span>
                    <span className="text-gray-400">{formatCurrency(goal.targetAmount)}</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${progress}%`, backgroundColor: goal.color }}
                    ></div>
                  </div>
                </div>

                <button 
                  onClick={() => openAddFunds(goal)}
                  className="w-full mt-4 py-2 bg-gray-50 text-brand-charcoal font-semibold text-sm rounded-xl hover:bg-gray-100 transition-colors relative z-10"
                >
                  Add Funds
                </button>
              </div>
            )
          })
        ) : (
          <div className="text-center p-8 bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 mb-4">No savings goals yet. Time to dream big!</p>
            <button onClick={() => { setActiveGoal(null); setIsGoalModalOpen(true); }} className="text-brand-gold font-bold">Create a Goal</button>
          </div>
        )}
      </div>

      <GoalModal 
        isOpen={isGoalModalOpen} 
        onClose={() => setIsGoalModalOpen(false)} 
        initialData={activeGoal}
        onSaved={refreshData}
      />

      <AddFundsModal
        isOpen={isFundsModalOpen}
        onClose={() => setIsFundsModalOpen(false)}
        goal={activeGoal}
        onSaved={refreshData}
      />
    </div>
  );
};

export default Goals;
