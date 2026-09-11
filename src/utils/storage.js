// src/utils/storage.js
// Supabase-backed data layer. Function names match the old localStorage
// version, but everything here is now async and scoped to the signed-in
// user via Row Level Security.
//
// PERFORMANCE: reads go through a small in-memory, stale-while-revalidate
// cache. First load of a resource in a session hits the network; every
// subsequent call within the session returns instantly from cache while
// quietly refreshing in the background, so switching tabs feels as fast as
// the old localStorage version instead of re-querying Supabase every time.
// Writes invalidate + refresh the relevant cache entries directly.

import { supabase } from '../lib/supabase';

const requireUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  return user;
};

// ---------- Cache ----------
const cache = new Map();
const inFlight = new Map();

const cachedQuery = (key, fetcher) => {
  if (cache.has(key)) {
    // Stale-while-revalidate: return cached data immediately, refresh quietly.
    fetcher().then((fresh) => cache.set(key, fresh)).catch(() => {});
    return Promise.resolve(cache.get(key));
  }
  if (inFlight.has(key)) return inFlight.get(key);
  const p = fetcher()
    .then((data) => { cache.set(key, data); inFlight.delete(key); return data; })
    .catch((err) => { inFlight.delete(key); throw err; });
  inFlight.set(key, p);
  return p;
};

const invalidate = (prefix) => {
  for (const k of cache.keys()) {
    if (k === prefix || k.startsWith(prefix + ':')) cache.delete(k);
  }
};

export const clearStorageCache = () => {
  cache.clear();
  inFlight.clear();
};

// ---------- Categories ----------
export const getCategories = async () => {
  return cachedQuery('categories', async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map(c => ({ id: c.id, name: c.name, color: c.color, type: c.type }));
  });
};

export const saveCategories = async (categories) => {
  const user = await requireUser();
  const rows = categories.map(c => ({
    ...(c.id ? { id: c.id } : {}),
    user_id: user.id,
    name: c.name,
    color: c.color,
    type: c.type,
  }));
  const { data, error } = await supabase.from('categories').upsert(rows).select();
  if (error) throw error;
  invalidate('categories');
  return data;
};

export const deleteCategory = async (id) => {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
  invalidate('categories');
};

// ---------- Transactions ----------
export const getTransactions = async () => {
  return cachedQuery('transactions', async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return (data || []).map(t => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      categoryId: t.category_id,
      goalId: t.goal_id,
      note: t.note,
      date: t.date,
    }));
  });
};

export const saveTransaction = async (transaction) => {
  const user = await requireUser();
  const row = {
    ...(transaction.id ? { id: transaction.id } : {}),
    user_id: user.id,
    type: transaction.type,
    amount: transaction.amount,
    category_id: transaction.categoryId,
    goal_id: transaction.goalId || null,
    note: transaction.note,
    date: transaction.date,
  };
  const { error } = await supabase.from('transactions').upsert(row);
  if (error) throw error;
  invalidate('transactions');
};

export const deleteTransaction = async (id) => {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
  invalidate('transactions');
};

// ---------- Goals ----------
export const getGoals = async () => {
  return cachedQuery('goals', async () => {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(g => ({
      id: g.id,
      name: g.name,
      cost: g.cost,
      targetMonth: g.target_month,
      color: g.color,
      isCompleted: g.is_completed,
      createdAt: g.created_at,
    }));
  });
};

export const saveGoal = async (goal) => {
  const user = await requireUser();
  const row = {
    ...(goal.id ? { id: goal.id } : {}),
    user_id: user.id,
    name: goal.name,
    cost: goal.cost || null,
    target_month: goal.targetMonth || null,
    color: goal.color,
    is_completed: goal.isCompleted ?? false,
  };
  const { error } = await supabase.from('goals').upsert(row);
  if (error) throw error;
  invalidate('goals');
};

export const deleteGoal = async (id) => {
  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) throw error;
  invalidate('goals');
};

// ---------- Debts ----------
export const getDebts = async () => {
  return cachedQuery('debts', async () => {
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return (data || []).map(d => ({
      id: d.id,
      name: d.name,
      amount: d.amount,
      date: d.date,
      type: d.type,
      dueDate: d.due_date,
    }));
  });
};

export const saveDebt = async (debt) => {
  const user = await requireUser();
  const row = {
    ...(debt.id ? { id: debt.id } : {}),
    user_id: user.id,
    name: debt.name,
    amount: debt.amount,
    date: debt.date,
    type: debt.type,
    due_date: debt.dueDate || null,
  };
  const { error } = await supabase.from('debts').upsert(row);
  if (error) throw error;
  invalidate('debts');
};

export const deleteDebt = async (id) => {
  const { error } = await supabase.from('debts').delete().eq('id', id);
  if (error) throw error;
  invalidate('debts');
};

// ---------- Budgets ----------
export const getBudgets = async (month) => {
  const key = `budgets:${month || 'all'}`;
  return cachedQuery(key, async () => {
    let query = supabase.from('budgets').select('*');
    if (month) query = query.eq('month', month);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(b => ({
      id: b.id,
      categoryId: b.category_id,
      month: b.month,
      limitAmount: b.limit_amount,
    }));
  });
};

