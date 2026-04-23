"use client";

import { useState } from "react";
import { useStore } from "@/hooks/useStore";
import { setState, generateId, TeamMember } from "@/lib/store";
import { Plus, X, User, Trash2 } from "lucide-react";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6", "#06b6d4", "#ef4444"];

export default function SettingsPage() {
  const state = useStore();
  const { team } = state;
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newColor, setNewColor] = useState(COLORS[1]);
  const [niche, setNiche] = useState("detailing");

  function addMember() {
    if (!newName.trim()) return;
    const member: TeamMember = {
      id: generateId(),
      name: newName.trim(),
      email: newEmail.trim(),
      role: "employee",
      color: newColor,
    };
    setState(s => ({ ...s, team: [...s.team, member] }));
    setNewName("");
    setNewEmail("");
  }

  function removeMember(id: string) {
    setState(s => ({ ...s, team: s.team.filter(m => m.id !== id) }));
  }

  function resetData() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("serviceos_state");
      window.location.reload();
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your team, niche, and preferences</p>
      </div>

      {/* Niche selector */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Your Service Niche</h2>
        <p className="text-xs text-gray-500 mb-3">This customizes the language and templates throughout the app.</p>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "car_wash", label: "Car Washing" },
            { key: "detailing", label: "Car Detailing" },
            { key: "powerwash", label: "Powerwashing" },
            { key: "junk", label: "Junk Removal" },
            { key: "landscaping", label: "Landscaping" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setNiche(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${niche === key ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Team management */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Team Members</h2>
        <p className="text-xs text-gray-500 mb-4">Add your crew so you can assign them to jobs and track their contributions.</p>

        <div className="space-y-2 mb-5">
          {team.map(member => (
            <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 group">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: member.color }}>
                {member.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                {member.email && <p className="text-xs text-gray-400">{member.email}</p>}
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${member.role === "owner" ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-600"}`}>
                {member.role}
              </span>
              {member.role !== "owner" && (
                <button
                  onClick={() => removeMember(member.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:bg-red-50 rounded transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-600 mb-3">Add Team Member</p>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Name *"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
              <input
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Email (optional)"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${newColor === c ? "scale-125 ring-2 ring-offset-1 ring-gray-400" : "hover:scale-110"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <button
                onClick={addMember}
                className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card border-red-200">
        <h2 className="font-semibold text-red-600 mb-2">Danger Zone</h2>
        <p className="text-xs text-gray-500 mb-4">This will reset all data to demo defaults. Cannot be undone.</p>
        <button
          onClick={resetData}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Reset All Data
        </button>
      </div>
    </div>
  );
}
