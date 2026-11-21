import { describe, it, expect } from "vitest";
import { isYear2026Path, NOTE_APPROVED } from "../../src/lib/year2026";
import { robotsFor } from "../../src/lib/seo";

describe("robotsFor", () => {
  it("blocks indexing for drafts", () => {
    expect(robotsFor(true)).toBe("noindex, nofollow");
  });
  it("keeps the site default otherwise", () => {
    expect(robotsFor(false)).toBe("index, follow, max-image-preview:large");
  });
});

describe("isYear2026Path", () => {
  it("matches the page with or without a trailing slash", () => {
    expect(isYear2026Path("/2026")).toBe(true);
    expect(isYear2026Path("/2026/")).toBe(true);
  });
  it("does not match other paths", () => {
    expect(isYear2026Path("/blog/2026-x")).toBe(false);
    expect(isYear2026Path("/")).toBe(false);
    expect(isYear2026Path("/2026/og")).toBe(false);
  });
});

describe("NOTE_APPROVED", () => {
  it("ships as false until Danny signs off", () => {
    expect(NOTE_APPROVED).toBe(false);
  });
});
