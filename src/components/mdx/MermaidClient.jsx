"use client";

import dynamic from "next/dynamic";

const MDX_Component_Mermaid = dynamic(() => import("./Mermaid"), {
  ssr: false,
  loading: () => (
    <div className="my-4 rounded-xl border border-zinc-200 p-4 text-sm text-zinc-500">
      Loading diagram...
    </div>
  ),
});

export default MDX_Component_Mermaid;
