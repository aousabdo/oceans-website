// Cloudflare Pages Function: POST /api/contact
// Validates a contact form submission, verifies Cloudflare Turnstile,
// and (if RESEND_API_KEY is set) emails the submission via Resend.
// Without RESEND_API_KEY the function still validates and returns 200 so the
// form gives feedback to the user; submissions appear in the Pages function logs.

interface Env {
  RESEND_API_KEY?: string;
  TURNSTILE_SECRET?: string;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}

interface ValidateResult {
  ok: boolean;
  errors?: Record<string, string>;
}

function validate(input: Record<string, string>): ValidateResult {
  const errors: Record<string, string> = {};
  if (!input.firstName?.trim()) errors.firstName = "Required";
  if (!input.lastName?.trim()) errors.lastName = "Required";
  if (!input.email?.trim() || !EMAIL.test(input.email)) errors.email = "Valid email required";
  if (!input.message?.trim() || input.message.trim().length < 5)
    errors.message = "Required (5+ characters)";
  return Object.keys(errors).length === 0 ? { ok: true } : { ok: false, errors };
}

async function verifyTurnstile(secret: string, token: string, ip?: string): Promise<boolean> {
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);
  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    const j = (await r.json()) as { success?: boolean };
    return Boolean(j?.success);
  } catch {
    return false;
  }
}

async function sendEmail(env: Env, p: Record<string, string>): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false;
  const to = env.CONTACT_TO ?? "info@oceansllc.com";
  const from = env.CONTACT_FROM ?? "OCEANS LLC <onboarding@resend.dev>";
  const subject = `[oceansllc.com] ${p.subject?.trim() || "New inquiry"} — ${p.firstName} ${p.lastName}`;
  const html = `
    <h2>${escapeHtml(subject)}</h2>
    <p><strong>From:</strong> ${escapeHtml(p.firstName)} ${escapeHtml(p.lastName)} &lt;${escapeHtml(p.email)}&gt;</p>
    ${p.phone ? `<p><strong>Phone:</strong> ${escapeHtml(p.phone)}</p>` : ""}
    ${p.organization ? `<p><strong>Organization:</strong> ${escapeHtml(p.organization)}</p>` : ""}
    <hr/>
    <pre style="font-family:inherit;white-space:pre-wrap">${escapeHtml(p.message)}</pre>
  `;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, reply_to: p.email, subject, html }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const fd = await request.formData();
  const data: Record<string, string> = {};
  for (const [k, v] of fd.entries()) {
    if (typeof v === "string") data[k] = v;
  }

  // Verify Turnstile if configured
  if (env.TURNSTILE_SECRET) {
    const token = data["cf-turnstile-response"] ?? "";
    if (!token) {
      return new Response(JSON.stringify({ error: "turnstile_required" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    const ok = await verifyTurnstile(
      env.TURNSTILE_SECRET,
      token,
      request.headers.get("CF-Connecting-IP") ?? undefined
    );
    if (!ok) {
      return new Response(JSON.stringify({ error: "turnstile_failed" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
  }

  // Validate
  const v = validate(data);
  if (!v.ok) {
    return new Response(JSON.stringify({ errors: v.errors }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  // Send (or log if Resend not configured)
  const sent = await sendEmail(env, data);
  if (!sent) {
    console.log("[contact] submission received but email not sent:", {
      from: `${data.firstName} ${data.lastName} <${data.email}>`,
      subject: data.subject,
      hasResendKey: Boolean(env.RESEND_API_KEY),
    });
  }

  return new Response(JSON.stringify({ ok: true, sent }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
