import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Names on /team, read the same way the page reads them (order field).
const teamDir = fileURLToPath(new URL("../../src/content/team/", import.meta.url));
const team = readdirSync(teamDir)
  .filter((f) => f.endsWith(".yml"))
  .map((f) => {
    const y = readFileSync(teamDir + f, "utf8");
    return { name: y.match(/^name: (.+)$/m)![1]!.trim(), order: Number(y.match(/^order: (\d+)$/m)![1]) };
  })
  .sort((a, b) => a.order - b.order)
  .map((m) => m.name);

test.describe("/2026 — OCEANS, 2026", () => {
  test("renders, is indexable, and shows no note while Danny's is held", async ({ page }) => {
    const res = await page.goto("/2026");
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText("OCEANS");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /^index/);
    await expect(page.locator(".note")).toHaveCount(0);
    const html = await page.content();
    expect(html).not.toContain("Placeholder words");
    expect(html).not.toContain("A note from Danny");
  });

  test("has the 45-second film, never autoplaying, with both encodes served", async ({ page, request }) => {
    await page.goto("/2026");
    const video = page.locator("#film video");
    await expect(video).toHaveAttribute("preload", "none");
    await expect(video).toHaveAttribute("poster", "/video/oceans-film-poster.webp");
    expect(await video.getAttribute("autoplay")).toBeNull();
    const srcs = await page.locator("#film video source").evaluateAll((els) => els.map((e) => e.getAttribute("src")));
    expect(srcs).toEqual(["/video/oceans-film-720p.mp4", "/video/oceans-film-1080p.mp4"]);
    for (const src of [...srcs, "/video/oceans-film-poster.webp"]) {
      const r = await request.get(src!, { headers: { Range: "bytes=0-1023" } });
      expect([200, 206]).toContain(r.status());
    }
    await expect(page.locator("[data-film-play]")).toBeVisible();
    await expect(page.locator("#film details li")).toHaveCount(8);
  });

  test("puts one light on the water per teammate, in roster order", async ({ page }) => {
    await page.goto("/2026");
    await expect(page.locator(".hc-names li")).toHaveText(team);
    await expect(page.locator(".hc-light")).toHaveCount(team.length);
  });

  test("is not linked from the nav", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('header a[href="/2026"], header a[href="/2026/"]')).toHaveCount(0);
  });

  for (const width of [320, 390]) {
    test(`has no horizontal scroll at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 740 });
      await page.goto("/2026");
      const { sw, cw } = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth,
        cw: document.documentElement.clientWidth,
      }));
      expect(sw).toBeLessThanOrEqual(cw);
    });
  }

  test("pause stops the card and replay restarts it", async ({ page }) => {
    await page.goto("/2026");
    await page.locator("#card").scrollIntoViewIfNeeded();
    const card = page.locator("[data-hc]");
    await expect(card).toHaveClass(/is-playing/);
    const pause = page.locator("[data-hc-pause]");
    await pause.click();
    await expect(pause).toHaveText("Play");
    await expect(card).toHaveClass(/is-paused/);
    await page.locator("[data-hc-replay]").click();
    await expect(pause).toHaveText("Pause");
    await expect(card).not.toHaveClass(/is-paused/);
  });
});

test.describe("/2026 with reduced motion", () => {
  test("shows the finished card, still, with no controls", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/2026");
    await page.locator("#card").scrollIntoViewIfNeeded();
    const label = page.locator(".hc-names li").first();
    await expect(label).toHaveCSS("opacity", "1");
    await expect(page.locator("[data-hc]")).not.toHaveClass(/is-pending/);
    await expect(page.locator("[data-hc-controls]")).toBeHidden();
    const animating = await page.locator(".hc-line").first().evaluate((el) => getComputedStyle(el).animationName);
    expect(animating).toBe("none");
  });
});

test.describe("/2026 without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("shows the finished card, and the film keeps its native controls", async ({ page }) => {
    await page.goto("/2026");
    await expect(page.locator("#film video")).toHaveAttribute("controls", "");
    await expect(page.locator("[data-film-play]")).toBeHidden();
    await expect(page.locator(".hc-names li").first()).toHaveCSS("opacity", "1");
    await expect(page.locator(".hc-greeting")).toHaveCSS("opacity", "1");
  });
});
