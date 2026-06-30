import { Inject, Injectable } from "@nestjs/common";
import { SESSION_REPOSITORY, type SessionRepository } from "../domain/ports/session-repository.port";
import { CLOCK, type Clock } from "../domain/ports/clock.port";
import { InvalidSessionError } from "./errors";

@Injectable()
export class ResolveSession {
  constructor(
    @Inject(SESSION_REPOSITORY) private readonly sessions: SessionRepository,
    @Inject(CLOCK) private readonly clock: Clock
  ) {}

  async execute(token: string): Promise<{ userId: string }> {
    const session = await this.sessions.findByToken(token);
    if (!session || !session.isValid(this.clock.now())) throw new InvalidSessionError();
    return { userId: session.userId };
  }
}
