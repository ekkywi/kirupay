// src/app/(main)/admin/merchants/actions/merchant.ts
"use server";

import prisma from "@/lib/neon";
import { revalidatePath } from "next/cache";
import { requireInternalUser } from "@/lib/auth-service";

export async function toggleMerchantStatus(merchantId: string, currentStatus: boolean) {
  try {
    await requireInternalUser({ roles: ["SUPERADMIN", "SUPPORT"] });

    const merchant = await prisma.merchant.update({
      where: { id: merchantId },
      data: { isActive: !currentStatus },
    });

    revalidatePath("/admin/merchants");
    
    return { success: true, businessName: merchant.businessName }; 
  } catch (error) {
    console.error("Failed to toggle merchant status:", error);
    return { success: false, error: "Database connection failed or merchant not found." };
  }
}
