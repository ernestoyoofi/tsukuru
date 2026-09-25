"use client";

import { Magnifier } from "@gravity-ui/icons";
import { motion } from "framer-motion";
import { useRef, useState } from "react";

export default function Header() {
  const [opensearchbox, setopensearchbox] = useState(false);
  const searchPanelRef = useRef(null);

  return (
    <>
      <div className="fixed top-0 left-0 w-full h-20 masking-gradation-top-to-bottom pointer-events-none" />
      <header className="sticky top-0 left-0 w-full px-6 p-4 z-101">
        <div
          className="w-full max-w-3xl m-auto h-12.5 flex items-center justify-between rounded-full border border-white/30 bg-neutral-300/45 text-black px-2"
          style={{ backdropFilter: "blur(1.7px) url(#glasses-effect)" }}
        >
          <div className="w-full px-4">Ernestoyoofi</div>
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
      <svg style={{ width: 0, height: 0, position: "absolute" }}>
        <filter id="glasses-effect">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.02"
            numOctaves="3"
            seed="1"
            result="turb"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turb"
            scale="2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>
      <motion.div
        initial={{
          opacity: 0,
          pointerEvents: "none",
        }}
        animate={{
          opacity: opensearchbox ? 1 : 0,
          pointerEvents: opensearchbox ? "auto" : "none",
        }}
        className="fixed top-0 left-0 w-full h-dvh bg-neutral-600/60 backdrop-blur-sm z-102 pt-14"
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
              scale: 0.9,
            }}
            animate={{
              opacity: opensearchbox ? 1 : 0,
              scale: opensearchbox ? 1 : 0.9,
            }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              duration: 0.001,
            }}
            className="w-full h-12.5 bg-white rounded-2xl flex items-center justify-center shadow-xl"
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
              placeholder="Search in here..."
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
        </div>
      </motion.div>
    </>
  );
}
