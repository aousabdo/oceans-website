export const THEMES = ["operator", "institute", "mariner"] as const;
export type ThemeId = (typeof THEMES)[number];

export function resolveTheme(value: string | undefined): ThemeId {
  if (!value) return "operator";
  return (THEMES as readonly string[]).includes(value) ? (value as ThemeId) : "operator";
}

export const ACTIVE_THEME: ThemeId = resolveTheme(import.meta.env.PUBLIC_THEME);
