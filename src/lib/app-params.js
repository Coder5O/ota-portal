const isBrowser = typeof window !== "undefined";

export function getAppParams() {
  return {
    appId: import.meta.env.VITE_BASE44_APP_ID || "",
    token: null,
    functionsVersion: "",
    appBaseUrl: "",
  };
}
