import prisma from "@/lib/neon";

export const NOTIFICATION_PREF_DEFAULTS = {
  paymentSuccess: true,
  paymentFailed: true,
  paymentPendingTooLong: true,
  webhookDeliveryFailed: true,
  webhookRecovered: true,
} as const;

const DEDUP_WINDOW_MS = 2 * 60 * 1000;

type NotificationType =
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "PAYMENT_PENDING_TOO_LONG"
  | "WEBHOOK_DELIVERY_FAILED"
  | "WEBHOOK_RECOVERED";

type NotificationSource = "PAYMENT" | "WEBHOOK";
type NotificationSeverity = "INFO" | "WARNING" | "ERROR";

type PreferenceKey = keyof typeof NOTIFICATION_PREF_DEFAULTS;

const TYPE_TO_PREF: Record<NotificationType, PreferenceKey> = {
  PAYMENT_SUCCESS: "paymentSuccess",
  PAYMENT_FAILED: "paymentFailed",
  PAYMENT_PENDING_TOO_LONG: "paymentPendingTooLong",
  WEBHOOK_DELIVERY_FAILED: "webhookDeliveryFailed",
  WEBHOOK_RECOVERED: "webhookRecovered",
};

export async function getOrCreateNotificationPreferences(businessId: string) {
  return prisma.merchantNotificationPreference.upsert({
    where: { businessId },
    create: {
      businessId,
      ...NOTIFICATION_PREF_DEFAULTS,
    },
    update: {},
  });
}

export async function isNotificationTypeEnabled(businessId: string, type: NotificationType) {
  const preference = await getOrCreateNotificationPreferences(businessId);
  return preference[TYPE_TO_PREF[type]];
}

export async function createMerchantNotification(input: {
  businessId: string;
  type: NotificationType;
  source: NotificationSource;
  severity: NotificationSeverity;
  title: string;
  message: string;
  sourceRefId?: string | null;
  metadata?: Record<string, unknown>;
  dedupMode?: "window" | "once";
}) {
  const enabled = await isNotificationTypeEnabled(input.businessId, input.type);

  if (!enabled) {
    return { created: false as const, reason: "disabled" as const };
  }

  if (input.sourceRefId) {
    const dedupSince = new Date(Date.now() - DEDUP_WINDOW_MS);
    const createdAtFilter = input.dedupMode === "once"
      ? undefined
      : {
          gte: dedupSince,
        };

    const existing = await prisma.merchantNotification.findFirst({
      where: {
        businessId: input.businessId,
        type: input.type,
        sourceRefId: input.sourceRefId,
        createdAt: createdAtFilter,
      },
      select: { id: true },
    });

    if (existing) {
      return { created: false as const, reason: "deduplicated" as const, id: existing.id };
    }
  }

  const created = await prisma.merchantNotification.create({
    data: {
      businessId: input.businessId,
      type: input.type,
      source: input.source,
      severity: input.severity,
      title: input.title,
      message: input.message,
      sourceRefId: input.sourceRefId ?? null,
      metadata: input.metadata,
    },
  });

  return { created: true as const, id: created.id };
}

export function mapSeverityRank(severity: NotificationSeverity) {
  if (severity === "ERROR") return 3;
  if (severity === "WARNING") return 2;
  return 1;
}
