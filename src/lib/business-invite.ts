import crypto from "crypto";

export function generateBusinessInviteCode() {
  const raw = crypto.randomBytes(12).toString("hex").toUpperCase();
  return `BIZ-${raw.slice(0, 6)}-${raw.slice(6, 12)}-${raw.slice(12, 18)}`;
}

export function hashBusinessInviteCode(code: string) {
  return crypto.createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}

export function inviteCodeHint(code: string) {
  const normalized = code.trim().toUpperCase();
  return normalized.slice(-6);
}
