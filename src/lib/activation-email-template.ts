const DEFAULT_PRODUCT_NAME = "Trezalink";
const DEFAULT_SUPPORT_EMAIL = "support@trezalink.com";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeBaseUrl(baseUrl?: string | null) {
  const fallback = "http://localhost:3000";
  const raw = (baseUrl || "").trim();
  if (!raw) return fallback;

  try {
    const url = new URL(raw);
    return `${url.origin}`;
  } catch {
    return fallback;
  }
}

export function buildActivationUrl(token: string, baseUrl?: string | null) {
  const root = normalizeBaseUrl(baseUrl);
  const url = new URL("/activate", root);
  url.searchParams.set("token", token);
  return url.toString();
}

export function buildActivationEmail(input: {
  businessName: string;
  activationUrl: string;
  productName?: string;
  supportEmail?: string;
}) {
  const productName = input.productName?.trim() || DEFAULT_PRODUCT_NAME;
  const supportEmail = input.supportEmail?.trim() || DEFAULT_SUPPORT_EMAIL;
  const safeBusinessName = escapeHtml(input.businessName || "Merchant");
  const safeProductName = escapeHtml(productName);
  const safeSupportEmail = escapeHtml(supportEmail);
  const safeActivationUrl = escapeHtml(input.activationUrl);

  const from = `${productName} <noreply@trezalink.com>`;
  const subject = `Verify your ${productName} account`;

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeProductName} account verification</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f6fb;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f6fb;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:24px 28px 8px 28px;">
                <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#2563eb;">${safeProductName} Security</p>
                <h1 style="margin:10px 0 0 0;font-size:26px;line-height:1.25;color:#0f172a;">Verify your ${safeProductName} account</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px 0 28px;">
                <p style="margin:0 0 12px 0;font-size:15px;line-height:1.6;color:#334155;">Hello <strong>${safeBusinessName}</strong>,</p>
                <p style="margin:0 0 14px 0;font-size:15px;line-height:1.6;color:#334155;">Please confirm your email address to activate your merchant account and continue using ${safeProductName} securely.</p>
                <p style="margin:0;font-size:15px;line-height:1.6;color:#334155;">For your security, this verification link is one-time use and expires automatically.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px 0 28px;">
                <a href="${safeActivationUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 20px;border-radius:10px;">Verify Account</a>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 28px 0 28px;">
                <p style="margin:0 0 8px 0;font-size:13px;line-height:1.6;color:#64748b;">If the button does not work, copy and paste this URL into your browser:</p>
                <p style="margin:0;font-size:12px;line-height:1.7;color:#1d4ed8;word-break:break-all;">${safeActivationUrl}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px 26px 28px;">
                <p style="margin:0 0 8px 0;font-size:12px;line-height:1.6;color:#94a3b8;">If you did not request this email, you can safely ignore it.</p>
                <p style="margin:0;font-size:12px;line-height:1.6;color:#94a3b8;">Need help? Contact us at <a href="mailto:${safeSupportEmail}" style="color:#2563eb;text-decoration:none;">${safeSupportEmail}</a>.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `Verify your ${productName} account`,
    "",
    `Hello ${input.businessName || "Merchant"},`,
    "",
    `Please verify your email to activate your ${productName} merchant account.`,
    "For security, this verification link is one-time use and expires automatically.",
    "",
    `Verify Account: ${input.activationUrl}`,
    "",
    "If you did not request this email, you can safely ignore it.",
    `Need help? Contact ${supportEmail}.`,
  ].join("\n");

  return {
    from,
    subject,
    html,
    text,
  };
}
