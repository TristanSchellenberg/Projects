"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { setState, generateId, TimeLog } from "@/lib/store";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell } from "recharts";
import { Plus, X, Clock, Zap, TrendingUp, AlertTriangle } from "lucide-react";

function TimeLogModal({ onClose, initial }: { onClose: () => void; initial?: TimeLog }) {
  const [form, setForm] = useState({
    week: initial?.week || new Date().toISOString().slice(0, 10),
    selling: initial?.selling?.toString() || "0",
    fulfilling: initial?.fulfilling?.toString() || "0",
    admin: initial?.admin?.toString() || "0",
    revenue: initial?.revenue?.toString() || "0",
    expenses: initial?.expenses?.toString() || "0",
  });

  const total = (parseFloat(form.selling) || 0) + (parseFloat(form.fulfilling) || 0) + (parseFloat(form.admin) || 0);

  function save() {
    const log: TimeLog = {
      id: initial?.id || generateId(),
      week: form.week,
      selling: parseFloat(form.selling) || 0,
      fulfilling: parseFloat(form.fulfilling) || 0,
      admin: parseFloat(form.admin) || 0,
      revenue: parseFloat(form.revenue) || 0,
      expenses: parseFloat(form.expenses) || 0,
    };
    if (initial) {
      setState(s => ({ ...s, timeLogs: s.timeLogs.map(l => l.id === initial.id ? log : l) }));
    } else {
      setState(s => ({ ...s, timeLogs: [...s.timeLogs, log] }));
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Log Week</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600">Week of</label>
            <input type="date" className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.week} onChange={e => setForm(f => ({ ...f, week: e.target.value }))} />
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Time Split (hours or %)</p>
          {[
            { key: "selling", label: "Selling / DTD", color: "#6366f1" },
            { key: "fulfilling", label: "Fulfilling Jobs", color: "#22c55e" },
            { key: "admin", label: "Admin / Other", color: "#f59e0b" },
          ].map(({ key, label, color }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-600">{label}</label>
                <span className="text-xs font-semibold" style={{ color }}>{total > 0 ? Math.round((parseFloat((form as any)[key]) / total) * 100) : 0}%</span>
              </div>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min={0}
                value={(form as any)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              />
              <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${total > 0 ? (parseFloat((form as any)[key]) / total) * 100 : 0}%`, backgroundColor: color }} />
              </div>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            <div>
              <label className="text-xs font-medium text-gray-600">Revenue ($)</label>
              <input type="number" className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.revenue} onChange={e => setForm(f => ({ ...f, revenue: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Expenses ($)</label>
              <input type="number" className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.expenses} onChange={e => setForm(f => ({ ...f, expenses: e.target.value }))} />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={save} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Save Week</button>
        </div>
      </div>
    </div>
  );
}

function calcROI(log: TimeLog) {
  const totalHours = log.selling + log.fulfilling + log.admin;
  const netProfit = log.revenue - log.expenses;
  const moneyROI = log.expenses > 0 ? Math.min(100, Math.max(0, Math.round((netProfit / log.expenses) * 50 + 50))) : netProfit > 0 ? 100 : 50;
  const timeROI = totalHours > 0 ? Math.min(100, Math.max(0, Math.round((log.selling / totalHours) * 120 + (netProfit > 0 ? 20 : -20)))) : 0;
  const ultimate = Math.round((moneyROI + timeROI) / 2);
  return { moneyROI, timeROI, ultimate };
}

export default function ProductivityPage() {
  const state = useStore();
  const { timeLogs, clockSession } = state;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TimeLog | undefined>();

  const sorted = [...timeLogs].sort((a, b) => a.week.localeCompare(b.week));
  const latest = sorted[sorted.length - 1];
  const latestROI = latest ? calcROI(latest) : null;

  const chartData = sorted.map(log => {
    const total = log.selling + log.fulfilling + log.admin;
    const roi = calcROI(log);
    return {
      week: log.week.slice(5),
      Selling: total > 0 ? Math.round((log.selling / total) * 100) : 0,
      Fulfilling: total > 0 ? Math.round((log.fulfilling / total) * 100) : 0,
      Admin: total > 0 ? Math.round((log.admin / total) * 100) : 0,
      Revenue: log.revenue,
      ROI: roi.ultimate,
    };
  });

  const radarData = latest ? [
    { subject: "Selling", value: latest.selling + latest.fulfilling + latest.admin > 0 ? Math.round((latest.selling / (latest.selling + latest.fulfilling + latest.admin)) * 100) : 0 },
    { subject: "Fulfilling", value: latest.selling + latest.fulfilling + latest.admin > 0 ? Math.round((latest.fulfilling / (latest.selling + latest.fulfilling + latest.admin)) * 100) : 0 },
    { subject: "Admin", value: latest.selling + latest.fulfilling + latest.admin > 0 ? Math.round((latest.admin / (latest.selling + latest.fulfilling + latest.admin)) * 100) : 0 },
    { subject: "Profit", value: latest.revenue > 0 ? Math.min(100, Math.round(((latest.revenue - latest.expenses) / latest.revenue) * 100)) : 0 },
    { subject: "Efficiency", value: latestROI?.ultimate || 0 },
  ] : [];

  const clockDuration = clockSession
    ? Math.floor((Date.now() - new Date(clockSession.startedAt).getTime()) / 60000)
    : 0;

  return (
    <div className="p-6 space-y-6">
      {(showForm || editing) && (
        <TimeLogModal initial={editing} onClose={() => { setShowForm(false); setEditing(undefined); }} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productivity Tracker</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track time splits · Calculate Ultimate ROI</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Log Week
        </button>
      </div>

      {/* On the Clock live */}
      {clockSession && (
        <div className="card bg-indigo-600 border-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <div>
              <p className="font-semibold">On the Clock — {clockDuration} min active</p>
              <p className="text-xs text-indigo-200">Started at {new Date(clockSession.startedAt).toLocaleTimeString()} · {clockSession.closedClientIds.length} clients closed</p>
            </div>
            <button
              onClick={() => setState(s => ({ ...s, clockSession: null }))}
              className="ml-auto px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium"
            >
              Stop
            </button>
          </div>
        </div>
      )}

      {/* Ultimate ROI */}
      {latestROI && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`card border-2 ${latestROI.moneyROI >= 70 ? "border-green-300 bg-green-50" : latestROI.moneyROI >= 40 ? "border-yellow-300 bg-yellow-50" : "border-red-300 bg-red-50"}`}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-gray-600" />
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Money ROI</p>
            </div>
            <div className="flex items-end gap-2">
              <p className={`text-4xl font-black ${latestROI.moneyROI >= 70 ? "text-green-600" : latestROI.moneyROI >= 40 ? "text-yellow-600" : "text-red-600"}`}>{latestROI.moneyROI}</p>
              <p className="text-lg font-semibold text-gray-400 mb-1">/100</p>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${latestROI.moneyROI >= 70 ? "bg-green-500" : latestROI.moneyROI >= 40 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${latestROI.moneyROI}%` }} />
            </div>
          </div>

          <div className={`card border-2 ${latestROI.timeROI >= 70 ? "border-blue-300 bg-blue-50" : latestROI.timeROI >= 40 ? "border-yellow-300 bg-yellow-50" : "border-red-300 bg-red-50"}`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-600" />
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Time ROI</p>
            </div>
            <div className="flex items-end gap-2">
              <p className={`text-4xl font-black ${latestROI.timeROI >= 70 ? "text-blue-600" : latestROI.timeROI >= 40 ? "text-yellow-600" : "text-red-600"}`}>{latestROI.timeROI}</p>
              <p className="text-lg font-semibold text-gray-400 mb-1">/100</p>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${latestROI.timeROI >= 70 ? "bg-blue-500" : latestROI.timeROI >= 40 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${latestROI.timeROI}%` }} />
            </div>
          </div>

          <div className={`card border-2 ${latestROI.ultimate >= 70 ? "border-indigo-300 bg-indigo-50" : latestROI.ultimate >= 40 ? "border-yellow-300 bg-yellow-50" : "border-red-300 bg-red-50"}`}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-gray-600" />
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Ultimate ROI</p>
            </div>
            <div className="flex items-end gap-2">
              <p className={`text-4xl font-black ${latestROI.ultimate >= 70 ? "text-indigo-600" : latestROI.ultimate >= 40 ? "text-yellow-600" : "text-red-600"}`}>{latestROI.ultimate}</p>
              <p className="text-lg font-semibold text-gray-400 mb-1">/100</p>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${latestROI.ultimate >= 70 ? "bg-indigo-500" : latestROI.ultimate >= 40 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${latestROI.ultimate}%` }} />
            </div>
          </div>
        </div>
      )}

      {latestROI && latestROI.ultimate < 40 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Your ROI is screaming at you — {latestROI.ultimate}/100</p>
            <p className="text-xs text-red-600 mt-0.5">You spent ${latest?.expenses || 0} and only made ${latest?.revenue || 0}. You need to sell more to break even. Get out the door NOW.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar */}
        {radarData.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Performance Radar (Latest Week)</h2>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Time split bar chart */}
        {chartData.length > 0 && (
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Time Split by Week (%)</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                <Tooltip formatter={(v) => [`${v}%`]} />
                <Legend />
                <Bar dataKey="Selling" stackId="a" fill="#6366f1" />
                <Bar dataKey="Fulfilling" stackId="a" fill="#22c55e" />
                <Bar dataKey="Admin" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Week history table */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Weekly Log</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-semibold text-gray-500">Week</th>
                <th className="text-center py-2 text-xs font-semibold text-indigo-600">Selling %</th>
                <th className="text-center py-2 text-xs font-semibold text-green-600">Fulfilling %</th>
                <th className="text-center py-2 text-xs font-semibold text-yellow-600">Admin %</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500">Revenue</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500">Expenses</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500">ROI</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sorted.map(log => {
                const total = log.selling + log.fulfilling + log.admin;
                const roi = calcROI(log);
                return (
                  <tr key={log.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 font-medium text-gray-900">{log.week}</td>
                    <td className="py-2.5 text-center text-indigo-600 font-semibold">{total > 0 ? Math.round((log.selling / total) * 100) : 0}%</td>
                    <td className="py-2.5 text-center text-green-600 font-semibold">{total > 0 ? Math.round((log.fulfilling / total) * 100) : 0}%</td>
                    <td className="py-2.5 text-center text-yellow-600 font-semibold">{total > 0 ? Math.round((log.admin / total) * 100) : 0}%</td>
                    <td className="py-2.5 text-right text-green-700">${log.revenue}</td>
                    <td className="py-2.5 text-right text-red-500">-${log.expenses}</td>
                    <td className="py-2.5 text-right">
                      <span className={`font-bold ${roi.ultimate >= 70 ? "text-indigo-600" : roi.ultimate >= 40 ? "text-yellow-600" : "text-red-600"}`}>{roi.ultimate}</span>
                    </td>
                    <td className="py-2.5">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                        <button onClick={() => setEditing(log)} className="text-xs text-indigo-600 hover:bg-indigo-50 px-1.5 py-0.5 rounded">Edit</button>
                        <button onClick={() => setState(s => ({ ...s, timeLogs: s.timeLogs.filter(l => l.id !== log.id) }))} className="text-xs text-red-500 hover:bg-red-50 px-1.5 py-0.5 rounded">Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {sorted.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400 text-sm">No weeks logged yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DollarSign({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
