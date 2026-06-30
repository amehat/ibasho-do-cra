import { Injectable } from "@nestjs/common";
import { randomBytes } from "node:crypto";
import type { TokenGenerator } from "../../domain/ports/token-generator.port";

// Jeton de session opaque haute entropie (256 bits) — pas un UUID (non énumérable, sans timestamp).
@Injectable()
export class CryptoTokenGenerator implements TokenGenerator {
  newToken(): string {
    return randomBytes(32).toString("base64url");
  }
}
