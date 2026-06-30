import { describe, it, expect } from "vitest";
import { Email, InvalidEmailError } from "./email";

describe("Email", () => {
  it("normalise (trim + minuscule)", () => {
    expect(Email.create("  Jean.Dupont@Example.COM ").value).toBe("jean.dupont@example.com");
  });
  it("rejette un email mal formé", () => {
    expect(() => Email.create("pas-un-email")).toThrow(InvalidEmailError);
    expect(() => Email.create("a@b")).toThrow(InvalidEmailError);
  });
});
