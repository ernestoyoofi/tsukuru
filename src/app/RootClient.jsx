"use client";

import { ReactLenis } from "lenis/react";

export default function GlobalRootClient({ children }) {
  return (
    <>
      {/* <ReactLenis
        options={{
          lerp: 0.1,
          duration: 1,
          smooth: true,
          smoothTouch: false,
          wheelMultiplier: 1.2,
          touchMultiplier: 1.2,
        }}
        root
      /> */}
      {children}
    </>
  );
}
