// Agrégat Session PUR (AD-2). Jeton opaque, révocable (support AD-11).
export class Session {
  constructor(
    public readonly token: string,
    public readonly userId: string,
    public readonly createdAt: Date,
    public readonly expiresAt: Date,
    public revokedAt: Date | null = null
  ) {}

  static start(token: string, userId: string, now: Date, ttlMs: number): Session {
    return new Session(token, userId, now, new Date(now.getTime() + ttlMs), null);
  }

  isValid(now: Date): boolean {
    return this.revokedAt === null && this.expiresAt.getTime() > now.getTime();
  }

  revoke(now: Date): void {
    if (this.revokedAt === null) this.revokedAt = now;
  }
}
