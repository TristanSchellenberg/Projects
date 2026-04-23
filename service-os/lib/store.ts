"use client";

import { createContext, useContext } from "react";

export type LeadStatus = "lead" | "customer";
export type OpportunityStage = "interested" | "followup1" | "followup2" | "closed";

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  status: LeadStatus;
  serviceDate?: string;
  createdAt: string;
  updatedAt: string;
  balance: number;
}

export interface Opportunity {
  id: string;
  clientId: string;
  stage: OpportunityStage;
  followUpDate?: string;
  notes: string;
  createdAt: string;
}

export type JobStatus = "scheduled" | "in_progress" | "completed" | "unpaid";

export interface Job {
  id: string;
  clientId: string;
  title: string;
  serviceType: "car_wash" | "detailing" | "powerwash" | "other";
  date: string;
  time: string;
  assignedTo: string[];
  status: JobStatus;
  amount: number;
  paid: boolean;
  notes: string;
  clockedInAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "employee";
  color: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

export interface TimeLog {
  id: string;
  week: string;
  selling: number;
  fulfilling: number;
  admin: number;
  revenue: number;
  expenses: number;
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  completed: boolean;
}

export interface ClockSession {
  startedAt: string;
  closedClientIds: string[];
  isActive: boolean;
}

export interface AppState {
  clients: Client[];
  opportunities: Opportunity[];
  jobs: Job[];
  team: TeamMember[];
  expenses: Expense[];
  timeLogs: TimeLog[];
  goals: Goal[];
  clockSession: ClockSession | null;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function loadState(): AppState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem("serviceos_state");
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultState();
}

function defaultState(): AppState {
  const now = new Date().toISOString();
  const team: TeamMember[] = [
    { id: "t1", name: "You (Owner)", email: "owner@example.com", role: "owner", color: "#6366f1" },
    { id: "t2", name: "Marcus", email: "marcus@example.com", role: "employee", color: "#22c55e" },
    { id: "t3", name: "Dre", email: "dre@example.com", role: "employee", color: "#f59e0b" },
  ];
  const clients: Client[] = [
    { id: "c1", name: "John Smith", phone: "555-0101", email: "john@example.com", address: "123 Oak St", notes: "Has a Tesla, prefers Saturday mornings", status: "customer", serviceDate: "2026-04-26", createdAt: now, updatedAt: now, balance: 0 },
    { id: "c2", name: "Maria Garcia", phone: "555-0102", email: "maria@example.com", address: "456 Elm Ave", notes: "Two cars, wants interior detail monthly", status: "customer", serviceDate: "2026-04-28", createdAt: now, updatedAt: now, balance: 80 },
    { id: "c3", name: "Devon Williams", phone: "555-0103", email: "devon@example.com", address: "789 Maple Rd", notes: "Interested in monthly plan", status: "lead", createdAt: now, updatedAt: now, balance: 0 },
    { id: "c4", name: "Ashley Brown", phone: "555-0104", email: "ashley@example.com", address: "321 Pine Ln", notes: "Powerwash driveway + deck", status: "customer", serviceDate: "2026-04-30", createdAt: now, updatedAt: now, balance: 150 },
    { id: "c5", name: "Tyler Johnson", phone: "555-0105", email: "tyler@example.com", address: "654 Cedar Blvd", notes: "Neighbor referred them", status: "lead", createdAt: now, updatedAt: now, balance: 0 },
  ];
  const opportunities: Opportunity[] = [
    { id: "o1", clientId: "c3", stage: "interested", notes: "Said call back next week", createdAt: now },
    { id: "o2", clientId: "c5", stage: "followup1", followUpDate: "2026-04-25", notes: "Sent quote for full detail", createdAt: now },
  ];
  const jobs: Job[] = [
    { id: "j1", clientId: "c1", title: "Full Interior + Exterior Detail", serviceType: "detailing", date: "2026-04-26", time: "10:00", assignedTo: ["t1", "t2"], status: "scheduled", amount: 120, paid: true, notes: "" },
    { id: "j2", clientId: "c2", title: "Exterior Wash + Wax", serviceType: "car_wash", date: "2026-04-28", time: "09:00", assignedTo: ["t2"], status: "scheduled", amount: 80, paid: false, notes: "" },
    { id: "j3", clientId: "c4", title: "Driveway + Deck Powerwash", serviceType: "powerwash", date: "2026-04-30", time: "08:00", assignedTo: ["t1", "t3"], status: "scheduled", amount: 150, paid: false, notes: "Bring extra tip for deck surface" },
  ];
  const expenses: Expense[] = [
    { id: "e1", category: "Equipment", description: "Foam cannon + soap", amount: 85, date: "2026-04-01" },
    { id: "e2", category: "Supplies", description: "Microfiber towels (24 pack)", amount: 35, date: "2026-04-05" },
    { id: "e3", category: "Marketing", description: "Business cards", amount: 30, date: "2026-04-10" },
    { id: "e4", category: "Transport", description: "Gas", amount: 50, date: "2026-04-15" },
  ];
  const timeLogs: TimeLog[] = [
    { id: "wk1", week: "2026-04-07", selling: 35, fulfilling: 40, admin: 25, revenue: 700, expenses: 120 },
    { id: "wk2", week: "2026-04-14", selling: 45, fulfilling: 30, admin: 25, revenue: 950, expenses: 80 },
    { id: "wk3", week: "2026-04-21", selling: 40, fulfilling: 35, admin: 25, revenue: 820, expenses: 50 },
  ];
  const goals: Goal[] = [
    { id: "g1", title: "Clients this week", target: 3, current: 2, unit: "clients", completed: false },
    { id: "g2", title: "Revenue this week", target: 1000, current: 820, unit: "$", completed: false },
    { id: "g3", title: "Hours selling DTD", target: 10, current: 8, unit: "hrs", completed: false },
  ];
  return { clients, opportunities, jobs, team, expenses, timeLogs, goals, clockSession: null };
}

type Listener = () => void;
const listeners = new Set<Listener>();

let _state: AppState = defaultState();

export function getState(): AppState {
  if (typeof window !== "undefined") {
    _state = loadState();
  }
  return _state;
}

export function setState(updater: (s: AppState) => AppState) {
  _state = updater(_state);
  if (typeof window !== "undefined") {
    localStorage.setItem("serviceos_state", JSON.stringify(_state));
  }
  listeners.forEach((l) => l());
}

export function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export { generateId };
