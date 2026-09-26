"use client";

import Giscus from "@giscus/react";

export default function Comment({ data = {} }) {
  if (!data || !Object.keys(data)[0] || !data?.repoId) {
    return (
      <div className="w-full border border-neutral-200 rounded-md p-4 px-6">
        <p className="text-sm text-center text-neutral-500">
          No Comment Feature Configuration...
        </p>
      </div>
    );
  }
  return (
    <>
      <Giscus {...data} />
    </>
  );
}
