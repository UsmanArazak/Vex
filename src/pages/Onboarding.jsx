// src/pages/Onboarding.jsx
import React, { useState, useEffect } from 'react';
import { saveGoal, saveTransaction, getCategories } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const STEPS = ['welcome', 'income', 'expense', 'goal'];

const INCOME_RANGES = [
  { label: 'Under ₦100k', value: 50000 },
  { label: '₦100k – 300k', value: 200000 },
  { label: '₦300k – 600k', value: 450000 },
  { label: '₦600k+', value: 700000 },
  { label: "Rather not say", value: null },
];

const Onboarding = ({ onComplete }) => {
  const { markOnboarded, updateIncomeEstimate } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [incomeChoice, setIncomeChoice] = useState(null); // one of INCOME_RANGES

  const [categories, setCategories] = useState([]);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategoryId, setExpenseCategoryId] = useState('');

  const [goalName, setGoalName] = useState('');
  const [goalCost, setGoalCost] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    getCategories().then(cats => {
      setCategories(cats);
      const firstExpense = cats.find(c => c.type === 'expense');
      if (firstExpense) setExpenseCategoryId(firstExpense.id);
    });
  }, []);

  const step = STEPS[stepIndex];
  const next = () => setStepIndex(i => Math.min(i + 1, STEPS.length - 1));
  const back = () => setStepIndex(i => Math.max(i - 1, 0));

  const handleLogExpense = async () => {
    if (!expenseAmount || !expenseCategoryId) return;
    try {
      await saveTransaction({
        type: 'expense',
        amount: Number(expenseAmount),
        categoryId: expenseCategoryId,
        note: '',
        date: new Date().toISOString(),
      });
      toast.success('Logged!');
      next();
    } catch (err) {
      toast.error(err.message || 'Failed to log — you can add it later');
    }
  };

  const finish = async () => {
    setSaving(true);
    try {
      if (goalName.trim()) {
        await saveGoal({
          name: goalName.trim(),
          cost: goalCost ? Number(goalCost) : null,
          targetMonth: null,
          color: '#FFE066',
          isCompleted: false,
        });
      }
      if (incomeChoice && incomeChoice.value) {
        await updateIncomeEstimate(incomeChoice.value);
      }
      await markOnboarded();
      toast.success("You're all set!");
      onComplete();
    } catch (err) {
      toast.error(err.message || 'Something went wrong, but you can adjust this later in Settings');
      await markOnboarded().catch(() => {});
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  const skip = async () => {
    await markOnboarded().catch(() => {});
    onComplete();
  };

  const expenseCategories = categories.filter(c => c.type === 'expense').slice(0, 6);

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gray dark:bg-brand-dark p-6">
      <div className="w-full max-w-sm bg-white dark:bg-brand-darkCard rounded-3xl shadow-soft p-8">
        {/* Progress dots */}
        <div className="flex gap-1.5 mb-6">
          {STEPS.map((s, i) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= stepIndex ? 'bg-brand-gold' : 'bg-gray-100 dark:bg-brand-darkBorder'}`} />
          ))}
        </div>

        {step === 'welcome' && (
          <div className="animate-scale-in">
            <div className="w-14 h-14 rounded-2xl bg-brand-gold flex items-center justify-center mb-5">
              <span className="text-2xl font-black text-brand-charcoal">M</span>
            </div>
            <h1 className="text-2xl font-bold text-brand-charcoal dark:text-white mb-2">Let's personalize it</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              A few quick things and you're set up — takes under a minute.
            </p>
            <button onClick={next} className="btn-primary w-full">Let's go</button>
            <button onClick={skip} className="w-full text-center text-sm text-gray-400 dark:text-gray-500 mt-4 hover:text-brand-charcoal dark:hover:text-white transition-colors">
              Skip setup
            </button>
          </div>
        )}

        {step === 'income' && (
          <div className="animate-scale-in">
            <h1 className="text-xl font-bold text-brand-charcoal dark:text-white mb-2">Roughly, what do you earn monthly?</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Just a ballpark — helps Mopal show you how much of your income you're spending. Totally optional.
            </p>
            <div className="space-y-2">
              {INCOME_RANGES.map((range) => (
                <button
                  key={range.label}
                  onClick={() => setIncomeChoice(range)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                    incomeChoice?.label === range.label
                      ? 'border-brand-gold bg-brand-gold/10 text-brand-charcoal dark:text-white'
                      : 'border-gray-100 dark:border-brand-darkBorder text-gray-500 dark:text-gray-400 hover:border-gray-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={back} className="px-5 py-3 rounded-xl font-semibold text-sm bg-gray-100 dark:bg-brand-darkBorder text-brand-charcoal dark:text-white hover:bg-gray-200 transition-colors">Back</button>
              <button onClick={next} disabled={!incomeChoice} className="btn-primary flex-1 disabled:opacity-50">Continue</button>
            </div>
          </div>
        )}

        {step === 'expense' && (
          <div className="animate-scale-in">
            <h1 className="text-xl font-bold text-brand-charcoal dark:text-white mb-2">Spent anything today?</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Log it now so your dashboard isn't empty the moment you walk in.
            </p>

            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount (₦)</label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              autoFocus
              className="w-full mt-1 mb-4 p-3 rounded-xl border border-gray-200 dark:border-brand-darkBorder dark:bg-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold text-lg font-bold"
              placeholder="0"
            />

            {expenseCategories.length > 0 && (
              <>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {expenseCategories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setExpenseCategoryId(cat.id)}
                      className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                        expenseCategoryId === cat.id ? 'shadow-md scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: expenseCategoryId === cat.id ? `${cat.color}30` : `${cat.color}15`, color: cat.color }}
                    >
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: cat.color }}>
                        {cat.name.charAt(0)}
                      </span>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={back} className="px-5 py-3 rounded-xl font-semibold text-sm bg-gray-100 dark:bg-brand-darkBorder text-brand-charcoal dark:text-white hover:bg-gray-200 transition-colors">Back</button>
              {expenseAmount ? (
                <button onClick={handleLogExpense} className="btn-primary flex-1">Log it</button>
              ) : (
                <button onClick={next} className="btn-primary flex-1">Not yet today</button>
              )}
            </div>
          </div>
        )}

        {step === 'goal' && (
          <div className="animate-scale-in">
            <h1 className="text-xl font-bold text-brand-charcoal dark:text-white mb-2">Add your first goal</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Something you're saving toward — a laptop, rent, travel. You can always add more later.
            </p>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Goal name</label>
            <input
              type="text"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              autoFocus
              className="w-full mt-1 mb-4 p-3 rounded-xl border border-gray-200 dark:border-brand-darkBorder dark:bg-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
              placeholder="e.g. New laptop"
            />
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target cost (₦, optional)</label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={goalCost}
              onChange={(e) => setGoalCost(e.target.value)}
              className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-brand-darkBorder dark:bg-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold"
              placeholder="e.g. 500000"
            />
            <div className="flex gap-3 mt-6">
              <button onClick={back} className="px-5 py-3 rounded-xl font-semibold text-sm bg-gray-100 dark:bg-brand-darkBorder text-brand-charcoal dark:text-white hover:bg-gray-200 transition-colors">Back</button>
              <button onClick={finish} disabled={saving} className="btn-primary flex-1 disabled:opacity-50">
                {saving ? 'Setting up…' : goalName.trim() ? 'Finish' : 'Skip & Finish'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
