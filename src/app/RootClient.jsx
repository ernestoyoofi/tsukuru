"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/lib/global/zustand";

export default function GlobalRootClient({ children }) {
  useEffect(() => {
    Promise.resolve(useThemeStore.persist.rehydrate()).then(() => {
      document.documentElement.dataset.theme = useThemeStore.getState().theme;
    });
  }, []);

  return <>{children}</>;
}
