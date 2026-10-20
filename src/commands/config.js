import path from "node:path";
import { configPath, loadConfig } from "../lib/config.js";
import { tsukuruHome } from "../lib/platform.js";
import { log, color } from "../lib/log.js";

export async function configCommand() {
  const { config, file } = await loadConfig();
  const home = tsukuruHome();

  log.out(`${color.bold("Tsukuru home")}  ${home}`);
  log.out(`${color.bold("Config file")}   ${file}`);
  log.out(`${color.bold("Templates")}     ${path.join(home, "templates")}`);
  log.out(`${color.bold("Runtime")}       ${path.join(home, "runtime")}`);
  log.blank();
  log.out(JSON.stringify(config, null, 2));
  log.blank();
  log.info(`Edit ${configPath()} to change the defaults.`);
}
