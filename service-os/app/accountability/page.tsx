"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/hooks/useStore";
import { setState, generateId, Goal } from "@/lib/store";
import { Trophy, Plus, X, CheckCircle, Flame, Target, Users, Star } from "lucide-react";

const MOTIVATIONAL = [
  "Every hour you DON'T sell is money left on the table.",
  "Your ROI is watching you. Don't disappoint it.",
  "10 doors = 1 client. How many doors are you knocking?",
  "Consistency beats talent. Show up TODAY.",
  "Your competition is working right now. Are you?",
  "Small numbers compound. One more client = recurring revenue.",
];

function confettiBlast() {
  if (typeof window === "undefined") return;
  const colors = ["#6366f1", "#22c55e", "#f59e0b", "#3b82f6", "#ec4899"];
  for (let i = 0; i < 30; i++) {
    const el = document.createElement("div");
    el.style.cssText = `position:fixed;top:50%;left:${20 + Math.random() * 60}%;width:8px;height:8px;border-radius:50%;background:${colors[Math.floor(Math.random() * colors.length)]};pointer-events:none;z-index:9999;animation:confetti 1s ease-out forwards`;
    el.style.setProperty("--tx", `${(Math.random() - 0.5) * 200}px`);
    el.style.setProperty("--ty", `${-100 - Math.random() * 200}px`);
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }
}

