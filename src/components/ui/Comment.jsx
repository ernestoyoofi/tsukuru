"use client";

import Giscus from "@giscus/react";

export default function Comment({ data = {} }) {
  if (!data || !Object.keys(data)[0]) {
    return (
      <div className="w-full border border-neutral-300 rounded-md p-4 px-6">
        <p className="text-sm text-center text-neutral-600">
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
