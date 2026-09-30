"use client";

import { Magnifier } from "@gravity-ui/icons";
import { motion } from "framer-motion";
import { useEffect, useRef, useState, useDeferredValue, useMemo } from "react";
import Link from "next/link";
import { useSearchMinisearchData } from "@/lib/global/zustand";
import CardPost from "./CardPost";
import { cn } from "@/lib/cn";

export default function Header({ data = {} }) {
  const [opensearchbox, setopensearchbox] = useState(false);
  const { minisearch, status_fetch, error_msg, fetchDataIndexing } =
    useSearchMinisearchData();
  const [searchQuery, setSearchQuery] = useState("");
  const searchQueryDef = useDeferredValue(searchQuery);
  const searchPanelRef = useRef(null);

  const progressState = useMemo(() => {
    const progressMap = {
      idle: { opacity: 0, width: "0%" },
      working: { opacity: 1, width: "40%" },
      success: { opacity: 1, width: "100%" },
    };

    return progressMap[status_fetch] ?? progressMap.idle;
  }, [status_fetch]);

  useEffect(() => {
    fetchDataIndexing();
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.ctrlKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setopensearchbox((isOpen) => !isOpen);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const resultsSearch = useMemo(() => {
    if (!minisearch || !searchQueryDef.trim()) return [];
    return minisearch.search(searchQueryDef);
  }, [minisearch, searchQueryDef]);

  return (
    <>
      <div
        className="fixed w-full z-105 duration-200"
        style={{ opacity: progressState.opacity }}
      >
        <div
          className="bg-blue-500 h-[3px] shadow-xl shadow-blue-600 duration-400"
          style={{ width: progressState.width }}
        />
      </div>
      <div className="fixed top-0 left-0 w-full h-20 masking-gradation-top-to-bottom pointer-events-none z-101" />
      <header className="sticky top-0 left-0 w-full py-2 z-101 bg-gradient-to-b from-20% from-slate-50 to-transparent">
        <div className="w-full max-w-7xl m-auto h-12.5 flex items-center justify-between p-2">
          <div className="w-full font-semibold">
            <Link href="/" className="p-4 py-2">
              {data.title || "Tsukuru (/)"}
            </Link>
          </div>
          <button
            className="w-[50px] min-w-[50px] h-[50px] flex items-center justify-center cursor-pointer active:scale-90 duration-150 outline-none"
            aria-label="Navigation"
            onClick={() => {
              setopensearchbox(true);
            }}
          >
            <Magnifier width={21} height={21} />
          </button>
        </div>
      </header>
      <motion.div
        initial={{
          opacity: 0,
          pointerEvents: "none",
        }}
        animate={{
          opacity: opensearchbox ? 1 : 0,
          pointerEvents: opensearchbox ? "auto" : "none",
        }}
        className="fixed top-0 left-0 w-full h-dvh bg-black/70 backdrop-blur-[2px] z-102 pt-14"
        transition={{ duration: 0.2, ease: "circIn" }}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) {
            setopensearchbox(false);
          }
        }}
      >
        <div className="w-full px-6 p-4 max-w-3xl m-auto">
          <motion.div
            ref={searchPanelRef}
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: opensearchbox ? 1 : 0,
              scale: opensearchbox ? 1 : 0.95,
              filter: opensearchbox ? "blur(0px)" : "blur(8px)",
            }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              duration: 0.001,
            }}
            className="w-full h-12.5 bg-white rounded-xl flex items-center justify-center shadow-xl"
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <input
              className="w-full p-2 px-5 outline-none"
              autoFocus={true}
              placeholder="Type in here to search..."
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onFocus={(e) => {
                e.stopPropagation();
              }}
            />
          </motion.div>
          <motion.div
            layout="size"
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: opensearchbox ? 1 : 0,
              y: opensearchbox ? 0 : -8,
              filter: opensearchbox ? "blur(0px)" : "blur(8px)",
            }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              duration: 0.001,
              delay: 0.05,
              layout: { duration: 0.25, ease: "easeInOut" },
            }}
            className="mt-6 max-h-[calc(100dvh-240px)] bg-white shadow-md rounded-xl anchored-top-center p-2 px-4 overflow-hidden overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            style={{ borderRadius: 12 }}
          >
            {!resultsSearch[0] && (
              <motion.div layout className="w-full py-6">
                <p className="text-center w-full text-neutral-600 text-sm">
                  {!minisearch
                    ? "Data not fetched..."
                    : !searchQueryDef.trim()
                      ? "Try search data..."
                      : `No match for "${searchQueryDef}"`}
                </p>
              </motion.div>
            )}
            {resultsSearch.map((items, key) => (
              <motion.div
                layout
                className={cn(
                  "w-full border-dashed border-neutral-300 hover:text-blue-600 duration-300",
                  key === 0 ? "" : "mt-1 pt-1 border-t",
                )}
                key={key}
                onPointerUp={() => {
                  setopensearchbox(false);
                }}
              >
                <CardPost
                  data={items}
                  forcestyle="small_cover"
                  titleclass="text-base mb-1"
                  descriptionclass="text-sm"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
