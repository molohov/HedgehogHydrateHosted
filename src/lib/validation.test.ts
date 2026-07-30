import { describe, expect, it } from "vitest";
import {
  backgroundColorSchema,
  createUserSchema,
  loginSchema,
  ozSchema,
  timezoneSchema,
} from "@/lib/validation";

describe("validation schemas", () => {
  it("validates login credentials", () => {
    expect(loginSchema.safeParse({ username: "alice", password: "secret" }).success).toBe(
      true,
    );
    expect(loginSchema.safeParse({ username: "", password: "" }).success).toBe(false);
  });

  it("validates admin-created users", () => {
    expect(
      createUserSchema.safeParse({ username: "new_user", password: "long-enough" })
        .success,
    ).toBe(true);
    expect(
      createUserSchema.safeParse({ username: "bad name", password: "long-enough" })
        .success,
    ).toBe(false);
  });

  it("validates ounces, timezone, and colors", () => {
    expect(ozSchema.safeParse(12).success).toBe(true);
    expect(ozSchema.safeParse(0).success).toBe(false);
    expect(timezoneSchema.safeParse("America/Los_Angeles").success).toBe(true);
    expect(timezoneSchema.safeParse("Not/AZone").success).toBe(false);
    expect(backgroundColorSchema.safeParse("#F7F0E4").success).toBe(true);
    expect(backgroundColorSchema.safeParse("red").success).toBe(false);
  });
});
