"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Client, Job } from "@/lib/store";
import { format, parseISO } from "date-fns";
import { Phone, Mail, MapPin, Briefcase } from "lucide-react";

interface MappedClient extends Client {
  coords?: [number, number];
  geocoding?: boolean;
  failed?: boolean;
}

const CACHE_KEY = "serviceos_geocache";

function loadCache(): Record<string, [number, number]> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveCache(cache: Record<string, [number, number]>) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

async function geocodeAddress(address: string): Promise<[number, number] | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
      { headers: { "User-Agent": "ServiceOS/1.0" } }
    );
    const data = await res.json();
    if (data?.[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch {}
  return null;
}

interface Props {
  clients: Client[];
  jobs: Job[];
}

export default function MapView({ clients, jobs }: Props) {
  const [mapped, setMapped] = useState<MappedClient[]>([]);
  const [filter, setFilter] = useState<"all" | "customer" | "lead">("all");
  const geocoding = useRef(false);

  useEffect(() => {
    const withAddresses = clients.filter(c => c.address?.trim());
    setMapped(withAddresses.map(c => ({ ...c })));
    if (geocoding.current) return;
    geocoding.current = true;

    (async () => {
      const cache = loadCache();
      for (const client of withAddresses) {
        const key = client.address.trim().toLowerCase();
        if (cache[key]) {
          setMapped(prev => prev.map(m => m.id === client.id ? { ...m, coords: cache[key] } : m));
          continue;
        }
        setMapped(prev => prev.map(m => m.id === client.id ? { ...m, geocoding: true } : m));
        await new Promise(r => setTimeout(r, 1100)); // Nominatim rate limit: 1 req/sec
        const coords = await geocodeAddress(client.address);
        if (coords) {
          cache[key] = coords;
          saveCache(cache);
          setMapped(prev => prev.map(m => m.id === client.id ? { ...m, coords, geocoding: false } : m));
        } else {
          setMapped(prev => prev.map(m => m.id === client.id ? { ...m, geocoding: false, failed: true } : m));
        }
      }
      geocoding.current = false;
    })();
  }, [clients]);

  const visible = mapped.filter(c => filter === "all" || c.status === filter);
  const placed = visible.filter(c => c.coords);
  const pending = mapped.filter(c => c.geocoding).length;
  const center: [number, number] = placed.length > 0
    ? [placed.reduce((s, c) => s + c.coords![0], 0) / placed.length, placed.reduce((s, c) => s + c.coords![1], 0) / placed.length]
    : [39.5, -98.35]; // US center default

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white flex-wrap">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(["all", "customer", "lead"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${filter === f ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              {f === "all" ? "All" : f === "customer" ? "Customers" : "Leads"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 ml-auto">
          {pending > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse inline-block" />
              Locating {pending} address{pending > 1 ? "es" : ""}…
            </span>
          )}
          <span><span className="font-semibold text-gray-900">{placed.length}</span> clients on map</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Customer</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" /> Lead</span>
        </div>
      </div>

      {/* Map + sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <MapContainer
          center={center}
          zoom={placed.length > 0 ? 11 : 4}
          className="flex-1 h-full z-0"
          key={center.join(",")}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {placed.map(client => {
            const clientJobs = jobs.filter(j => j.clientId === client.id);
            const nextJob = clientJobs.find(j => j.status === "scheduled");
            const totalRevenue = clientJobs.filter(j => j.paid).reduce((s, j) => s + j.amount, 0);
            const radius = 8 + Math.min(totalRevenue / 30, 14);
            const color = client.status === "customer" ? "#22c55e" : "#6366f1";
            return (
              <CircleMarker
                key={client.id}
                center={client.coords!}
                radius={radius}
                pathOptions={{ color: "white", weight: 2, fillColor: color, fillOpacity: 0.9 }}
              >
                <Popup>
                  <div className="min-w-[180px] space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: color }}>
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{client.name}</p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize ${client.status === "customer" ? "bg-green-100 text-green-700" : "bg-indigo-100 text-indigo-700"}`}>
                          {client.status}
                        </span>
                      </div>
                    </div>
                    {client.phone && <p className="text-xs text-gray-600 flex items-center gap-1"><Phone className="w-3 h-3" />{client.phone}</p>}
                    {client.address && <p className="text-xs text-gray-600 flex items-center gap-1"><MapPin className="w-3 h-3" />{client.address}</p>}
                    {nextJob && (
                      <p className="text-xs text-indigo-600 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {format(parseISO(nextJob.date), "MMM d")} · {nextJob.title}
                      </p>
                    )}
                    {totalRevenue > 0 && (
                      <p className="text-xs font-semibold text-green-600">${totalRevenue} earned</p>
                    )}
                    {client.balance > 0 && (
                      <p className="text-xs font-semibold text-amber-600">${client.balance} outstanding</p>
                    )}
                    {client.notes && <p className="text-xs text-gray-400 italic">{client.notes}</p>}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Side list */}
        <div className="w-56 border-l border-gray-200 bg-white overflow-y-auto shrink-0">
          <div className="px-3 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Client List</p>
          </div>
          <div className="divide-y divide-gray-50">
            {visible.map(client => (
              <div key={client.id} className="px-3 py-2.5 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${client.geocoding ? "bg-yellow-400 animate-pulse" : client.coords ? (client.status === "customer" ? "bg-green-500" : "bg-indigo-500") : "bg-gray-300"}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{client.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{client.address || "No address"}</p>
                  </div>
                </div>
              </div>
            ))}
            {visible.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-6">No clients to show</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
