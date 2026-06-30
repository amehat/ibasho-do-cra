// VO PasswordHash PUR (AD-2) : enveloppe opaque. Le hachage vit dans un adapter (jamais ici).
export class PasswordHash {
  private constructor(public readonly value: string) {}
  static fromHashed(hash: string): PasswordHash {
    if (!hash) throw new Error("PasswordHash vide");
    return new PasswordHash(hash);
  }
}
