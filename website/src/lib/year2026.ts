/**
 * Launch switch for /2026 (OCEANS, 2026 year in review).
 *
 * src/data/year-2026.json → "noteApproved". While it is false:
 *   - Danny's note renders inside a frame marked DRAFT,
 *   - the page carries <meta name="robots" content="noindex, nofollow">,
 *   - astro.config.mjs leaves /2026 out of the sitemap.
 * Flip it to true only after Danny has rewritten or approved the note.
 */
import status from "../data/year-2026.json";

export const NOTE_APPROVED: boolean = status.noteApproved;

export function isYear2026Path(pathname: string): boolean {
  return /^\/2026\/?$/.test(pathname);
}
