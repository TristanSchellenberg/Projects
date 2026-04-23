"use client";

import { useStore } from "@/hooks/useStore";
import { setState } from "@/lib/store";
import { format, isToday, isTomorrow, parseISO, isAfter, subDays } from "date-fns";
import { Users, TrendingUp, CalendarCheck, DollarSign, Clock, Plus, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const state = useStore();
  const { clients, jobs, opportunities, clockSession } = state;

  const totalClients = clients.length;
  const weekAgo = subDays(new Date(), 7);
  const newThisWeek = clients.filter(c => isAfter(parseISO(c.createdAt), weekAgo)).length;
  const upcomingJobs = jobs.filter(j => j.status === "scheduled").length;
  const outstandingBalance = clients.reduce((s, c) => s + c.balance, 0);

  const nextJobs = jobs
    .filter(j => j.status === "scheduled")
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  function startClock() {
    setState(s => ({ ...s, clockSession: { startedAt: new Date().toISOString(), closedClientIds: [], isActive: true } }));
  }
  function stopClock() {
    setState(s => ({ ...s, clockSession: null }));
  }

  const clockDuration = clockSession
    ? Math.floor((Date.now() - new Date(clockSession.startedAt).getTime()) / 60000)
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
        {clockSession ? (
          <button
            onClick={stopClock}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
          >
            <Clock className="w-4 h-4" />
            On the Clock: {clockDuration}m — Stop
          </button>
        ) : (
          <button
            onClick={startClock}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Clock className="w-4 h-4" />
            Start Clock
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/clients" className="card hover:shadow-md transition-shadow group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalClients}</p>
              <p className="text-xs text-gray-400 mt-1">{clients.filter(c => c.status === "customer").length} customers</p>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-indigo-600 font-medium">
            View all <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        <Link href="/clients" className="card hover:shadow-md transition-shadow group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">New This Week</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{newThisWeek}</p>
              <p className="text-xs text-gray-400 mt-1">new clients</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-green-600 font-medium">
            {newThisWeek > 0 ? "Growing!" : "Go get 'em"} <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        <Link href="/jobs" className="card hover:shadow-md transition-shadow group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Upcoming Jobs</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{upcomingJobs}</p>
              <p className="text-xs text-gray-400 mt-1">scheduled</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <CalendarCheck className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-blue-600 font-medium">
            View schedule <ArrowRight className="w-3 h-3" />
          </div>
        </Link>

        <Link href="/financials" className="card hover:shadow-md transition-shadow group">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Outstanding</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">${outstandingBalance}</p>
              <p className="text-xs text-gray-400 mt-1">unpaid balance</p>
            </div>
            <div className={`p-2 rounded-lg transition-colors ${outstandingBalance > 0 ? "bg-amber-50 group-hover:bg-amber-100" : "bg-gray-50"}`}>
              <DollarSign className={`w-5 h-5 ${outstandingBalance > 0 ? "text-amber-500" : "text-gray-400"}`} />
            </div>
          </div>
          <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${outstandingBalance > 0 ? "text-amber-600" : "text-gray-400"}`}>
            {outstandingBalance > 0 ? "Collect now" : "All collected"} <ArrowRight className="w-3 h-3" />
          </div>
        </Link>
      </div>

      {outstandingBalance > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">${outstandingBalance} outstanding</span> across {clients.filter(c => c.balance > 0).length} clients.{" "}
            <Link href="/clients" className="underline font-medium">Follow up now →</Link>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Jobs */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Upcoming Jobs</h2>
            <Link href="/jobs" className="text-xs text-indigo-600 hover:underline font-medium">View all</Link>
          </div>
          {nextJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <CalendarCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No jobs scheduled</p>
              <Link href="/jobs" className="text-xs text-indigo-600 hover:underline mt-1 block">Add a job</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {nextJobs.map(job => {
                const client = clients.find(c => c.id === job.clientId);
                const jobDate = parseISO(job.date);
                const label = isToday(jobDate) ? "Today" : isTomorrow(jobDate) ? "Tomorrow" : format(jobDate, "MMM d");
                const typeColors: Record<string, string> = {
                  car_wash: "bg-blue-100 text-blue-700",
                  detailing: "bg-purple-100 text-purple-700",
                  powerwash: "bg-cyan-100 text-cyan-700",
                  other: "bg-gray-100 text-gray-700",
                };
                const typeLabels: Record<string, string> = { car_wash: "Wash", detailing: "Detail", powerwash: "Powerwash", other: "Other" };
                return (
                  <div key={job.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="text-center min-w-[52px]">
                      <div className="text-xs font-semibold text-indigo-600">{label}</div>
                      <div className="text-xs text-gray-400">{job.time}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{client?.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500 truncate">{job.title}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeColors[job.serviceType]}`}>
                      {typeLabels[job.serviceType]}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">${job.amount}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pipeline Snapshot */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Pipeline</h2>
            <Link href="/opportunities" className="text-xs text-indigo-600 hover:underline font-medium">View board</Link>
          </div>
          <div className="space-y-3">
            {[
              { key: "interested", label: "Interested", color: "bg-blue-500" },
              { key: "followup1", label: "Follow Up #1", color: "bg-yellow-500" },
              { key: "followup2", label: "Follow Up #2", color: "bg-orange-500" },
              { key: "closed", label: "Closed Won", color: "bg-green-500" },
            ].map(({ key, label, color }) => {
              const count = opportunities.filter(o => o.stage === key).length;
              const pct = opportunities.length ? (count / opportunities.length) * 100 : 0;
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${color} shrink-0`} />
                  <span className="text-sm text-gray-700 flex-1">{label}</span>
                  <span className="text-sm font-semibold text-gray-900 w-4 text-right">{count}</span>
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color} opacity-70 transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <Link
            href="/opportunities"
            className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add prospect
          </Link>
        </div>
      </div>

      {clockSession && (
        <div className="card border-indigo-200 bg-indigo-50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            <h2 className="font-semibold text-indigo-900">On the Clock — {clockDuration} min</h2>
          </div>
          <p className="text-sm text-indigo-700">Started at {format(parseISO(clockSession.startedAt), "h:mm a")}. Every client you close is timestamped to this session.</p>
          <p className="text-xs text-indigo-500 mt-1">{clockSession.closedClientIds.length} clients closed this session</p>
        </div>
      )}
    </div>
  );
}
