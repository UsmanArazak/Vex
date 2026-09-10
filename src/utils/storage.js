// src/utils/storage.js
// Supabase-backed data layer. Function names match the old localStorage
// version, but everything here is now async and scoped to the signed-in
// user via Row Level Security.

import { supabase } from '../lib/supabase';

const requireUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  return user;
};

// ---------- Categories ----------
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(c => ({ id: c.id, name: c.name, color: c.color, type: c.type }));
};

export const saveCategories = async (categories) => {
  const user = await requireUser();
  // Upsert each category; new ones (no valid uuid) get inserted, existing get updated.
  const rows = categories.map(c => ({
    ...(c.id ? { id: c.id } : {}),
    user_id: user.id,
    name: c.name,
    color: c.color,
    type: c.type,
  }));
  const { data, error } = await supabase.from('categories').upsert(rows).select();
  if (error) throw error;
  return data;
};

export const deleteCategory = async (id) => {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
};

// ---------- Transactions ----------
export const getTransactions = async () => {
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
    note: t.note,
    date: t.date,
  }));
};

export const saveTransaction = async (transaction) => {
  const user = await requireUser();
  const row = {
    ...(transaction.id ? { id: transaction.id } : {}),
    user_id: user.id,
    type: transaction.type,
    amount: transaction.amount,
    category_id: transaction.categoryId,
    note: transaction.note,
    date: transaction.date,
  };
  const { error } = await supabase.from('transactions').upsert(row);
  if (error) throw error;
  return getTransactions();
};

export const deleteTransaction = async (id) => {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
  return getTransactions();
};

// ---------- Goals ----------
export const getGoals = async () => {
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
  return getGoals();
};

export const deleteGoal = async (id) => {
  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) throw error;
  return getGoals();
};

// ---------- Debts ----------
export const getDebts = async () => {
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
  }));
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
  };
  const { error } = await supabase.from('debts').upsert(row);
  if (error) throw error;
  return getDebts();
};

export const deleteDebt = async (id) => {
  const { error } = await supabase.from('debts').delete().eq('id', id);
  if (error) throw error;
  return getDebts();
};

// ---------- Budgets ----------
export const getBudgets = async (month) => {
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
  // Upsert on the (user_id, category_id, month) unique constraint so setting
  // a budget for a category+month that already has one just updates it.
  const { error } = await supabase
    .from('budgets')
    .upsert(row, { onConflict: 'user_id,category_id,month' });
  if (error) throw error;
};

export const deleteBudget = async (id) => {
  const { error } = await supabase.from('budgets').delete().eq('id', id);
  if (error) throw error;
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
};
