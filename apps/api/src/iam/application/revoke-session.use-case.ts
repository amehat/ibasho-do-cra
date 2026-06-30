import { Inject, Injectable } from "@nestjs/common";
import { SESSION_REPOSITORY, type SessionRepository } from "../domain/ports/session-repository.port";
import { CLOCK, type Clock } from "../domain/ports/clock.port";

@Injectable()
export class RevokeSession {
  constructor(
    @Inject(SESSION_REPOSITORY) private readonly sessions: SessionRepository,
    @Inject(CLOCK) private readonly clock: Clock
  ) {}

  async execute(token: string): Promise<void> {
    const session = await this.sessions.findByToken(token);
    if (!session) return;
    session.revoke(this.clock.now());
    await this.sessions.save(session);
  }
}