function GoalModal({ onClose, initial }: { onClose: () => void; initial?: Goal }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    target: initial?.target?.toString() || "",
    current: initial?.current?.toString() || "0",
    unit: initial?.unit || "clients",
  });

  function save() {
    if (!form.title || !form.target) return;
    const goal: Goal = {
      id: initial?.id || generateId(),
      title: form.title,
      target: parseFloat(form.target) || 0,
      current: parseFloat(form.current) || 0,
      unit: form.unit,
      completed: (parseFloat(form.current) || 0) >= (parseFloat(form.target) || 1),
    };
    if (initial) {
      setState(s => ({ ...s, goals: s.goals.map(g => g.id === initial.id ? goal : g) }));
    } else {
      setState(s => ({ ...s, goals: [...s.goals, goal] }));
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">{initial ? "Edit Goal" : "New Goal"}</h2>
          <button onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Goal Title</label>
            <input className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Clients this week" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-600">Target</label>
              <input type="number" className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Current</label>
              <input type="number" className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Unit</label>
              <input className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="clients" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} />
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

export default function AccountabilityPage() {
  const state = useStore();
  const { goals, team, jobs } = state;
  const [showGoal, setShowGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();
  const [celebratingId, setCelebratingId] = useState<string | null>(null);
  const [quoteIdx, setQuoteIdx] = useState(Math.floor(Math.random() * MOTIVATIONAL.length));

  useEffect(() => {
    const interval = setInterval(() => setQuoteIdx(i => (i + 1) % MOTIVATIONAL.length), 8000);
    return () => clearInterval(interval);
  }, []);

  function updateGoalProgress(goal: Goal, delta: number) {
    const newCurrent = Math.max(0, Math.min(goal.target, goal.current + delta));
    const wasCompleted = goal.completed;
    const nowCompleted = newCurrent >= goal.target;
    if (!wasCompleted && nowCompleted) {
      setCelebratingId(goal.id);
      confettiBlast();
      setTimeout(() => setCelebratingId(null), 2000);
    }
    setState(s => ({
      ...s,
      goals: s.goals.map(g => g.id === goal.id ? { ...g, current: newCurrent, completed: nowCompleted } : g),
    }));
  }

  // Leaderboard: jobs completed per team member
  const leaderboard = team.map(m => ({
    ...m,
    jobsCompleted: jobs.filter(j => j.assignedTo.includes(m.id) && j.status === "completed").length,
    revenue: jobs.filter(j => j.assignedTo.includes(m.id) && j.paid).reduce((s, j) => s + j.amount / j.assignedTo.length, 0),
  })).sort((a, b) => b.revenue - a.revenue);

  const streakDays = 5;

  return (
    <div className="p-6 space-y-6">
      <style>{`@keyframes confetti { to { transform: translate(var(--tx), var(--ty)) rotate(720deg); opacity: 0; } }`}</style>
      {(showGoal || editingGoal) && <GoalModal initial={editingGoal} onClose={() => { setShowGoal(false); setEditingGoal(undefined); }} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accountability</h1>
          <p className="text-sm text-gray-500 mt-0.5">Goals · Leaderboard · Streak</p>
        </div>
        <button onClick={() => setShowGoal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus className="w-4 h-4" />
          New Goal
        </button>
      </div>

      {/* Motivational quote */}
      <div className="card bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-4 h-4 text-orange-300" />
          <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wide">Daily Fuel</span>
        </div>
        <p className="text-lg font-semibold leading-snug">&ldquo;{MOTIVATIONAL[quoteIdx]}&rdquo;</p>
        <div className="mt-3 flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-300" />
          <span className="text-sm font-semibold">{streakDays}-day streak</span>
          <span className="text-xs text-indigo-300">Keep it going!</span>
        </div>
      </div>

      {/* Goals */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-3">This Week&apos;s Goals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map(goal => {
            const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
            const isCelebrating = celebratingId === goal.id;
            return (
              <div
                key={goal.id}
                className={`card transition-all ${goal.completed ? "bg-green-50 border-green-200" : ""} ${isCelebrating ? "scale-105 shadow-lg" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Target className={`w-4 h-4 ${goal.completed ? "text-green-500" : "text-indigo-500"}`} />
                    <h3 className="text-sm font-semibold text-gray-900">{goal.title}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditingGoal(goal)} className="text-xs text-gray-400 hover:text-indigo-600 p-1">✏️</button>
                    <button onClick={() => setState(s => ({ ...s, goals: s.goals.filter(g => g.id !== goal.id) }))} className="text-xs text-gray-400 hover:text-red-500 p-1">×</button>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-end justify-between mb-1">
                    <span className={`text-3xl font-black ${goal.completed ? "text-green-600" : "text-indigo-600"}`}>{goal.current}</span>
                    <span className="text-sm text-gray-400">/ {goal.target} {goal.unit}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${goal.completed ? "bg-green-500" : pct > 60 ? "bg-indigo-500" : pct > 30 ? "bg-yellow-500" : "bg-red-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">{pct}% complete</span>
                    {goal.completed && (
                      <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                        <CheckCircle className="w-3 h-3" />
                        Crushed it!
                      </div>
                    )}
                  </div>
                </div>

                {!goal.completed && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => updateGoalProgress(goal, -1)}
                      className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-600 transition-colors"
                    >
                      −1
                    </button>
                    <button
                      onClick={() => updateGoalProgress(goal, 1)}
                      className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-bold text-white transition-colors"
                    >
                      +1 ✓
                    </button>
                  </div>
                )}

                {isCelebrating && (
                  <div className="mt-2 text-center animate-bounce">
                    <span className="text-2xl">🎉</span>
                    <p className="text-xs font-bold text-green-600">GOAL REACHED!</p>
                  </div>
                )}
              </div>
            );
          })}
          <button
            onClick={() => setShowGoal(true)}
            className="card flex flex-col items-center justify-center gap-2 border-dashed hover:border-indigo-400 hover:text-indigo-600 transition-colors text-gray-400 min-h-[120px]"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm font-medium">Add Goal</span>
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold text-gray-900">Team Leaderboard</h2>
          <span className="text-xs text-gray-400 ml-auto">by revenue contributed</span>
        </div>
        <div className="space-y-3">
          {leaderboard.map((member, idx) => (
            <div key={member.id} className={`flex items-center gap-4 p-3 rounded-xl ${idx === 0 ? "bg-amber-50 border border-amber-200" : "bg-gray-50"}`}>
              <div className="flex items-center justify-center w-8 h-8 shrink-0">
                {idx === 0 ? <span className="text-2xl">🥇</span> : idx === 1 ? <span className="text-2xl">🥈</span> : idx === 2 ? <span className="text-2xl">🥉</span> : <span className="text-sm font-bold text-gray-400">#{idx + 1}</span>}
              </div>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: member.color }}>
                {member.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{member.name}</span>
                  {member.role === "owner" && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-semibold">Owner</span>}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{member.jobsCompleted} jobs completed</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900">${Math.round(member.revenue)}</div>
                <div className="text-xs text-gray-400">contributed</div>
              </div>
              {idx === 0 && <Star className="w-4 h-4 text-amber-400 shrink-0" />}
            </div>
          ))}
          {leaderboard.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">Complete jobs to build the leaderboard.</p>
          )}
        </div>
      </div>

      {/* Accountability tips */}
      <div className="card bg-gray-900 text-white border-none">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-indigo-400" />
          <h2 className="font-semibold">Founder Accountability System</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Set a minimum", desc: "Commit to a minimum number of doors per day. Non-negotiable." },
            { title: "Track every hour", desc: "Log your time split weekly. The data doesn't lie — your ROI shows the truth." },
            { title: "Public commitment", desc: "Tell a friend or partner your goal. Social pressure is your unfair advantage." },
          ].map(({ title, desc }) => (
            <div key={title} className="bg-white/5 rounded-xl p-3">
              <p className="text-sm font-semibold text-indigo-300">{title}</p>
              <p className="text-xs text-gray-400 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
