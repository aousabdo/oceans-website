// Cloudflare Pages Function: POST /api/subscribe
// Newsletter signup endpoint. Currently logs + (if Resend is configured)
// sends a notification to the NEWSLETTER_TO env var so a human can add
// them to the list. When Danny picks a real ESP (Beehiiv / Mailchimp /
// Resend Audiences), this endpoint is the single place to wire it in.

interface Env {
  RESEND_API_KEY?: string;
  TURNSTILE_SECRET?: string;
  NEWSLETTER_TO?: string;
  NEWSLETTER_FROM?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}

async function sendNotification(env: Env, email: string, source: string): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false;
  // Recipient address comes only from the NEWSLETTER_TO Cloudflare Pages
  // env var — never hardcoded in source. If not configured, the
  // submission is dropped rather than leaking a default.
  const to = env.NEWSLETTER_TO;
  if (!to) return false;
  const from = env.NEWSLETTER_FROM ?? "OCEANS LLC <onboarding@resend.dev>";
  const subject = `[oceansllc.com] Newsletter signup — ${email}`;
  const html = `
    <h2>New Journal subscriber</h2>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Source:</strong> ${escapeHtml(source)}</p>
    <p style="color:#666;font-size:13px;">Add them to the Journal list when ready.</p>
  `;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let email = "";
  let source = "";

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const j = (await request.json()) as { email?: string; source?: string };
    email = j.email ?? "";
    source = j.source ?? "unknown";
  } else {
    const fd = await request.formData();
    email = String(fd.get("email") ?? "");
    source = String(fd.get("source") ?? "unknown");
  }
  email = email.trim().toLowerCase();

  if (!email || !EMAIL.test(email)) {
    return new Response(JSON.stringify({ error: "invalid_email" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const sent = await sendNotification(env, email, source);
  if (!sent) {
    console.log("[subscribe] signup received but notification not sent:", {
      email,
      source,
      hasResendKey: Boolean(env.RESEND_API_KEY),
    });
  }

  return new Response(JSON.stringify({ ok: true, sent }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
