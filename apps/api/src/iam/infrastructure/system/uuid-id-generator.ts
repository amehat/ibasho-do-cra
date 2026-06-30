import { Injectable } from "@nestjs/common";
import { v7 as uuidv7 } from "uuid";
import type { IdGenerator } from "../../domain/ports/id-generator.port";

@Injectable()
export class UuidIdGenerator implements IdGenerator {
  newId(): string {
    return uuidv7();
  }
}
