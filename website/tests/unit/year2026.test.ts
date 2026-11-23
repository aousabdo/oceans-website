import { describe, it, expect } from "vitest";
import { isYear2026Path, notePolicy, NOTE_STATUS } from "../../src/lib/year2026";
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

describe("notePolicy", () => {
  it("draft: shows the placeholder in a DRAFT frame and keeps the page out of search", () => {
    expect(notePolicy("draft")).toEqual({ showNote: true, draftFrame: true, noindex: true });
  });
  it("held: no note at all, page is public", () => {
    expect(notePolicy("held")).toEqual({ showNote: false, draftFrame: false, noindex: false });
  });
  it("approved: Danny's words, no frame, page is public", () => {
    expect(notePolicy("approved")).toEqual({ showNote: true, draftFrame: false, noindex: false });
  });
});

describe("NOTE_STATUS", () => {
  it("ships as held: live without a note until Danny sends his words", () => {
    expect(NOTE_STATUS).toBe("held");
  });
});
