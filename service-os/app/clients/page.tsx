"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { setState, generateId, Client, LeadStatus } from "@/lib/store";
import { format, parseISO } from "date-fns";
import { Plus, Search, Phone, Mail, MapPin, StickyNote, X, ChevronDown, ChevronUp, DollarSign, Clock } from "lucide-react";

const SERVICE_TYPES = ["car_wash", "detailing", "powerwash", "other"] as const;

function ClientForm({ onClose, initial }: { onClose: () => void; initial?: Client }) {
  const [form, setForm] = useState({
    name: initial?.name || "",
    phone: initial?.phone || "",
    email: initial?.email || "",
    address: initial?.address || "",
    notes: initial?.notes || "",
    status: (initial?.status || "lead") as LeadStatus,
    serviceDate: initial?.serviceDate || "",
    balance: initial?.balance?.toString() || "0",
  });

  function save() {
    if (!form.name.trim()) return;
    const now = new Date().toISOString();
    if (initial) {
      setState(s => ({
        ...s,
        clients: s.clients.map(c => c.id === initial.id ? { ...c, ...form, balance: parseFloat(form.balance) || 0, updatedAt: now } : c),
      }));
    } else {
      const newClient: Client = {
        id: generateId(),
        ...form,
        balance: parseFloat(form.balance) || 0,
        createdAt: now,
        updatedAt: now,
      };
      setState(s => ({
        ...s,
        clients: [newClient, ...s.clients],
        clockSession: s.clockSession ? {
          ...s.clockSession,
          closedClientIds: form.status === "customer"
            ? [...s.clockSession.closedClientIds, newClient.id]
            : s.clockSession.closedClientIds,
        } : null,
      }));
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">{initial ? "Edit Client" : "Add Client"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600">Full Name *</label>
              <input
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="John Smith"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Phone</label>
              <input
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="555-0100"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Email</label>
              <input
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="john@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600">Address</label>
              <input
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="123 Oak St, City, State"
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Next Service Date</label>
              <input
                type="date"
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.serviceDate}
                onChange={e => setForm(f => ({ ...f, serviceDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Outstanding Balance ($)</label>
              <input
                type="number"
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="0"
                value={form.balance}
                onChange={e => setForm(f => ({ ...f, balance: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600">Notes</label>
              <textarea
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={3}
                placeholder="Has a Tesla, prefers mornings, has dog..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600">Status</label>
              <div className="flex gap-2 mt-1">
                {(["lead", "customer"] as LeadStatus[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setForm(f => ({ ...f, status: s }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                      form.status === s
                        ? s === "customer" ? "bg-green-600 text-white" : "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {s === "lead" ? "Lead" : "Customer"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={save} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
            {initial ? "Save Changes" : "Add Client"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const state = useStore();
  const { clients, jobs } = state;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "lead" | "customer">("all");
  const [sortField, setSortField] = useState<"name" | "updatedAt">("updatedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Client | undefined>();

  const filtered = clients
    .filter(c => {
      const q = search.toLowerCase();
      const matchQ = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q) || c.address.toLowerCase().includes(q);
      const matchF = filter === "all" || c.status === filter;
      return matchQ && matchF;
    })
    .sort((a, b) => {
      let av = a[sortField] as string, bv = b[sortField] as string;
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  function toggleSort(field: typeof sortField) {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  }

  function toggleStatus(id: string) {
    setState(s => ({
      ...s,
      clients: s.clients.map(c =>
        c.id === id ? { ...c, status: c.status === "lead" ? "customer" : "lead", updatedAt: new Date().toISOString() } : c
      ),
    }));
  }

  function deleteClient(id: string) {
    setState(s => ({ ...s, clients: s.clients.filter(c => c.id !== id) }));
  }

  const totalOutstanding = clients.reduce((s, c) => s + c.balance, 0);

  return (
    <div className="p-6 space-y-5">
      {(showForm || editing) && (
        <ClientForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(undefined); }}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">{clients.length} total · {clients.filter(c => c.status === "customer").length} customers · {clients.filter(c => c.status === "lead").length} leads</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {totalOutstanding > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <DollarSign className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-800 font-medium">${totalOutstanding} outstanding across {clients.filter(c => c.balance > 0).length} clients</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-48 bg-white border border-gray-200 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            className="flex-1 text-sm outline-none placeholder-gray-400"
            placeholder="Search clients..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
          {(["all", "customer", "lead"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors capitalize ${
                filter === f ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {f === "all" ? "All" : f === "customer" ? "Customers" : "Leads"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <button className="flex items-center gap-1" onClick={() => toggleSort("name")}>
                  Client {sortField === "name" ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
                </button>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Contact</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Service Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Balance</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(client => {
              const clientJobs = jobs.filter(j => j.clientId === client.id);
              const upcoming = clientJobs.find(j => j.status === "scheduled");
              return (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs shrink-0">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{client.name}</div>
                        {client.notes && (
                          <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <StickyNote className="w-3 h-3" />
                            <span className="truncate max-w-[160px]">{client.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="space-y-1">
                      {client.phone && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="text-xs">{client.phone}</span>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="text-xs truncate max-w-[180px]">{client.email}</span>
                        </div>
                      )}
                      {client.address && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                          <span className="text-xs truncate max-w-[180px]">{client.address}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {upcoming ? (
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Clock className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span className="text-xs">{format(parseISO(upcoming.date), "MMM d")} · {upcoming.time}</span>
                      </div>
                    ) : client.serviceDate ? (
                      <span className="text-xs text-gray-500">{format(parseISO(client.serviceDate), "MMM d, yyyy")}</span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(client.id)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                        client.status === "customer"
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                      }`}
                    >
                      {client.status === "customer" ? "Customer" : "Lead"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {client.balance > 0 ? (
                      <span className="text-sm font-semibold text-amber-600">${client.balance}</span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditing(client)}
                        className="px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteClient(client.id)}
                        className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                  No clients found.{" "}
                  <button onClick={() => setShowForm(true)} className="text-indigo-600 hover:underline">Add one</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
