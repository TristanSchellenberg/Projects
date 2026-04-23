"use client";

import { useEffect, useReducer } from "react";
import { getState, subscribe, AppState } from "@/lib/store";

export function useStore(): AppState {
  const [, rerender] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    const unsub = subscribe(rerender);
    return () => { unsub(); };
  }, []);
  return getState();
}
