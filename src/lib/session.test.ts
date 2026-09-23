import { beforeAll, describe, expect, it } from "vitest";
import {
  SESSION_MAX_AGE_SECONDS,
  SESSION_REFRESH_THRESHOLD_SECONDS,
  shouldRefreshSession,
  signSessionToken,
  verifySessionToken,
} from "./session";

beforeAll(() => {
  process.env.SESSION_SECRET = "test-secret-that-is-at-least-32-characters";
});

describe("session tokens", () => {
  it("round-trips a signed payload", async () => {
    const token = await signSessionToken({
      sub: "user-1",
      username: "hedgehog",
      role: "USER",
    });

    const verified = await verifySessionToken(token);

    expect(verified?.payload).toEqual({
      sub: "user-1",
      username: "hedgehog",
      role: "USER",
    });
  });

  it("rejects a tampered token", async () => {
    const token = await signSessionToken({
      sub: "user-1",
      username: "hedgehog",
      role: "USER",
    });

    expect(await verifySessionToken(`${token}x`)).toBeNull();
  });

  it("issues tokens that outlive the old two-week window", () => {
    expect(SESSION_MAX_AGE_SECONDS).toBeGreaterThan(60 * 60 * 24 * 14);
  });
});

describe("shouldRefreshSession", () => {
  const now = 1_000_000_000;

  it("leaves a freshly issued token alone", () => {
    expect(shouldRefreshSession(now - 60, now)).toBe(false);
  });

  it("refreshes once the token passes the threshold", () => {
    expect(
      shouldRefreshSession(now - SESSION_REFRESH_THRESHOLD_SECONDS - 1, now),
    ).toBe(true);
  });

  it("refreshes legacy tokens that carry no issued-at claim", () => {
    expect(shouldRefreshSession(0, now)).toBe(true);
  });
});
