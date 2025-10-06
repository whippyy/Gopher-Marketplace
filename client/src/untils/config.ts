let cachedConfig: any = null;

export async function getConfig() {
  if (!cachedConfig) {
    const res = await fetch('/config.json');
    cachedConfig = await res.json();
  }
  return cachedConfig;
}