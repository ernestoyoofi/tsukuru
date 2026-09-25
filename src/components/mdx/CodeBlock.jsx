"use client";

import { useMemo, useRef, useState } from "react";

const LANGUAGE_NAMES = {
  js: "JavaScript",
  jsx: "JavaScript",
  ts: "TypeScript",
  tsx: "TypeScript",
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  html: "HTML",
  xml: "XML",
  css: "CSS",
  python: "Python",
  py: "Python",
  md: "Markdown",
  mdx: "MDX",
  diff: "Diff",
  text: "Text",
  plaintext: "Text",
  plain: "Text",
};

function prettyName(lang) {
  if (!lang) return null;
  const key = String(lang).toLowerCase();
  if (LANGUAGE_NAMES[key]) return LANGUAGE_NAMES[key];
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function parseHighlight(input) {
  if (!input) return new Set();
  const str = Array.isArray(input) ? input.join(",") : String(input);
  const set = new Set();
  for (const part of str.split(",")) {
    const p = part.trim();
    if (!p) continue;
    if (p.includes("-")) {
      const [a, b] = p.split("-").map((n) => parseInt(n.trim(), 10));
      if (Number.isNaN(a) || Number.isNaN(b)) continue;
      const from = Math.min(a, b);
      const to = Math.max(a, b);
      for (let i = from; i <= to; i++) set.add(i);
    } else {
      const n = parseInt(p, 10);
      if (!Number.isNaN(n)) set.add(n);
    }
  }
  return set;
}

function getRawText(node) {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(getRawText).join("");
  if (typeof node === "object" && "props" in node) {
    return getRawText(node.props.children);
  }
  return String(node);
}

async function copyText(text) {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  document.body.removeChild(area);
}

export default function MDX_Component_CodeBlock({
  language = "",
  highlight = "",
  title = "",
  children = null,
}) {
  const preRef = useRef(null);
  const timerRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const label = prettyName(language) || title || null;

  const highlightSet = useMemo(() => parseHighlight(highlight), [highlight]);
  const hasHighlight = highlightSet.size > 0;

  // raw string for copy + for highlight rendering
  const raw = useMemo(() => getRawText(children), [children]);
  const lines = useMemo(() => {
    if (!hasHighlight) return null;
    // keep trailing newline handling: split and preserve empty last line if needed
    const s = raw.replace(/\n$/, "");
    return s.split("\n");
  }, [raw, hasHighlight]);

  const onCopy = async () => {
    try {
      const text = preRef.current?.innerText ?? raw;
      await copyText(text);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mt-4 min-w-0 max-w-full overflow-hidden rounded-lg border border-zinc-200 bg-white">
      {/* header - simple: kiri bahasa, kanan copy */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-50 px-3 py-2">
        <span className="min-w-0 truncate text-xs font-medium text-zinc-500">
          {label ?? <span className="text-zinc-400">Code</span>}
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 active:scale-[0.98]"
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M13.5 4.5L6.5 11.5L2.5 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M5 3.5H4a1 1 0 00-1 1v7a1 1 0 001 1h6a1 1 0 001-1v-1M8 3.5a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1H9a1 1 0 01-1-1v-4z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* content - overflow fix tetap dijaga */}
      <div
        className="max-w-full bg-white"
        style={{ maxWidth: "100%", overflowX: "auto" }}
      >
        <pre
          ref={preRef}
          className="m-0 bg-white p-0 text-sm leading-6 text-zinc-800"
          style={{ width: "max-content", minWidth: "100%", margin: 0 }}
        >
          {hasHighlight && lines ? (
            <code className="block py-3 text-[13px] leading-6">
              {lines.map((line, idx) => {
                const n = idx + 1;
                const isHL = highlightSet.has(n);
                return (
                  <span
                    key={idx}
                    className={
                      isHL
                        ? "block border-l-2 border-amber-400 bg-amber-50/70 px-4 pr-6"
                        : "block px-4 pr-6"
                    }
                  >
                    {line.length === 0 ? "\u00A0" : line}
                  </span>
                );
              })}
            </code>
          ) : (
            <code className="block p-4 text-[13px] leading-6 [&_span]:!bg-transparent">
              {children}
            </code>
          )}
        </pre>
      </div>
    </div>
  );
}
