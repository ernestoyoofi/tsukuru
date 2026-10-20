#!/usr/bin/env node

import { main } from "../src/cli.js";

main(process.argv.slice(2)).catch((error) => {
  console.error(`\n[tsukuru] ${error?.message || error}`);
  if (process.env.TSUKURU_DEBUG === "1" && error?.stack) {
    console.error(error.stack);
  }
  process.exitCode = 1;
});
