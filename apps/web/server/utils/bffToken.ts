import jwt from "jsonwebtoken";

function assertSecret(secret: string): void {
  if (!secret || secret === "change_me_dev_only") {
    throw new Error("NUXT_BFF_SHARED_SECRET doit être configuré (secret partagé BFF↔API). AD-14.");
  }
}

// JWT d'IDENTITÉ (sub = userId) pour les routes authentifiées (AD-14).
export function signBffToken(userId: string, secret: string): string {
  assertSecret(secret);
  return jwt.sign({ sub: userId }, secret, { algorithm: "HS256", expiresIn: "60s" });
}

// JWT d'ORIGINE (sans sub) pour les routes pré-auth @BffOnly (login/register/session).
export function signBffOrigin(secret: string): string {
  assertSecret(secret);
  return jwt.sign({}, secret, { algorithm: "HS256", expiresIn: "60s" });
}
