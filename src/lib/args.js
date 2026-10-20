export const COMMAND_ALIASES = {
  init: "init",
  create: "init",
  new: "init",
  serve: "serve",
  preview: "serve",
  look: "serve",
  validate: "validate",
  test: "validate",
  check: "validate",
  publish: "publish",
  push: "publish",
  "template-preview": "template-preview",
  template: "template-preview",
  tpl: "template-preview",
  config: "config",
  settings: "config",
  help: "help",
  version: "version",
};

export const VALIDATE_FLAGS = new Set(["--valid", "--unvalid", "--publish"]);

function takeValue(argv, index, flag) {
  const value = argv[index + 1];
  if (value === undefined || (value.startsWith("-") && value !== "-")) {
    throw new Error(`Option ${flag} requires a value.`);
  }
  return value;
}

function splitEquals(arg) {
  if (!arg.startsWith("--")) return null;
  const index = arg.indexOf("=");
  if (index === -1) return null;
  return [arg.slice(0, index), arg.slice(index + 1)];
}

export function parseArgs(rawArgv) {
  const argv = [];
  for (const arg of rawArgv) {
    const pair = splitEquals(arg);
    if (pair) argv.push(pair[0], pair[1]);
    else argv.push(arg);
  }

  const options = {
    command: null,
    name: null,
    dir: null,
    repo: null,
    branch: null,
    remote: null,
    protocol: null,
    structureBranch: null,
    templateBranch: null,
    port: null,
    host: null,
    previewDir: null,
    force: false,
    install: true,
    keepTemp: false,
    refresh: false,
    offline: false,
    open: false,
    save: false,
    passthrough: [],
    help: false,
    version: false,
  };

  const positionals = [];
  let stopOptions = false;

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];

    if (stopOptions) {
      positionals.push(arg);
      continue;
    }

    if (arg === "--") {
      stopOptions = true;
      continue;
    }

    switch (arg) {
      case "--help":
      case "-h":
        options.help = true;
        break;
      case "--version":
      case "-V":
      case "-v":
        options.version = true;
        break;
      case "--init":
        options.command = "init";
        break;
      case "--serve":
      case "--preview":
        options.command = "serve";
        break;
      case "--validate":
      case "--test":
        options.command = "validate";
        break;
      case "--name": {
        options.name = takeValue(argv, index, arg);
        index += 1;
        break;
      }
      case "--dir": {
        options.dir = takeValue(argv, index, arg);
        index += 1;
        break;
      }
      case "--repo": {
        options.repo = takeValue(argv, index, arg);
        index += 1;
        break;
      }
      case "--remote": {
        options.remote = takeValue(argv, index, arg);
        index += 1;
        break;
      }
      case "--protocol": {
        options.protocol = takeValue(argv, index, arg);
        index += 1;
        break;
      }
      case "--structure-branch": {
        options.structureBranch = takeValue(argv, index, arg);
        index += 1;
        break;
      }
      case "--branch": {
        options.branch = takeValue(argv, index, arg);
        index += 1;
        break;
      }
      case "--template-branch": {
        options.templateBranch = takeValue(argv, index, arg);
        index += 1;
        break;
      }
      case "--port":
      case "-p": {
        options.port = takeValue(argv, index, arg);
        index += 1;
        break;
      }
      case "--host":
      case "-H": {
        options.host = takeValue(argv, index, arg);
        index += 1;
        break;
      }
      case "--preview-dir": {
        options.previewDir = takeValue(argv, index, arg);
        index += 1;
        break;
      }
      case "--force":
        options.force = true;
        break;
      case "--no-install":
        options.install = false;
        break;
      case "--keep-temp":
        options.keepTemp = true;
        break;
      case "--refresh":
        options.refresh = true;
        break;
      case "--offline":
        options.offline = true;
        break;
      case "--open":
        options.open = true;
        break;
      case "--save":
        options.save = true;
        break;
      default:
        if (VALIDATE_FLAGS.has(arg)) {
          options.passthrough.push(arg);
        } else if (arg.startsWith("-") && arg !== "-") {
          throw new Error(`Unknown option: ${arg}`);
        } else {
          positionals.push(arg);
        }
    }
  }

  if (options.help || options.version) {
    return { ...options, positionals };
  }

  if (!options.command && positionals.length > 0) {
    const candidate = positionals[0].toLowerCase();
    const command = COMMAND_ALIASES[candidate];
    if (!command) {
      throw new Error(
        `Unknown command: ${positionals[0]}\nRun "tsukuru help" to see available commands.`,
      );
    }
    options.command = command;
    positionals.shift();
  }

  if (!options.command) {
    options.command = "help";
  }

  if (options.command === "init") {
    options.name = options.name || positionals.shift() || null;
  } else if (options.command === "serve") {
    options.dir = options.dir || positionals.shift() || null;
  } else if (options.command === "validate") {
    options.dir = options.dir || positionals.shift() || null;
  } else if (options.command === "publish") {
    options.dir = options.dir || positionals.shift() || null;
  }

  if (positionals.length > 0) {
    throw new Error(`Unexpected argument: ${positionals.join(" ")}`);
  }

  if (options.port !== null) {
    const port = Number(options.port);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error(`Invalid port: ${options.port}`);
    }
    options.port = port;
  }

  return options;
}
