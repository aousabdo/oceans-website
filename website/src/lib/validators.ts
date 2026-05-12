const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ValidateResult {
  ok: boolean;
  errors?: Record<string, string>;
}

export function validateContact(input: Record<string, unknown>): ValidateResult {
  const errors: Record<string, string> = {};
  const firstName = String(input.firstName ?? "").trim();
  const lastName = String(input.lastName ?? "").trim();
  const email = String(input.email ?? "").trim();
  const message = String(input.message ?? "").trim();
  if (!firstName) errors.firstName = "Required";
  if (!lastName) errors.lastName = "Required";
  if (!email || !EMAIL.test(email)) errors.email = "Valid email required";
  if (!message || message.length < 5) errors.message = "Required (5+ characters)";
  return Object.keys(errors).length === 0 ? { ok: true } : { ok: false, errors };
}
