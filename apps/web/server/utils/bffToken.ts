import jwt from "jsonwebtoken";

// Le BFF forge un JWT court portant l'IDENTITÉ SEULE (userId) vers l'API (AD-14).
// Les rôles ne transitent jamais par le BFF : ils sont résolus côté IAM.
export function signBffToken(userId: string, secret: string): string {
  return jwt.sign({ sub: userId }, secret, { algorithm: "HS256", expiresIn: "60s" });
}
