/**
 * Launch switch for /2026 (OCEANS, 2026 year in review).
 *
 * src/data/year-2026.json → "noteStatus" decides what happens to Danny's note:
 *   "draft"    — placeholder words in a frame marked DRAFT; the page is noindex
 *                and left out of the sitemap. For review previews only.
 *   "held"     — no note on the page; the page is public. Use while waiting for
 *                Danny's own words.
 *   "approved" — Danny's words (src/data/year-2026.ts → note), no frame; public.
 * Only set "approved" after Danny has written or signed off on the note.
 */
import status from "../data/year-2026.json";

export type NoteStatus = "draft" | "held" | "approved";

export function notePolicy(s: NoteStatus) {
  return {
    showNote: s !== "held",
    draftFrame: s === "draft",
    noindex: s === "draft",
  };
}

const VALID: readonly NoteStatus[] = ["draft", "held", "approved"];
if (!VALID.includes(status.noteStatus as NoteStatus)) {
  throw new Error(`src/data/year-2026.json: noteStatus must be one of ${VALID.join(", ")}`);
}

export const NOTE_STATUS = status.noteStatus as NoteStatus;
export const NOTE = notePolicy(NOTE_STATUS);

export function isYear2026Path(pathname: string): boolean {
  return /^\/2026\/?$/.test(pathname);
}
