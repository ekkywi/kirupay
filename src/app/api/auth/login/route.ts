import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import bcrypt from 'bcrypt';
import prisma from "@/lib/neon";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error : "Missing required fields" },
                { status: 400 }
            );
        }

        const merchant = await prisma.merchant.findUnique({
            where: { email: email }
        });
        
        if (!merchant) {
            return NextResponse.json(
                { error: "Invalid email or password" }, 
                { status: 401 }
            );
        }

        if (!merchant.emailVerified) {
            return NextResponse.json(
                { error: "Please verify your email before logging in." },
                { status: 403 }
            );
        }

        if (merchant.password === "WALLET_AUTH_NO_PASSWORD") {
            return NextResponse.json(
                { error: "Please complete your profile setup before using email login." },
                { status: 403 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, merchant.password);
        
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const token = await new SignJWT({
            merchantId: merchant.id,
            email: merchant.email,
        })
            .setProtectedHeader({ alg: "HS256"})
            .setIssuedAt()
            .setExpirationTime("24h")
            .sign(secret);
        
        const cookieStore = await cookies();
        cookieStore.set("auth-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24,
        });

        return NextResponse.json(
            { 
                message: "Login successful",
                merchant: {
                    id: merchant.id,
                    businessName: merchant.businessName,
                    email: merchant.email,
                }
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error during login:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
