"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Children, useState } from "react";

export function Tab({ children = null }) {
  return <div>{children}</div>;
}

function getLabel(tab, i) {
  const label = tab?.props?.label;
  if (typeof label === "string" && label.trim()) return label;
  return `Tab ${i + 1}`;
}

export default function MDX_Component_Tabs({ children = null }) {
  const tabs = Children.toArray(children).filter((c) => {
    if (typeof c === "string") return c.trim().length > 0;
    return Boolean(c);
  });
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0);
  const current = tabs[active] || null;

  const go = (i) => {
    setDirection(i > active ? 1 : -1);
    setActive(i);
  };

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-4 border-b border-zinc-200">
        {tabs.map((tab, i) => (
          <button
            key={tab.key ?? `tab-${i}`}
            type="button"
            onClick={() => go(i)}
            className={`relative -mb-px px-1 pb-2 text-sm ${
              i === active
                ? "font-semibold text-zinc-950"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            {getLabel(tab, i)}
            {i === active && (
              <motion.span
                layoutId="mdx-tab-underline"
                className="absolute inset-x-0 -bottom-px h-0.5 bg-zinc-900"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        <motion.div
          key={active}
          custom={direction}
          variants={{
            enter: (d) => ({ opacity: 0, x: 40 * d }),
            center: { opacity: 1, x: 0 },
            exit: (d) => ({ opacity: 0, x: -40 * d }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.12 }}
        >
          {current}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
