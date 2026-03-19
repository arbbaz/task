import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertIncludes(source, expected, label) {
  if (!source.includes(expected)) {
    throw new Error(`Missing ${label}: expected to find "${expected}"`);
  }
}

const nextConfig = read("next.config.ts");
const authConfig = read("auth.ts");
const envConfig = read("lib/env.ts");
const packageJson = JSON.parse(read("package.json"));

assertIncludes(nextConfig, "Content-Security-Policy", "CSP header");
assertIncludes(nextConfig, "X-Content-Type-Options", "nosniff header");
assertIncludes(nextConfig, "X-Frame-Options", "frame header");
assertIncludes(nextConfig, "Referrer-Policy", "referrer policy");
assertIncludes(nextConfig, "Permissions-Policy", "permissions policy");

assertIncludes(authConfig, "useSecureCookies", "secure NextAuth cookie config");
assertIncludes(authConfig, "sessionToken", "session cookie override");
assertIncludes(authConfig, "csrfToken", "csrf cookie override");

assertIncludes(envConfig, "API_INTERNAL_URL", "server-only API env split");

if (!packageJson.scripts?.lint) {
  throw new Error('Missing "lint" script');
}
if (!packageJson.scripts?.typecheck) {
  throw new Error('Missing "typecheck" script');
}
if (!packageJson.scripts?.["check:security-config"]) {
  throw new Error('Missing "check:security-config" script');
}

console.log("Security config checks passed.");
