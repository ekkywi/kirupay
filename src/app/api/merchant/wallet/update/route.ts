import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import nacl from "tweetnacl";
import bs58 from "bs58";
import prisma from "@/lib/neon";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("auth-token")?.value;

        if (!token) {
            return NextResponse.json(
                { error: "Unauthorized" }, 
                { status: 401 }
            );
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        const merchantId = payload.merchantId as string;

        const { action, publicKey, signature, message } = await req.json();

        if (action === "link") {
            if (!publicKey || !signature || !message) {
                return NextResponse.json(
                    { error: "Missing cryptographic proofs" }, 
                    { status: 400 }
                );
            }

            const messageUint8 = new TextEncoder().encode(message);
            const signatureUint8 = bs58.decode(signature);
            const publicKeyUint8 = bs58.decode(publicKey);

            const isValid = nacl.sign.detached.verify(messageUint8, signatureUint8, publicKeyUint8);

            if (!isValid) {
                return NextResponse.json(
                    { error: "Invalid signature. Authentication failed." }, 
                    { status: 401 }
                );
            }

            const existingIdentity = await prisma.merchantWalletIdentity.findUnique({
                where: { walletAddress: publicKey }
            });

            if (existingIdentity && existingIdentity.merchantId !== merchantId) {
                return NextResponse.json(
                    { error: "This wallet is already linked to another merchant account." }, 
                    { status: 409 }
                );
            }

            await prisma.$transaction(async (tx) => {
                await tx.merchantWalletIdentity.updateMany({
                    where: { merchantId, isActive: true },
                    data: { isActive: false, unlinkedAt: new Date() }
                });

                if (existingIdentity && existingIdentity.merchantId === merchantId) {
                    await tx.merchantWalletIdentity.update({
                        where: { walletAddress: publicKey },
                        data: { isActive: true, linkedAt: new Date(), unlinkedAt: null }
                    });
                } else {
                    await tx.merchantWalletIdentity.create({
                        data: {
                            merchantId,
                            walletAddress: publicKey,
                            isActive: true,
                            linkedAt: new Date(),
                            unlinkedAt: null,
                        }
                    });
                }

                await tx.merchant.update({
                    where: { id: merchantId },
                    data: { walletAddress: publicKey }
                });
            });

            return NextResponse.json(
                { message: "Wallet linked successfully", walletAddress: publicKey }, 
                { status: 200 }
            );
        }

        if (action === "unlink") {
            const placeholderWallet = `pending_${Date.now()}_unlinked`;

            const merchant = await prisma.merchant.findUnique({
                where: { id: merchantId },
                select: { walletAddress: true }
            });

            await prisma.$transaction(async (tx) => {
                if (merchant?.walletAddress && !merchant.walletAddress.startsWith("pending_")) {
                    await tx.merchantWalletIdentity.updateMany({
                        where: {
                            merchantId,
                            walletAddress: merchant.walletAddress,
                            isActive: true
                        },
                        data: { isActive: false, unlinkedAt: new Date() }
                    });
                }

                await tx.merchant.update({
                    where: { id: merchantId },
                    data: { walletAddress: placeholderWallet }
                });
            });

            return NextResponse.json(
                { message: "Wallet unlinked successfully", walletAddress: placeholderWallet }, 
                { status: 200 }
            );
        }

        return NextResponse.json(
            { error: "Invalid action" }, 
            { status: 400 }
        );

    } catch (error) {
        console.error("Wallet update error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" }, 
            { status: 500 }
        );
    }
}
