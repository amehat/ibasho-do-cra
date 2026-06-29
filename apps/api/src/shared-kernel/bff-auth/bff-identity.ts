// Vérification PURE du JWT d'identité forgé par le BFF (AD-14).
// Le BFF n'émet QUE l'identité (userId) ; les rôles sont résolus côté IAM (story 1.2+).
import jwt from "jsonwebtoken";

export interface BffIdentity {
  userId: string;
}

export function verifyBffToken(token: string, secret: string): BffIdentity {
  const payload = jwt.verify(token, secret, { algorithms: ["HS256"] });
  if (typeof payload === "string" || typeof payload.sub !== "string") {
    throw new Error("JWT BFF invalide : sub (userId) manquant");
  }
  return { userId: payload.sub };
}
