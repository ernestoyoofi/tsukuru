import { spawnSync } from "node:child_process";

export const isBun = typeof globalThis.Bun !== "undefined";

export const runtimeName = isBun ? "bun" : "node";

export const runtimeVersion = isBun
  ? globalThis.Bun?.version || "unknown"
  : process.versions.node;

let bunInfo = null;

function detectBun() {
  if (bunInfo) return bunInfo;

  if (isBun) {
    bunInfo = {
      available: true,
      command: process.execPath,
      version: globalThis.Bun?.version || "unknown",
    };
    return bunInfo;
  }

  const result = spawnSync("bun", ["--version"], {
    encoding: "utf8",
    stdio: "pipe",
  });

  if (!result.error && result.status === 0) {
    bunInfo = {
      available: true,
      command: "bun",
      version: (result.stdout || "").trim() || "unknown",
    };
  } else {
    bunInfo = { available: false, command: null, version: null };
  }

  return bunInfo;
}

function nodeRuntime() {
  if (!isBun) {
    return {
      name: "node",
      command: process.execPath,
      version: process.versions.node,
    };
  }

  const result = spawnSync("node", ["--version"], {
    encoding: "utf8",
    stdio: "pipe",
  });

  if (result.error || result.status !== 0) {
    throw new Error(
      "TSUKURU_RUNTIME=node was set, but Node.js could not be found.",
    );
  }

  return {
    name: "node",
    command: "node",
    version: (result.stdout || "").trim().replace(/^v/, ""),
  };
}

export function preferredRuntime() {
  const requested = String(process.env.TSUKURU_RUNTIME || "")
    .trim()
    .toLowerCase();

  if (requested === "node") return nodeRuntime();

  const bun = detectBun();
  if (bun.available) {
    return {
      name: "bun",
      command: bun.command,
      version: bun.version,
    };
  }

  if (requested === "bun") {
    throw new Error(
      "TSUKURU_RUNTIME=bun was set, but Bun could not be found.",
    );
  }

  return {
    name: "node",
    command: process.execPath,
    version: process.versions.node,
  };
}
