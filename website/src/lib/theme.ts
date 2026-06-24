export const THEMES = ["operator", "institute", "mariner"] as const;
export type ThemeId = (typeof THEMES)[number];

// Mariner is the canonical brand theme as of 2026-06-15 (Danny + Paul's
// pick). Operator and Institute live on as buildable alternates for any
// future iteration but a vanilla build with no env config ships Mariner.
export const DEFAULT_THEME: ThemeId = "mariner";

export function resolveTheme(value: string | undefined): ThemeId {
  if (!value) return DEFAULT_THEME;
  return (THEMES as readonly string[]).includes(value) ? (value as ThemeId) : DEFAULT_THEME;
}

export const ACTIVE_THEME: ThemeId = resolveTheme(import.meta.env.PUBLIC_THEME);
