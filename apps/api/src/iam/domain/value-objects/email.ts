// VO Email PUR (AD-2) : normalise et valide. Aucune dépendance externe.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private constructor(public readonly value: string) {}

  static create(raw: string): Email {
    const normalized = raw.trim().toLowerCase();
    if (normalized.length > 254 || !EMAIL_RE.test(normalized)) {
      throw new InvalidEmailError(raw);
    }
    return new Email(normalized);
  }
}

export class InvalidEmailError extends Error {
  constructor(raw: string) {
    super(`Email invalide: ${raw}`);
    this.name = "InvalidEmailError";
  }
}
