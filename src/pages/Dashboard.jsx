import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, YAxis } from 'recharts';
import { getTransactions, getCategories } from '../utils/storage';
import { format, subMonths, isSameMonth, parseISO } from 'date-fns';

const Dashboard = () => {
  // Load actual data, or use mock if empty
  const rawTransactions = getTransactions();
  const categories = getCategories();
  
  const hasData = rawTransactions.length > 0;

  // Mock data for initial empty state visualization
  const mockTransactions = [
    { id: '1', amount: 15000, categoryId: 'cat-1', type: 'expense', date: new Date().toISOString() },
    { id: '2', amount: 50000, categoryId: 'cat-5', type: 'income', date: new Date().toISOString() },
    { id: '3', amount: 12000, categoryId: 'cat-2', type: 'expense', date: new Date().toISOString() },
  ];
  
  const transactions = hasData ? rawTransactions : mockTransactions;

  // Calculations
  const { totalBalance, currentMonthIncome, currentMonthExpense } = useMemo(() => {
    let bal = 0;
    let inc = 0;
    let exp = 0;
    const now = new Date();

    transactions.forEach(t => {
      const amount = Number(t.amount);
      if (t.type === 'income') bal += amount;
      else bal -= amount;

      if (isSameMonth(parseISO(t.date), now)) {
        if (t.type === 'income') inc += amount;
        else exp += amount;
      }
    });
    return { totalBalance: bal, currentMonthIncome: inc, currentMonthExpense: exp };
  }, [transactions]);

  // Pie chart data (Current month expenses by category)
  const pieData = useMemo(() => {
    const now = new Date();
    const expenses = transactions.filter(t => t.type === 'expense' && isSameMonth(parseISO(t.date), now));
    const grouped = expenses.reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + Number(t.amount);
      return acc;
    }, {});
    
    return Object.keys(grouped).map(catId => {
      const cat = categories.find(c => c.id === catId) || { name: 'Other', color: '#ccc' };
      return { name: cat.name, value: grouped[catId], color: cat.color };
    }).sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  // Trend chart data (Last 6 months)
  const trendData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const targetMonth = subMonths(now, i);
      const monthStr = format(targetMonth, 'MMM');
      let inc = 0, exp = 0;
      
      transactions.forEach(t => {
        if (isSameMonth(parseISO(t.date), targetMonth)) {
          if (t.type === 'income') inc += Number(t.amount);
          else exp += Number(t.amount);
        }
      });
      data.push({ name: monthStr, income: inc, expense: exp });
    }
    // If no real data, let's inject a nice looking curve for demonstration
    if (!hasData) {
      return [
        { name: 'Jan', income: 400000, expense: 250000 },
        { name: 'Feb', income: 450000, expense: 300000 },
        { name: 'Mar', income: 420000, expense: 280000 },
        { name: 'Apr', income: 500000, expense: 350000 },
        { name: 'May', income: 480000, expense: 200000 },
        { name: 'Jun', income: 550000, expense: 320000 },
      ];
    }
    return data;
  }, [transactions, hasData]);

  const formatCurrency = (val) => `₦${val.toLocaleString()}`;

  return (
    <div className="p-6 pt-12 space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <p className="text-sm text-gray-500 font-medium mb-1">Total Balance</p>
          <h1 className="text-4xl font-bold text-brand-charcoal">{formatCurrency(totalBalance)}</h1>
        </div>
        <div className="w-12 h-12 rounded-full bg-brand-gold flex items-center justify-center border-4 border-white shadow-sm">
          <span className="font-bold text-brand-charcoal">Me</span>
        </div>
      </header>

      {/* Summary Card based on reference image yellow card */}
      <section className="card bg-brand-gold relative overflow-hidden shadow-[0_10px_30px_-10px_rgba(255,215,0,0.5)] border-0">
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <h2 className="text-brand-charcoal/80 font-medium mb-1 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white/40 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </span>
              This Month
            </h2>
          </div>
          <div className="flex justify-between items-end mt-6">
            <div>
              <p className="text-sm text-brand-charcoal/70 mb-1">Income</p>
              <p className="text-xl font-bold">{formatCurrency(currentMonthIncome)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-brand-charcoal/70 mb-1">Expenses</p>
              <p className="text-xl font-bold">{formatCurrency(currentMonthExpense)}</p>
            </div>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
        <div className="absolute left-1/2 -bottom-10 w-24 h-24 bg-white/30 rounded-full blur-xl"></div>
      </section>

      {/* Spendings by Category (Pie Chart) */}
      <section className="card">
        <h3 className="font-bold text-lg mb-4">Spendings by Category</h3>
        <div className="h-48 w-full relative">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">No expenses this month</div>
          )}
          {pieData.length > 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-gray-400">Total</span>
              <span className="font-bold text-brand-charcoal">{formatCurrency(currentMonthExpense)}</span>
            </div>
          )}
        </div>
        
        {/* Legend */}
        {pieData.length > 0 && (
          <div className="mt-4 space-y-2">
            {pieData.slice(0, 3).map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-gray-600">{entry.name}</span>
                </div>
                <span className="font-bold">{formatCurrency(entry.value)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6-Month Trend */}
      <section className="card">
        <h3 className="font-bold text-lg mb-4">6-Month Trend</h3>
        <div className="h-48 w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFE066" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#FFE066" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis hide domain={['dataMin - 10000', 'dataMax + 10000']} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Area type="monotone" dataKey="income" stroke="#FFE066" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="expense" stroke="#FF6B6B" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

    </div>
  );
};

export default Dashboard;
