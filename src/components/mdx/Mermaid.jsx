"use client";

import mermaid from "mermaid";
import {
  Children,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useThemeStore } from "@/lib/global/zustand";

let mermaidInitialized = false;
let currentMermaidTheme = null;
function ensureMermaidInit(theme) {
  if (!mermaidInitialized || currentMermaidTheme !== theme) {
    mermaid.initialize({
      startOnLoad: false,
      theme,
      securityLevel: "loose",
      fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui",
    });
    mermaidInitialized = true;
    currentMermaidTheme = theme;
  }
}

function childrenToText(children) {
  let out = "";
  Children.forEach(children, (child) => {
    if (typeof child === "string" || typeof child === "number") {
      out += child;
    } else if (isValidElement(child)) {
      out += childrenToText(child.props.children);
    }
  });
  return out;
}

function toChartText(chart, children) {
  if (typeof chart === "string" && chart.trim()) return chart.trim();
  return childrenToText(children).trim();
}

export default function MDX_Component_Mermaid({ chart = "", children = null }) {
  const rawId = useId();
  const id = `mermaid-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const containerRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const text = toChartText(chart, children);
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    if (!text || !containerRef.current) return;
    let cancelled = false;

    ensureMermaidInit(theme === "dark" ? "dark" : "default");

    // mermaid.render is stable and doesn't rely on DOM scan like mermaid.run,
    // avoids Turbopack async chunk HMR deletion for dagre-*.mjs
    mermaid
      .render(`${id}-svg`, text)
      .then(({ svg }) => {
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = svg;
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [id, text, theme]);

  return (
    <div className="my-4 min-w-0 max-w-full overflow-x-auto rounded-xl border border-zinc-200 p-4 [&_svg]:max-w-none">
      {failed ? (
        <div className="max-w-full overflow-x-auto whitespace-pre text-xs text-zinc-600">
          {text}
        </div>
      ) : (
        <div
          ref={containerRef}
          className="flex justify-center text-sm"
          aria-live="polite"
        />
      )}
    </div>
  );
}
