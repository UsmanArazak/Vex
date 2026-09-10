// src/pages/Onboarding.jsx
import React, { useState } from 'react';
import { saveGoal } from '../utils/storage';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const STEPS = ['welcome', 'income', 'goal'];

const Onboarding = ({ onComplete }) => {
  const { markOnboarded } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [income, setIncome] = useState('');
  const [goalName, setGoalName] = useState('');
  const [goalCost, setGoalCost] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const step = STEPS[stepIndex];
  const next = () => setStepIndex(i => Math.min(i + 1, STEPS.length - 1));
  const back = () => setStepIndex(i => Math.max(i - 1, 0));

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
      if (income) {
        // Stored on the user profile for potential future personalization —
        // not shown anywhere yet, just captured so it's not lost.
        await supabase.auth.updateUser({ data: { monthly_income_estimate: Number(income) } });
      }
      await markOnboarded();
      toast.success('You\'re all set — welcome to Vex!');
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
              <span className="text-2xl font-black text-brand-charcoal">V</span>
            </div>
            <h1 className="text-2xl font-bold text-brand-charcoal dark:text-white mb-2">Welcome to Vex</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Let's set up your money in under a minute — spending, savings, and everything in between.
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
              Just a ballpark — this helps Vex give you more useful insights later. Totally optional.
            </p>
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monthly income (₦)</label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              autoFocus
              className="w-full mt-1 p-3 rounded-xl border border-gray-200 dark:border-brand-darkBorder dark:bg-brand-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold text-lg font-bold"
              placeholder="e.g. 250000"
            />
            <div className="flex gap-3 mt-6">
              <button onClick={back} className="px-5 py-3 rounded-xl font-semibold text-sm bg-gray-100 dark:bg-brand-darkBorder text-brand-charcoal dark:text-white hover:bg-gray-200 transition-colors">Back</button>
              <button onClick={next} className="btn-primary flex-1">Continue</button>
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
