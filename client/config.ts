export interface AppConfig {
  API_URL: string;
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  FIREBASE_MESSAGING_SENDER_ID: string;
  FIREBASE_APP_ID: string;
}

let cachedConfig: AppConfig | null = null;

export async function getConfig(): Promise<AppConfig> {
  if (!cachedConfig) {
    const res = await fetch('/config.json');

    if (!res.ok) {
      throw new Error(`Failed to load config.json: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    // Basic validation without full type guard
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid config: expected an object');
    }

    cachedConfig = data as AppConfig;
  }

  return cachedConfig;
}