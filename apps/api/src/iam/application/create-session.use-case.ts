import { Inject, Injectable } from "@nestjs/common";
import { Session } from "../domain/session";
import { SESSION_REPOSITORY, type SessionRepository } from "../domain/ports/session-repository.port";
import { CLOCK, type Clock } from "../domain/ports/clock.port";
import { TOKEN_GENERATOR, type TokenGenerator } from "../domain/ports/token-generator.port";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 jours

@Injectable()
export class CreateSession {
  constructor(
    @Inject(SESSION_REPOSITORY) private readonly sessions: SessionRepository,
    @Inject(CLOCK) private readonly clock: Clock,
    @Inject(TOKEN_GENERATOR) private readonly tokens: TokenGenerator
  ) {}

  async execute(userId: string): Promise<{ token: string; expiresAt: Date }> {
    const session = Session.start(this.tokens.newToken(), userId, this.clock.now(), SESSION_TTL_MS);
    await this.sessions.save(session);
    return { token: session.token, expiresAt: session.expiresAt };
  }
}
