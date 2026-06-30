import type { Session } from "../session";

export const SESSION_REPOSITORY = Symbol("SESSION_REPOSITORY");
export interface SessionRepository {
  save(session: Session): Promise<void>;
  findByToken(token: string): Promise<Session | null>;
}