export const saveBudget = async (budget) => {
  const user = await requireUser();
  const row = {
    ...(budget.id ? { id: budget.id } : {}),
    user_id: user.id,
    category_id: budget.categoryId,
    month: budget.month,
    limit_amount: budget.limitAmount,
  };
  const { error } = await supabase
    .from('budgets')
    .upsert(row, { onConflict: 'user_id,category_id,month' });
  if (error) throw error;
  invalidate('budgets');
};

export const deleteBudget = async (id) => {
  const { error } = await supabase.from('budgets').delete().eq('id', id);
  if (error) throw error;
  invalidate('budgets');
};

// ---------- Recurring Transactions ----------
export const getRecurringRules = async () => {
  return cachedQuery('recurring_rules', async () => {
    const { data, error } = await supabase
      .from('recurring_rules')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(r => ({
      id: r.id,
      categoryId: r.category_id,
      type: r.type,
      amount: r.amount,
      note: r.note,
      frequency: r.frequency,
      nextRunDate: r.next_run_date,
      isActive: r.is_active,
    }));
  });
};

export const saveRecurringRule = async (rule) => {
  const user = await requireUser();
  const row = {
    ...(rule.id ? { id: rule.id } : {}),
    user_id: user.id,
    category_id: rule.categoryId,
    type: rule.type,
    amount: rule.amount,
    note: rule.note,
    frequency: rule.frequency,
    next_run_date: rule.nextRunDate,
    is_active: rule.isActive ?? true,
  };
  const { error } = await supabase.from('recurring_rules').upsert(row);
  if (error) throw error;
  invalidate('recurring_rules');
};

export const deleteRecurringRule = async (id) => {
  const { error } = await supabase.from('recurring_rules').delete().eq('id', id);
  if (error) throw error;
  invalidate('recurring_rules');
};

const advanceDate = (dateStr, frequency) => {
  const d = new Date(dateStr + 'T00:00:00');
  if (frequency === 'daily') d.setDate(d.getDate() + 1);
  else if (frequency === 'weekly') d.setDate(d.getDate() + 7);
  else if (frequency === 'monthly') d.setMonth(d.getMonth() + 1);
  return d.toISOString().split('T')[0];
};

// Checks all active recurring rules and generates any transactions that are
// due (next_run_date <= today), advancing each rule forward. Safe to call on
// every app load — a rule with next_run_date in the future is a no-op.
// Caps at 24 catch-up runs per rule so a long-unopened app doesn't spiral.
// Bypasses the cache directly (network-fresh) since this runs once at
// startup before anything else has had a chance to populate it.
export const runDueRecurringRules = async () => {
  const { data, error } = await supabase.from('recurring_rules').select('*');
  if (error) throw error;
  const rules = (data || []).map(r => ({
    id: r.id, categoryId: r.category_id, type: r.type, amount: r.amount,
    note: r.note, frequency: r.frequency, nextRunDate: r.next_run_date, isActive: r.is_active,
  }));
  const todayStr = new Date().toISOString().split('T')[0];
  const dueRules = rules.filter(r => r.isActive && r.nextRunDate <= todayStr);
  if (dueRules.length === 0) return { generated: 0 };

  let generated = 0;
  for (const rule of dueRules) {
    let runDate = rule.nextRunDate;
    let guard = 0;
    while (runDate <= todayStr && guard < 24) {
      await saveTransaction({
        type: rule.type,
        amount: rule.amount,
        categoryId: rule.categoryId,
        note: rule.note ? `${rule.note} (auto)` : 'Recurring transaction',
        date: new Date(runDate + 'T09:00:00').toISOString(),
      });
      generated++;
      runDate = advanceDate(runDate, rule.frequency);
      guard++;
    }
    await saveRecurringRule({ ...rule, nextRunDate: runDate });
  }
  return { generated };
};

// ---------- Bulk operations ----------
export const clearAllData = async () => {
  const user = await requireUser();
  await Promise.all([
    supabase.from('transactions').delete().eq('user_id', user.id),
    supabase.from('goals').delete().eq('user_id', user.id),
    supabase.from('debts').delete().eq('user_id', user.id),
    supabase.from('budgets').delete().eq('user_id', user.id),
  ]);
  clearStorageCache();
};

export const exportData = async () => {
  const [transactions, categories, goals, debts, budgets] = await Promise.all([
    getTransactions(),
    getCategories(),
    getGoals(),
    getDebts(),
    getBudgets(),
  ]);
  return { transactions, categories, goals, debts, budgets };
};

export const importData = async (data) => {
  if (data.categories) await saveCategories(data.categories);
  if (data.transactions) await Promise.all(data.transactions.map(t => saveTransaction(t)));
  if (data.goals) await Promise.all(data.goals.map(g => saveGoal(g)));
  if (data.debts) await Promise.all(data.debts.map(d => saveDebt(d)));
  if (data.budgets) await Promise.all(data.budgets.map(b => saveBudget(b)));
  clearStorageCache();
};
