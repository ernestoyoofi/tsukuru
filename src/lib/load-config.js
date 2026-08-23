export default async function loadConfig() {
  try {
    const { TsukuruConfig } = await import("../../tsukuru.config.js");
    return TsukuruConfig;
  } catch (_error) {
    console.warn(
      "[WARN] Tsukuru config (tsukuru.config.js) not found, switch to default configuration.",
    );
    return {};
  }
}
