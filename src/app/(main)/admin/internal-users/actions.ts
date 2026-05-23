"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

function toResultUrl(params: { success?: string; error?: string }) {
  const query = new URLSearchParams();
  if (params.success) query.set("success", params.success);
  if (params.error) query.set("error", params.error);
  const suffix = query.toString();
  return suffix ? `/admin/internal-users?${suffix}` : "/admin/internal-users";
}

export async function createInternalInviteAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();

  if (!email || !role) {
    redirect(toResultUrl({ error: "Email and role are required." }));
  }

  try {
    const headerStore = await headers();
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth-token")?.value;

    if (!authToken) {
      redirect(toResultUrl({ error: "Unauthorized." }));
    }

    const protocol = headerStore.get("x-forwarded-proto") ?? "http";
    const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "localhost:3000";
    const origin = `${protocol}://${host}`;

    const res = await fetch(`${origin}/api/internal-auth/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: `auth-token=${authToken}`,
      },
      body: JSON.stringify({ email, role }),
      cache: "no-store",
    });

    const payload = (await res.json().catch(() => null)) as {
      invite?: { inviteLink?: string };
      error?: { message?: string };
    } | null;

    if (!res.ok) {
      const errorMsg = payload?.error?.message || "Failed to create invite.";
      redirect(toResultUrl({ error: errorMsg }));
    }

    const inviteLink = payload?.invite?.inviteLink;
    if (!inviteLink) {
      redirect(toResultUrl({ success: "Invite created." }));
    }

    redirect(toResultUrl({ success: inviteLink }));
  } catch {
    redirect(toResultUrl({ error: "Failed to create invite." }));
  }
}
