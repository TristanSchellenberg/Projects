"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { setState, generateId, Opportunity, OpportunityStage } from "@/lib/store";
import { format, parseISO } from "date-fns";
import { Plus, X, Phone, Bell } from "lucide-react";

const STAGES: { key: OpportunityStage; label: string; color: string; bg: string; border: string }[] = [
  { key: "interested", label: "Interested", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  { key: "followup1", label: "Follow Up #1", color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200" },
  { key: "followup2", label: "Follow Up #2", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
  { key: "closed", label: "Closed Won", color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
];

function AddProspectModal({ onClose }: { onClose: () => void }) {
  const state = useStore();
  const [clientId, setClientId] = useState("");
  const [stage, setStage] = useState<OpportunityStage>("interested");
  const [followUpDate, setFollowUpDate] = useState("");
  const [notes, setNotes] = useState("");
  const [newName, setNewName] = useState("");

  const leads = state.clients.filter(c => c.status === "lead");

  function save() {
    let cid = clientId;
    if (!cid && newName.trim()) {
      const now = new Date().toISOString();
      cid = generateId();
      setState(s => ({
        ...s,
        clients: [{ id: cid, name: newName.trim(), phone: "", email: "", address: "", notes: "", status: "lead", createdAt: now, updatedAt: now, balance: 0 }, ...s.clients],
      }));
    }
    if (!cid) return;
    const opp: Opportunity = { id: generateId(), clientId: cid, stage, followUpDate: followUpDate || undefined, notes, createdAt: new Date().toISOString() };
    setState(s => ({ ...s, opportunities: [...s.opportunities, opp] }));
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Add Prospect</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600">Existing Lead</label>
            <select
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={clientId}
              onChange={e => setClientId(e.target.value)}
            >
              <option value="">— Select lead —</option>
              {leads.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {!clientId && (
            <div>
              <label className="text-xs font-medium text-gray-600">Or create new prospect</label>
              <input
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Prospect name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-gray-600">Stage</label>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {STAGES.map(s => (
                <button
                  key={s.key}
                  onClick={() => setStage(s.key)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors border ${
                    stage === s.key ? `${s.bg} ${s.color} ${s.border}` : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Follow-Up Date</label>
            <input
              type="date"
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={followUpDate}
              onChange={e => setFollowUpDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Notes</label>
            <textarea
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={2}
              placeholder="What did they say?"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button onClick={save} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Add Prospect</button>
        </div>
      </div>
    </div>
  );
}

export default function OpportunitiesPage() {
  const state = useStore();
  const { opportunities, clients } = state;
  const [showAdd, setShowAdd] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<OpportunityStage | null>(null);

  function moveOpp(id: string, stage: OpportunityStage) {
    setState(s => ({
      ...s,
      opportunities: s.opportunities.map(o => o.id === id ? { ...o, stage } : o),
    }));
  }

  function deleteOpp(id: string) {
    setState(s => ({ ...s, opportunities: s.opportunities.filter(o => o.id !== id) }));
  }

  function convertToCustomer(clientId: string, oppId: string) {
    setState(s => ({
      ...s,
      clients: s.clients.map(c => c.id === clientId ? { ...c, status: "customer", updatedAt: new Date().toISOString() } : c),
      opportunities: s.opportunities.map(o => o.id === oppId ? { ...o, stage: "closed" } : o),
    }));
  }

  function handleDrop(e: React.DragEvent, stage: OpportunityStage) {
    e.preventDefault();
    if (dragging) moveOpp(dragging, stage);
    setDragging(null);
    setDragOver(null);
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const dueToday = opportunities.filter(o => o.followUpDate === todayStr);

  return (
    <div className="p-6 space-y-5">
      {showAdd && <AddProspectModal onClose={() => setShowAdd(false)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Opportunities</h1>
          <p className="text-sm text-gray-500 mt-0.5">{opportunities.length} prospects in pipeline</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Add Prospect
        </button>
      </div>

      {dueToday.length > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <Bell className="w-4 h-4 text-blue-500 shrink-0" />
          <p className="text-sm text-blue-800 font-medium">
            {dueToday.length} follow-up{dueToday.length > 1 ? "s" : ""} due today
          </p>
        </div>
      )}

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAGES.map(stage => {
          const cards = opportunities.filter(o => o.stage === stage.key);
          const isOver = dragOver === stage.key;
          return (
            <div
              key={stage.key}
              className={`rounded-xl border-2 transition-colors min-h-[400px] ${
                isOver ? `${stage.border} ${stage.bg}` : "border-gray-200 bg-gray-50"
              }`}
              onDragOver={e => { e.preventDefault(); setDragOver(stage.key); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => handleDrop(e, stage.key)}
            >
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${stage.color}`}>{stage.label}</span>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${stage.bg} ${stage.color}`}>{cards.length}</span>
                </div>
              </div>
              <div className="p-3 space-y-2">
                {cards.map(opp => {
                  const client = clients.find(c => c.id === opp.clientId);
                  const followUpDue = opp.followUpDate && opp.followUpDate <= todayStr;
                  return (
                    <div
                      key={opp.id}
                      draggable
                      onDragStart={() => setDragging(opp.id)}
                      onDragEnd={() => { setDragging(null); setDragOver(null); }}
                      className={`bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${
                        dragging === opp.id ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs shrink-0">
                            {(client?.name || "?").charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{client?.name || "Unknown"}</p>
                            {client?.phone && (
                              <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                                <Phone className="w-3 h-3" />
                                {client.phone}
                              </div>
                            )}
                          </div>
                        </div>
                        <button onClick={() => deleteOpp(opp.id)} className="p-1 hover:bg-gray-100 rounded text-gray-400 shrink-0">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      {opp.notes && <p className="text-xs text-gray-500 mt-2 italic">&ldquo;{opp.notes}&rdquo;</p>}
                      {opp.followUpDate && (
                        <div className={`mt-2 flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${
                          followUpDue ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-500"
                        }`}>
                          <Bell className="w-3 h-3" />
                          Follow up: {format(parseISO(opp.followUpDate), "MMM d")}
                          {followUpDue && " — DUE"}
                        </div>
                      )}
                      <div className="mt-3 flex gap-1 flex-wrap">
                        {STAGES.filter(s => s.key !== stage.key).map(s => (
                          <button
                            key={s.key}
                            onClick={() => moveOpp(opp.id, s.key)}
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors ${s.bg} ${s.color} ${s.border}`}
                          >
                            → {s.label}
                          </button>
                        ))}
                        {stage.key !== "closed" && (
                          <button
                            onClick={() => convertToCustomer(opp.clientId, opp.id)}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200"
                          >
                            ✓ Convert
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {cards.length === 0 && (
                  <div className="text-center py-8 text-gray-300 text-xs">
                    Drop prospects here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
