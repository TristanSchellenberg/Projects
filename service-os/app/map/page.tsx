"use client";

import dynamic from "next/dynamic";
import { useStore } from "@/hooks/useStore";
import { Map } from "lucide-react";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Map className="w-8 h-8 text-indigo-400 mx-auto mb-2 animate-pulse" />
        <p className="text-sm text-gray-500">Loading map…</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const { clients, jobs } = useStore();
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <h1 className="text-2xl font-bold text-gray-900">Map View</h1>
        <p className="text-sm text-gray-500 mt-0.5">See where your clients are · Click a pin for details · Bigger circles = more revenue</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <MapView clients={clients} jobs={jobs} />
      </div>
    </div>
  );
}
