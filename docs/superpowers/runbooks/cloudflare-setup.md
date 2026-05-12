# Cloudflare deployment setup — runbook

One-time setup to deploy this site (and the three theme previews) to Cloudflare Pages. ~30 min by a human with Cloudflare + GitHub access.

## Prereqs

- A Cloudflare account (free tier is fine).
- This repo pushed to GitHub.
- The `oceansllc.com` domain accessible (DNS migration from Wix is §9 — defer until you're ready to flip).

## 1. Push the repo to GitHub

```bash
cd /Users/aousabdo/work/Oceans
# Create a new repo on github.com (web UI), then:
git remote add origin git@github.com:<your-org-or-user>/oceans-website.git
git push -u origin main
git push origin ref/sonnet-4.6-mockup  # archived prior mockup
```

## 2. Create a Cloudflare Pages project

- Cloudflare dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
- Select your GitHub repo. **Project name:** `oceans-website`
- **Build settings:**
  - Framework preset: **Astro**
  - Build command: `cd website && npm ci && PUBLIC_THEME=operator npm run build`
  - Build output directory: `website/dist`
- Save & deploy. First build takes ~2 min.

## 3. Create the three theme branches (so each gets its own preview URL)

```bash
cd /Users/aousabdo/work/Oceans
git checkout -b theme/operator main && git push -u origin theme/operator
git checkout -b theme/institute main && git push -u origin theme/institute
git checkout -b theme/mariner main && git push -u origin theme/mariner
git checkout main
```

In Cloudflare Pages → **oceans-website** → **Settings** → **Builds & deployments** → **Preview deployments** → enable for all branches.

The GitHub Actions deploy workflow (`.github/workflows/deploy.yml`) selects the right `PUBLIC_THEME` per branch automatically.

## 4. Create GitHub Actions secrets

Cloudflare API token: **My Profile → API Tokens → Create Token → Cloudflare Pages: Edit**. Copy.
Account ID: visible on the right sidebar of any Cloudflare dashboard page.

In GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Push any branch → GitHub Actions runs CI and deploys.

## 5. Three preview URLs Danny opens

After the deploys finish, the URLs look like:

- `https://theme-operator.oceans-website.pages.dev`
- `https://theme-institute.oceans-website.pages.dev`
- `https://theme-mariner.oceans-website.pages.dev`
- `https://oceans-website.pages.dev` (main — currently builds Operator as default)

Send all three to Danny along with a note: "Pick one — we'll launch with the one you pick."

## 6. After Danny picks

Say he picks `<chosen>`. Two steps:

1. Update `.github/workflows/deploy.yml` so the `main` branch fallback builds `<chosen>` instead of `operator`. (Already the case if he picks operator.)
2. Merge `theme/<chosen>` back into `main` if any theme-specific tweaks have landed on that branch since the divergence:
   ```bash
   git checkout main
   git merge theme/<chosen>
   git push origin main
   ```
3. Optionally archive the non-chosen branches:
   ```bash
   git branch -m theme/operator  archive/theme-operator
   git branch -m theme/institute archive/theme-institute
   git branch -m theme/mariner   archive/theme-mariner
   # Push the renames if you want them visible upstream
   ```

## 7. Custom domain (launch day only)

- Cloudflare Pages → **oceans-website** → **Custom domains** → add `oceansllc.com` and `www.oceansllc.com`.
- Cloudflare guides through the DNS changes at the registrar (or in Cloudflare itself if it's the DNS host).
- Email DNS (SPF/DKIM/DMARC) updated to authorize Resend for transactional sends — only needed when the contact + apply forms backend lands (M11/M12 in the plan).

## 8. Cloudflare Web Analytics

- Cloudflare → **Analytics** → **Web Analytics** → **Add site** → `oceansllc.com`
- Copy the beacon token.
- Open `website/src/layouts/BaseLayout.astro` and append before `</head>` (NOT included yet — drop in when ready):
  ```html
  <script defer src="https://static.cloudflareinsights.com/beacon.min.js"
    data-cf-beacon='{"token": "YOUR_TOKEN"}'></script>
  ```

## 9. DNS cutover from Wix

Run only after final content review + Danny has approved.

1. Export Wix content as backup.
2. In Cloudflare Pages, ensure custom domains `oceansllc.com` and `www.oceansllc.com` are active and resolving to the new site.
3. At the DNS host (the registrar or Cloudflare DNS) change the records to point at Cloudflare Pages — Cloudflare's UI walks through this.
4. Wait 5–30 min for DNS to propagate. Verify in a private window.
5. Keep Wix available for ~30 min after cutover for emergency rollback.

## Verification

```bash
# After step 5, all three should return 200 and the right theme:
for theme in operator institute mariner; do
  curl -s "https://theme-${theme}.oceans-website.pages.dev/" | grep -o "data-theme=\"${theme}\""
done
```

Expected: three lines, each echoing `data-theme="<name>"`.
