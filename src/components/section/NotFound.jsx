"use client";

import Link from "next/link";

export default function NotFoundSection() {
  return (
    <div className="w-full min-h-100 h-[calc(100dvh-90px)] max-w-6xl m-auto flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-2">Ops... Page Not Found</h1>
      <p className="text-neutral-600">
        Nothing in here, please back to{" "}
        <Link href="/" className="text-neutral-600 font-semibold underline">
          home page
        </Link>
      </p>
    </div>
  );
}
