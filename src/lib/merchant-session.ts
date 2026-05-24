import { SignJWT } from "jose";
import { cookies } from "next/headers";

export async function setMerchantSessionToken(input: {
  actorId: string;
  email: string;
  activeBusinessId: string | null;
}) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new SignJWT({
    actorType: "merchant",
    actorId: input.actorId,
    email: input.email,
    activeBusinessId: input.activeBusinessId,
  })
    .setProtectedHeader({ alg: "HS256" })
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
}
