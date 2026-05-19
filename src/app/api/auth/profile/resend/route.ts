// src/app/api/auth/profile/resend/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from 'crypto';
import prisma from "@/lib/neon";

export async function POST(req: Request) {
    try {
        const { merchantId, email } = await req.json();

        if (!merchantId || !email) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const merchant = await prisma.merchant.findUnique({
            where: { id: merchantId }
        });

        if (!merchant) {
            return NextResponse.json(
                { error: "Merchant not found." },
                { status: 404 }
            );
        }

        if (merchant.emailVerified) {
            return NextResponse.json(
                { error: "Email is already verified." },
                { status: 400 }
            );
        }

        // Generate token baru agar token lama hangus (keamanan ekstra)
        const newActivationToken = crypto.randomBytes(32).toString('hex');

        await prisma.merchant.update({
            where: { id: merchantId },
            data: { activationToken: newActivationToken }
        });

        // Kirim Email Ulang
        const resend = new Resend(process.env.RESEND_API_KEY);
        const baseUrl = process.env.FRONTEND_URL;

        await resend.emails.send({
            from: "Kirupay <noreply@kirupay.com>",
            to: email,
            subject: "Action Required: Verify Your Kirupay Account",
            html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Activate your Kirupay Account</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #F4F5F7; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F4F5F7; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                      <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #F3F4F6;">
                          <h1 style="margin: 0; font-size: 28px; font-weight: 900; color: #11151D; font-style: italic; letter-spacing: -1px;">
                            <span style="color: #2563EB;">KIRU</span>PAY
                          </h1>
                          <p style="margin: 8px 0 0 0; font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">
                            Merchant Onboarding
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 40px;">
                          <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #11151D; font-weight: 800;">
                            Welcome to the network, ${merchant.businessName}.
                          </h2>
                          <p style="margin: 0 0 20px 0; font-size: 15px; color: #4B5563; line-height: 1.6;">
                            Thank you for registering. You are one step away from accessing your dashboard and accepting global crypto payments on the Solana network with zero friction.
                          </p>
                          <p style="margin: 0 0 35px 0; font-size: 15px; color: #4B5563; line-height: 1.6;">
                            To complete your security setup, please verify your email address by clicking the button below.
                          </p>
                          <div style="text-align: center;">
                            <a href="${baseUrl}/activate?token=${newActivationToken}" style="display: inline-block; padding: 16px 32px; background: #2563EB; background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%); color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(37,99,235,0.3);">
                              Verify Merchant Account
                            </a>
                          </div>
                          <div style="margin-top: 45px; padding-top: 24px; border-top: 1px dashed #E5E7EB;">
                            <p style="margin: 0 0 8px 0; font-size: 13px; color: #6B7280;">
                              <strong style="color: #11151D;">Security Notice:</strong> This link is uniquely tied to your registration and will expire in 24 hours. Do not share this email.
                            </p>
                            <p style="margin: 0; font-size: 13px; color: #6B7280;">
                              If you did not initiate this request, please ignore this email or contact <a href="mailto:security@kirupay.com" style="color: #2563EB; text-decoration: none;">security@kirupay.com</a> immediately.
                            </p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color: #0A0A0C; padding: 30px 40px; text-align: center;">
                          <p style="margin: 0; font-size: 12px; color: #6B7280;">
                            &copy; ${new Date().getFullYear()} Kirupay Global Payments.<br/>All rights reserved.
                          </p>
                          <p style="margin: 12px 0 0 0; font-size: 10px; color: #4B5563; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">
                            Built on Solana ⚡
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            `
        });

        return NextResponse.json(
            { message: "Verification email re-sent successfully." },
            { status: 200 }
        );

    } catch (error) {
        console.error("Resend email error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}