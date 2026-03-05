const AUTH_COOKIE_HINTS = [
  "next-auth.session-token",
  "__secure-next-auth.session-token",
  "authjs.session-token",
  "__secure-authjs.session-token",
  "connect.sid",
  "session",
  "token",
  "jwt",
  "auth",
  "access_token",
  "refresh_token",
];

function normalizeCookieName(name: string): string {
  return name.trim().toLowerCase();
}

export function hasLikelyAuthCookie(cookieHeader?: string): boolean {
  if (!cookieHeader?.trim()) return false;

  const cookieNames = cookieHeader
    .split(";")
    .map((entry) => entry.split("=")[0] ?? "")
    .map(normalizeCookieName)
    .filter(Boolean);

  if (cookieNames.length === 0) return false;

  return cookieNames.some((name) =>
    AUTH_COOKIE_HINTS.some((hint) => name.includes(hint))
  );
}
