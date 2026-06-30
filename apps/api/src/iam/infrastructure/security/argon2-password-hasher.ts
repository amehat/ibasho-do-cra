import { Injectable } from "@nestjs/common";
import { hash, verify } from "@node-rs/argon2";
import type { PasswordHasher } from "../../domain/ports/password-hasher.port";

// argon2id (défaut @node-rs/argon2 ≈ reco OWASP). Binaires Rust pré-compilés (pas de node-gyp -> o2switch).
@Injectable()
export class Argon2PasswordHasher implements PasswordHasher {
  hash(plain: string): Promise<string> {
    return hash(plain);
  }
  async verify(hashed: string, plain: string): Promise<boolean> {
    try {
      return await verify(hashed, plain);
    } catch {
      return false;
    }
  }
}
