const useColor =
  !process.env.NO_COLOR &&
  (process.env.FORCE_COLOR === "1" || process.stdout.isTTY);

function paint(code) {
  return (text) => (useColor ? `\u001b[${code}m${text}\u001b[0m` : String(text));
}

export const color = {
  bold: paint("1"),
  dim: paint("2;90"),
  red: paint("31"),
  green: paint("32"),
  yellow: paint("33"),
  blue: paint("34"),
  cyan: paint("36"),
};

const prefix = color.cyan("tsukuru");

export const log = {
  info(message) {
    console.log(`${prefix} ${message}`);
  },
  step(message) {
    console.log(`${prefix} ${color.blue("›")} ${message}`);
  },
  success(message) {
    console.log(`${prefix} ${color.green("✓")} ${message}`);
  },
  warn(message) {
    console.warn(`${prefix} ${color.yellow("!")} ${message}`);
  },
  error(message) {
    console.error(`${prefix} ${color.red("✗")} ${message}`);
  },
  blank() {
    console.log("");
  },
  out(message = "") {
    console.log(message);
  },
};
