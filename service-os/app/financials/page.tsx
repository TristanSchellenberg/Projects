"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { setState, generateId, Expense } from "@/lib/store";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Plus, X, TrendingUp, DollarSign, PiggyBank, AlertTriangle } from "lucide-react";

const EXPENSE_CATEGORIES = ["Equipment", "Supplies", "Marketing", "Transport", "Labor", "Other"];
const EXPENSE_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6"];
const SERVICE_COLORS: Record<string, string> = {
  car_wash: "#3b82f6",
  detailing: "#8b5cf6",
  powerwash: "#06b6d4",
  other: "#9ca3af",
};
const SERVICE_LABELS: Record<string, string> = { car_wash: "Car Wash", detailing: "Detailing", powerwash: "Powerwash", other: "Other" };

function ExpenseModal({ onClose, initial }: { onClose: () => void; initial?: Expense }) {
  const [form, setForm] = useState({
    category: initial?.category || "Supplies",
    description: initial?.description || "",
    amount: initial?.amount?.toString() || "",
    date: initial?.date || new Date().toISOString().slice(0, 10),
  });

  function save() {
    if (!form.description || !form.amount) return;
    const exp: Expense = { id: initial?.id || generateId(), ...form, amount: parseFloat(form.amount) || 0 };
    if (initial) {
      setState(s => ({ ...s, expenses: s.expenses.map(e => e.id === initial.id ? exp : e) }));
    } else {
      setState(s => ({ ...s, expenses: [...s.expenses, exp] }));
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">{initial ? "Edit Expense" : "Log Expense"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Category</label>
            <select
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            >
              {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Description *</label>
            <input
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Foam cannon, soap, towels..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Amount ($) *</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Date</label>
              <input
                type="date"
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={save} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Save</button>
        </div>
      </div>
    </div>
  );
}

export default function FinancialsPage() {
  const state = useStore();
  const { jobs, expenses, timeLogs } = state;
  const [showExpense, setShowExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [savingsPct, setSavingsPct] = useState(20);

  const paidJobs = jobs.filter(j => j.paid);
  const totalRevenue = paidJobs.reduce((s, j) => s + j.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const savingsAmount = Math.round(totalRevenue * (savingsPct / 100));
  const totalOutstanding = jobs.filter(j => !j.paid).reduce((s, j) => s + j.amount, 0);

  // Revenue by service type
  const revenueByType = ["car_wash", "detailing", "powerwash", "other"].map(type => ({
    name: SERVICE_LABELS[type],
    value: paidJobs.filter(j => j.serviceType === type).reduce((s, j) => s + j.amount, 0),
    color: SERVICE_COLORS[type],
  })).filter(x => x.value > 0);

  // Expenses by category
  const expenseByCategory = EXPENSE_CATEGORIES.map((cat, i) => ({
    name: cat,
    value: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
    color: EXPENSE_COLORS[i],
  })).filter(x => x.value > 0);

  // Weekly bar chart
  const weeklyData = timeLogs.map(log => ({
    week: log.week.slice(5),
    Revenue: log.revenue,
    Expenses: log.expenses,
    Profit: log.revenue - log.expenses,
  }));

  // LLM-style projection (rule-based)
  const lastWeek = timeLogs[timeLogs.length - 1];
  const avgRevenue = timeLogs.length ? timeLogs.reduce((s, l) => s + l.revenue, 0) / timeLogs.length : 0;
  const trend = timeLogs.length >= 2 ? timeLogs[timeLogs.length - 1].revenue - timeLogs[timeLogs.length - 2].revenue : 0;
  const projection4w = Math.round((avgRevenue + trend * 0.5) * 4);

  return (
    <div className="p-6 space-y-6">
      {(showExpense || editingExpense) && (
        <ExpenseModal initial={editingExpense} onClose={() => { setShowExpense(false); setEditingExpense(undefined); }} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financials</h1>
          <p className="text-sm text-gray-500 mt-0.5">Revenue · Expenses · Profit</p>
        </div>
        <button
          onClick={() => setShowExpense(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Log Expense
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600 mt-1">${totalRevenue}</p>
          <p className="text-xs text-gray-400 mt-1">{paidJobs.length} paid jobs</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total Expenses</p>
          <p className="text-2xl font-bold text-red-500 mt-1">${totalExpenses}</p>
          <p className="text-xs text-gray-400 mt-1">{expenses.length} items logged</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Net Profit</p>
          <p className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? "text-indigo-600" : "text-red-500"}`}>${netProfit}</p>
          <p className="text-xs text-gray-400 mt-1">{totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0}% margin</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Outstanding</p>
          <p className={`text-2xl font-bold mt-1 ${totalOutstanding > 0 ? "text-amber-500" : "text-gray-400"}`}>${totalOutstanding}</p>
          <p className="text-xs text-gray-400 mt-1">uncollected</p>
        </div>
      </div>

      {/* Negative ROI alert */}
      {netProfit < 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-800">
            <span className="font-semibold">You&apos;re ${Math.abs(netProfit)} in the hole.</span> Your expenses exceed revenue.
            You need at least <span className="font-semibold">${Math.ceil(Math.abs(netProfit) / 80)} more jobs</span> to break even.
            Get out and sell!
          </p>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by type */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Revenue Breakdown</h2>
          {revenueByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={revenueByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${Math.round((percent ?? 0) * 100)}%`} labelLine={false}>
                  {revenueByType.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [`$${v}`, "Revenue"]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-300 text-sm">No paid jobs yet</div>
          )}
        </div>

        {/* Expenses by category */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Expenses Breakdown</h2>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${Math.round((percent ?? 0) * 100)}%`} labelLine={false}>
                  {expenseByCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [`$${v}`, "Spent"]} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-300 text-sm">No expenses logged</div>
          )}
        </div>
      </div>

      {/* Weekly revenue/expense bar chart */}
      {weeklyData.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Weekly Performance</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v) => [`$${v}`]} />
              <Legend />
              <Bar dataKey="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Profit" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* LLM Projection */}
      <div className="card border-indigo-100 bg-gradient-to-br from-indigo-50 to-white">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <h2 className="font-semibold text-gray-900">AI Revenue Projection</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-indigo-100 p-3">
            <p className="text-xs text-gray-500">Avg Weekly Revenue</p>
            <p className="text-xl font-bold text-indigo-600 mt-1">${Math.round(avgRevenue)}</p>
          </div>
          <div className="bg-white rounded-xl border border-indigo-100 p-3">
            <p className="text-xs text-gray-500">Week-over-Week Trend</p>
            <p className={`text-xl font-bold mt-1 ${trend >= 0 ? "text-green-600" : "text-red-500"}`}>
              {trend >= 0 ? "+" : ""}{trend >= 0 ? Math.round(trend) : Math.round(trend)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-indigo-100 p-3">
            <p className="text-xs text-gray-500">4-Week Projection</p>
            <p className="text-xl font-bold text-indigo-700 mt-1">${projection4w}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Based on your last {timeLogs.length} weeks of data. To hit $2,000/mo, aim for ${Math.ceil(2000 / 80)} jobs at $80 avg.
        </p>
      </div>

      {/* Savings Tool */}
      <div className="card border-green-100">
        <div className="flex items-center gap-2 mb-4">
          <PiggyBank className="w-5 h-5 text-green-600" />
          <h2 className="font-semibold text-gray-900">Savings Cut Tool</h2>
          <a href="#" className="ml-auto text-xs text-indigo-600 hover:underline" onClick={e => e.preventDefault()}>Wave Accounting →</a>
        </div>
        <p className="text-xs text-gray-500 mb-3">Set the % you commit to saving from every job. Pressure yourself to stay disciplined.</p>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={5}
            max={50}
            step={5}
            value={savingsPct}
            onChange={e => setSavingsPct(parseInt(e.target.value))}
            className="flex-1 accent-green-600"
          />
          <span className="text-2xl font-bold text-green-600 w-16 text-right">{savingsPct}%</span>
        </div>
        <div className="mt-3 flex items-center justify-between bg-green-50 rounded-xl px-4 py-3">
          <div>
            <p className="text-xs text-gray-500">Save from ${totalRevenue} revenue</p>
            <p className="text-xl font-bold text-green-600">${savingsAmount}</p>
          </div>
          <div className="text-xs text-gray-500 text-right">
            <p>Spendable after savings</p>
            <p className="font-semibold text-gray-700">${totalRevenue - savingsAmount}</p>
          </div>
        </div>
      </div>

      {/* Expense list */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Expense Log</h2>
        <div className="space-y-2">
          {expenses.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No expenses logged yet.</p>
          ) : (
            expenses.map(e => {
              const catIdx = EXPENSE_CATEGORIES.indexOf(e.category);
              return (
                <div key={e.id} className="flex items-center gap-3 py-2 border-b border-gray-50 group">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: EXPENSE_COLORS[catIdx] || "#9ca3af" }} />
                  <span className="text-xs text-gray-500 w-24 shrink-0">{e.category}</span>
                  <span className="text-sm text-gray-700 flex-1">{e.description}</span>
                  <span className="text-xs text-gray-400">{e.date}</span>
                  <span className="text-sm font-semibold text-red-500">-${e.amount}</span>
                  <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                    <button onClick={() => setEditingExpense(e)} className="text-xs text-indigo-600 hover:bg-indigo-50 px-1.5 py-0.5 rounded">Edit</button>
                    <button
                      onClick={() => setState(s => ({ ...s, expenses: s.expenses.filter(x => x.id !== e.id) }))}
                      className="text-xs text-red-500 hover:bg-red-50 px-1.5 py-0.5 rounded"
                    >Del</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
