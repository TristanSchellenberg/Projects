"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { setState, generateId, Job, JobStatus } from "@/lib/store";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import { Plus, X, CheckCircle, DollarSign, AlertCircle, User } from "lucide-react";

const SERVICE_TYPE_LABELS: Record<string, string> = { car_wash: "Car Wash", detailing: "Detailing", powerwash: "Powerwash", other: "Other" };
const SERVICE_TYPE_COLORS: Record<string, string> = {
  car_wash: "bg-blue-100 text-blue-700",
  detailing: "bg-purple-100 text-purple-700",
  powerwash: "bg-cyan-100 text-cyan-700",
  other: "bg-gray-100 text-gray-700",
};
const STATUS_COLORS: Record<JobStatus, string> = {
  scheduled: "bg-indigo-100 text-indigo-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  unpaid: "bg-red-100 text-red-700",
};

function JobModal({ onClose, initial }: { onClose: () => void; initial?: Job }) {
  const state = useStore();
  const { clients, team } = state;
  const [form, setForm] = useState({
    clientId: initial?.clientId || "",
    title: initial?.title || "",
    serviceType: initial?.serviceType || "car_wash",
    date: initial?.date || new Date().toISOString().slice(0, 10),
    time: initial?.time || "09:00",
    assignedTo: initial?.assignedTo || [] as string[],
    amount: initial?.amount?.toString() || "",
    notes: initial?.notes || "",
    paid: initial?.paid || false,
    status: initial?.status || "scheduled" as JobStatus,
  });

  function toggleMember(id: string) {
    setForm(f => ({
      ...f,
      assignedTo: f.assignedTo.includes(id) ? f.assignedTo.filter(x => x !== id) : [...f.assignedTo, id],
    }));
  }

  function save() {
    if (!form.clientId || !form.title) return;
    const now = new Date().toISOString();
    if (initial) {
      setState(s => ({
        ...s,
        jobs: s.jobs.map(j => j.id === initial.id ? { ...j, ...form, amount: parseFloat(form.amount) || 0 } : j),
      }));
    } else {
      setState(s => ({
        ...s,
        jobs: [...s.jobs, { id: generateId(), ...form, serviceType: form.serviceType as Job["serviceType"], amount: parseFloat(form.amount) || 0, clockedInAt: undefined }],
      }));
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
          <h2 className="font-semibold text-gray-900">{initial ? "Edit Job" : "New Job"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600">Client *</label>
            <select
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.clientId}
              onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
            >
              <option value="">— Select client —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Job Title *</label>
            <input
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Full Interior + Exterior Detail"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Service Type</label>
              <select
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.serviceType}
                onChange={e => setForm(f => ({ ...f, serviceType: e.target.value as Job["serviceType"] }))}
              >
                {Object.entries(SERVICE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Amount ($)</label>
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
            <div>
              <label className="text-xs font-medium text-gray-600">Time</label>
              <input
                type="time"
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Status</label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {(["scheduled", "in_progress", "completed", "unpaid"] as JobStatus[]).map(s => (
                <button
                  key={s}
                  onClick={() => setForm(f => ({ ...f, status: s }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                    form.status === s ? STATUS_COLORS[s] : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Assign Team Members</label>
            <div className="flex gap-2 mt-1 flex-wrap">
              {team.map(m => (
                <button
                  key={m.id}
                  onClick={() => toggleMember(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    form.assignedTo.includes(m.id)
                      ? "text-white border-transparent"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                  style={form.assignedTo.includes(m.id) ? { backgroundColor: m.color } : {}}
                >
                  <User className="w-3 h-3" />
                  {m.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Notes</label>
            <textarea
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={2}
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="paid" checked={form.paid} onChange={e => setForm(f => ({ ...f, paid: e.target.checked }))} className="w-4 h-4 accent-indigo-600" />
            <label htmlFor="paid" className="text-sm text-gray-700 font-medium">Paid</label>
          </div>
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={save} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
            {initial ? "Save" : "Create Job"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const state = useStore();
  const { jobs, clients, team } = state;
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Job | undefined>();
  const [filter, setFilter] = useState<"all" | JobStatus>("all");

  const totalUnpaid = jobs.filter(j => !j.paid).reduce((s, j) => s + j.amount, 0);
  const unpaidJobs = jobs.filter(j => !j.paid && j.status !== "scheduled");

  const filtered = jobs
    .filter(j => filter === "all" || j.status === filter)
    .sort((a, b) => a.date.localeCompare(b.date));

  function togglePaid(id: string) {
    setState(s => ({
      ...s,
      jobs: s.jobs.map(j => j.id === id ? { ...j, paid: !j.paid, status: !j.paid ? "completed" : j.status } : j),
      clients: s.clients.map(c => {
        const job = s.jobs.find(j => j.id === id);
        if (!job || job.clientId !== c.id) return c;
        return { ...c, balance: !job.paid ? Math.max(0, c.balance - job.amount) : c.balance + job.amount };
      }),
    }));
  }

  function deleteJob(id: string) {
    setState(s => ({ ...s, jobs: s.jobs.filter(j => j.id !== id) }));
  }

  return (
    <div className="p-6 space-y-5">
      {(showForm || editing) && (
        <JobModal initial={editing} onClose={() => { setShowForm(false); setEditing(undefined); }} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-sm text-gray-500 mt-0.5">{jobs.length} total · {jobs.filter(j => j.status === "scheduled").length} upcoming</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          New Job
        </button>
      </div>

      {/* Outstanding balance banner */}
      {unpaidJobs.length > 0 && (
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">Outstanding: ${unpaidJobs.reduce((s, j) => s + j.amount, 0)} unpaid</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {unpaidJobs.map(j => {
                  const client = clients.find(c => c.id === j.clientId);
                  return (
                    <span key={j.id} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      {client?.name} — ${j.amount}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1 w-fit">
        {(["all", "scheduled", "in_progress", "completed", "unpaid"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === f ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {f === "all" ? "All" : f.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Job cards */}
      <div className="space-y-3">
        {filtered.map(job => {
          const client = clients.find(c => c.id === job.clientId);
          const assignedMembers = team.filter(m => job.assignedTo.includes(m.id));
          const jobDate = parseISO(job.date);
          const dateLabel = isToday(jobDate) ? "Today" : isTomorrow(jobDate) ? "Tomorrow" : format(jobDate, "MMM d, yyyy");
          return (
            <div key={job.id} className="card hover:shadow-md transition-shadow group">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-gray-900">{job.title}</h3>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${SERVICE_TYPE_COLORS[job.serviceType]}`}>
                      {SERVICE_TYPE_LABELS[job.serviceType]}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[job.status]}`}>
                      {job.status.replace("_", " ")}
                    </span>
                    {!job.paid && job.status !== "scheduled" && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">UNPAID</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 flex-wrap">
                    <span className="text-xs text-gray-600 font-medium">{client?.name || "Unknown"}</span>
                    <span className="text-xs text-gray-400">{dateLabel} · {job.time}</span>
                    {client?.address && <span className="text-xs text-gray-400">{client.address}</span>}
                  </div>
                  {job.notes && <p className="text-xs text-gray-400 mt-1 italic">{job.notes}</p>}
                  {assignedMembers.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      {assignedMembers.map(m => (
                        <span
                          key={m.id}
                          className="text-[10px] text-white px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: m.color }}
                        >
                          {m.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className={`text-lg font-bold ${job.paid ? "text-green-600" : "text-gray-900"}`}>${job.amount}</div>
                  <button
                    onClick={() => togglePaid(job.id)}
                    className={`mt-1 flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${
                      job.paid ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {job.paid ? <CheckCircle className="w-3 h-3" /> : <DollarSign className="w-3 h-3" />}
                    {job.paid ? "Paid" : "Mark Paid"}
                  </button>
                </div>
              </div>
              <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditing(job)} className="text-xs text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded">Edit</button>
                <button onClick={() => deleteJob(job.id)} className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded">Delete</button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No jobs found.</p>
            <button onClick={() => setShowForm(true)} className="text-xs text-indigo-600 hover:underline mt-1">Create one</button>
          </div>
        )}
      </div>
    </div>
  );
}
