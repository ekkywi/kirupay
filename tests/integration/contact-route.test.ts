import { beforeEach, describe, expect, it, vi } from "vitest";

const sendMock = vi.fn();

vi.mock("resend", () => ({
  Resend: vi.fn(() => ({
    emails: {
      send: sendMock,
    },
  })),
}));

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RESEND_API_KEY = "test_key";
    process.env.SUPPORT_EMAIL = "support@trezalink.com";
  });

  it("returns 400 for invalid payload", async () => {
    const { POST } = await import("@/app/api/contact/route");
    const res = await POST(
      new Request("http://localhost/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "A", email: "invalid" }),
      }),
    );

    expect(res.status).toBe(400);
  });

  it("returns 201 when email delivery succeeds", async () => {
    sendMock.mockResolvedValue({ data: { id: "msg_123" }, error: null });
    const { POST } = await import("@/app/api/contact/route");

    const res = await POST(
      new Request("http://localhost/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Jane Merchant",
          email: "jane@example.com",
          company: "Acme",
          topic: "Technical support",
          message: "Need help validating webhook retries in our staging environment.",
        }),
      }),
    );

    expect(res.status).toBe(201);
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it("returns 503 when resend key is missing", async () => {
    delete process.env.RESEND_API_KEY;
    const { POST } = await import("@/app/api/contact/route");

    const res = await POST(
      new Request("http://localhost/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Jane Merchant",
          email: "jane@example.com",
          topic: "General inquiry",
          message: "I need guidance about onboarding timelines for our team.",
        }),
      }),
    );

    expect(res.status).toBe(503);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
