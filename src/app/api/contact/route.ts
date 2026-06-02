import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { createRequestId } from "@/lib/api-errors";

const payloadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(320),
  company: z.string().trim().max(120).optional(),
  topic: z.string().trim().min(2).max(80),
  message: z.string().trim().min(10).max(3000),
});

const DEFAULT_SUPPORT_EMAIL = "support@trezalink.com";

export async function POST(req: Request) {
  const requestId = createRequestId();

  try {
    const json = await req.json();
    const parsed = payloadSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          code: "CONTACT_VALIDATION_FAILED",
          message: "Invalid contact request payload.",
          requestId,
        },
        { status: 400 },
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          code: "EMAIL_DELIVERY_NOT_CONFIGURED",
          message: "Support channel is temporarily unavailable. Please try again shortly.",
          requestId,
        },
        { status: 503 },
      );
    }

    const supportEmail = process.env.SUPPORT_EMAIL || DEFAULT_SUPPORT_EMAIL;
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { name, email, company, topic, message } = parsed.data;

    const subject = `[Contact] ${topic} - ${name}`;
    const text = [
      `Contact request from Trezalink site`,
      ``,
      `Name: ${name}`,
      `Email: ${email}`,
      `Company: ${company || "-"}`,
      `Topic: ${topic}`,
      ``,
      `Message:`,
      message,
    ].join("\n");

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;max-width:620px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 16px 0">New contact request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company || "-"}</p>
        <p><strong>Topic:</strong> ${topic}</p>
        <hr style="margin:18px 0;border:none;border-top:1px solid #e2e8f0" />
        <p style="white-space:pre-wrap">${message}</p>
      </div>
    `;

    const result = await resend.emails.send({
      from: "Trezalink Contact <noreply@trezalink.com>",
      to: supportEmail,
      replyTo: email,
      subject,
      text,
      html,
    });

    if (result.error || !result.data?.id) {
      console.error("Contact email delivery failed", {
        requestId,
        supportEmail,
        topic,
        resendError: result.error,
      });

      return NextResponse.json(
        {
          code: "EMAIL_DELIVERY_FAILED",
          message: "Unable to deliver your message right now. Please try again shortly.",
          requestId,
        },
        { status: 502 },
      );
    }

    console.info("Contact email sent", {
      requestId,
      supportEmail,
      resendMessageId: result.data.id,
    });

    return NextResponse.json({ message: "Message sent successfully.", requestId }, { status: 201 });
  } catch (error) {
    console.error("Failed to handle contact request", { requestId, error });
    return NextResponse.json(
      {
        code: "INTERNAL_SERVER_ERROR",
        message: "Unable to process your request right now.",
        requestId,
      },
      { status: 500 },
    );
  }
}
