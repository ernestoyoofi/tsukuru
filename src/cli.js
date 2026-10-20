import { parseArgs } from "./lib/args.js";
import { printHelp, printVersion } from "./commands/help.js";
import { initCommand } from "./commands/init.js";
import { serveCommand } from "./commands/serve.js";
import { validateCommand } from "./commands/validate.js";
import { templatePreviewCommand } from "./commands/templatePreview.js";
import { configCommand } from "./commands/config.js";

const MIN_NODE = [20, 9, 0];

function ensureNodeVersion() {
  const current = process.versions.node.split(".").map(Number);
  for (let index = 0; index < MIN_NODE.length; index++) {
    if ((current[index] || 0) > MIN_NODE[index]) return;
    if ((current[index] || 0) < MIN_NODE[index]) {
      throw new Error(
        `Tsukuru requires Node.js ${MIN_NODE.join(".")} or newer. ` +
          `You are running ${process.versions.node}.`,
      );
    }
  }
}

export async function main(argv) {
  const options = parseArgs(argv);

  if (options.version || options.command === "version") {
    printVersion();
    return;
  }

  if (options.help || options.command === "help") {
    printHelp();
    return;
  }

  ensureNodeVersion();

  switch (options.command) {
    case "init":
      await initCommand(options);
      break;
    case "serve":
      await serveCommand(options);
      break;
    case "validate":
      await validateCommand(options);
      break;
    case "template-preview":
      await templatePreviewCommand(options);
      break;
    case "config":
      await configCommand(options);
      break;
    default:
      printHelp();
  }
}
