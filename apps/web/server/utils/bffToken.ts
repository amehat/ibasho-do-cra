import jwt from "jsonwebtoken";

function assertSecret(secret: string): void {
  if (!secret) {
    throw new Error("NUXT_BFF_SHARED_SECRET doit être configuré (secret partagé BFF↔API). AD-14.");
  }
}

export function signBffToken(userId: string, secret: string): string {
  assertSecret(secret);
  return jwt.sign({ sub: userId }, secret, { algorithm: "HS256", expiresIn: "60s" });
}
export function signBffOrigin(secret: string): string {
  assertSecret(secret);
  return jwt.sign({}, secret, { algorithm: "HS256", expiresIn: "60s" });
}
