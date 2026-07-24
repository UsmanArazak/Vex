// src/utils/storage.js

const STORAGE_KEYS = {
  TRANSACTIONS: 'vex_wallet_transactions',
  CATEGORIES: 'vex_wallet_categories',
  GOALS: 'vex_wallet_goals',
  DEBTS: 'vex_wallet_debts',
};

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Food', color: '#FF6B6B', type: 'expense' },
  { id: 'cat-2', name: 'Transport', color: '#4ECDC4', type: 'expense' },
  { id: 'cat-3', name: 'Rent', color: '#45B7D1', type: 'expense' },
  { id: 'cat-4', name: 'Data/Airtime', color: '#96CEB4', type: 'expense' },
  { id: 'cat-5', name: 'Salary', color: '#FFE066', type: 'income' },
  { id: 'cat-6', name: 'Business Income', color: '#4CAF50', type: 'income' },
  { id: 'cat-7', name: 'Savings', color: '#9C27B0', type: 'expense' }, // Savings is treated as expense from main balance
];

// Helper to get data
const getData = (key, defaultData) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultData;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return defaultData;
  }
};

// Helper to set data
const setData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage`, error);
  }
};

// Initialize categories if empty
export const getCategories = () => {
  const cats = getData(STORAGE_KEYS.CATEGORIES, null);
  if (!cats) {
    setData(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  }
  return cats;
};

export const saveCategories = (categories) => {
  setData(STORAGE_KEYS.CATEGORIES, categories);
};

// Transactions
export const getTransactions = () => getData(STORAGE_KEYS.TRANSACTIONS, []);

export const saveTransaction = (transaction) => {
  const transactions = getTransactions();
  // if editing existing, replace it
  const index = transactions.findIndex(t => t.id === transaction.id);
  if (index >= 0) {
    transactions[index] = transaction;
  } else {
    // new transaction
    transactions.push({ ...transaction, id: crypto.randomUUID() });
  }
  setData(STORAGE_KEYS.TRANSACTIONS, transactions);
  return transactions;
};

export const deleteTransaction = (id) => {
  const transactions = getTransactions().filter(t => t.id !== id);
  setData(STORAGE_KEYS.TRANSACTIONS, transactions);
  return transactions;
};

// Goals
export const getGoals = () => getData(STORAGE_KEYS.GOALS, []);

export const saveGoal = (goal) => {
  const goals = getGoals();
  const index = goals.findIndex(g => g.id === goal.id);
  if (index >= 0) {
    goals[index] = goal;
  } else {
    goals.push({ ...goal, id: crypto.randomUUID() });
  }
  setData(STORAGE_KEYS.GOALS, goals);
  return goals;
};

export const deleteGoal = (id) => {
  const goals = getGoals().filter(g => g.id !== id);
  setData(STORAGE_KEYS.GOALS, goals);
  return goals;
};

// Debts
export const getDebts = () => getData(STORAGE_KEYS.DEBTS, []);

export const saveDebt = (debt) => {
  const debts = getDebts();
  const index = debts.findIndex(d => d.id === debt.id);
  if (index >= 0) {
    debts[index] = debt;
  } else {
    debts.push({ ...debt, id: crypto.randomUUID() });
  }
  setData(STORAGE_KEYS.DEBTS, debts);
  return debts;
};

export const deleteDebt = (id) => {
  const debts = getDebts().filter(d => d.id !== id);
  setData(STORAGE_KEYS.DEBTS, debts);
  return debts;
};

// Update clearAllData to also remove debts
export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  localStorage.removeItem(STORAGE_KEYS.GOALS);
  localStorage.removeItem(STORAGE_KEYS.DEBTS);
};

// Extend exportData and importData
export const exportData = () => {
  return {
    transactions: getTransactions(),
    categories: getCategories(),
    goals: getGoals(),
    debts: getDebts(),
  };
};

export const importData = (data) => {
  if (data.transactions) setData(STORAGE_KEYS.TRANSACTIONS, data.transactions);
  if (data.categories) setData(STORAGE_KEYS.CATEGORIES, data.categories);
  if (data.goals) setData(STORAGE_KEYS.GOALS, data.goals);
  if (data.debts) setData(STORAGE_KEYS.DEBTS, data.debts);
};
