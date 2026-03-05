/**
 * Backend API URL. Never commit production URLs; use env only.
 * Uses NEXT_PUBLIC_API_URL for both server and client.
 */

function isProduction(): boolean {
  return typeof process !== "undefined" && process.env.NODE_ENV === "production";
}

/** For server-side code (e.g. auth.ts). In production, throws if no URL is set. */
export function getBackendUrl(): string {
  const raw =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_URL : undefined;
  const url = typeof raw === "string" ? raw : "";
  const trimmed = url.replace(/\/$/, "");
  if (isProduction() && !trimmed) {
    throw new Error(
      "NEXT_PUBLIC_API_URL must be set in production. Do not commit production URLs."
    );
  }
  return trimmed;
}

/** For client-side API calls. Set NEXT_PUBLIC_API_URL in .env for dev. */
export function getApiBaseUrl(): string {
  if (typeof process === "undefined") return "";
  const raw = process.env.NEXT_PUBLIC_API_URL;
  const url = typeof raw === "string" ? raw : "";
  return url.replace(/\/$/, "");
}
