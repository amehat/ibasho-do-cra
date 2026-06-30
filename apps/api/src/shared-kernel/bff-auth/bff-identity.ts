// Vérification du JWT forgé par le BFF (AD-14).
// - verifyBffToken : strict, exige sub (routes authentifiées).
// - verifyBffOrigin : prouve seulement l'origine BFF (signature), sub optionnel (routes pré-auth @BffOnly).
import jwt from "jsonwebtoken";

export interface BffIdentity {
  userId?: string;
}

export function verifyBffToken(token: string, secret: string): BffIdentity {
  const payload = jwt.verify(token, secret, { algorithms: ["HS256"], clockTolerance: 10 });
  if (typeof payload === "string" || typeof payload.sub !== "string") {
    throw new Error("JWT BFF invalide : sub (userId) manquant");
  }
  return { userId: payload.sub };
}

export function verifyBffOrigin(token: string, secret: string): BffIdentity {
  const payload = jwt.verify(token, secret, { algorithms: ["HS256"], clockTolerance: 10 });
  if (typeof payload === "string") throw new Error("JWT BFF invalide");
  return { userId: typeof payload.sub === "string" ? payload.sub : undefined };
}
