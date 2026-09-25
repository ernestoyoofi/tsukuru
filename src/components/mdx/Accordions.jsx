"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export function Accordion({ title = "", children = null, open = false }) {
  const [expanded, setExpanded] = useState(Boolean(open));

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full cursor-pointer items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium select-none"
      >
        <span>{title}</span>
        <motion.span
          animate={{ rotate: expanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-lg leading-none text-zinc-500"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="border-t border-zinc-200 px-4 py-3 text-sm [&>*:first-child]:mt-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MDX_Component_Accordions({ children = null }) {
  return <div className="my-4 grid gap-2">{children}</div>;
}
