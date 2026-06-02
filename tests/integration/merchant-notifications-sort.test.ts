import { describe, expect, it } from "vitest";
import { sortNotificationsByRecency, type MerchantNotification } from "@/hooks/api/merchant/useNotifications";

function makeNotification(input: Partial<MerchantNotification> & Pick<MerchantNotification, "id" | "createdAt">): MerchantNotification {
  return {
    id: input.id,
    createdAt: input.createdAt,
    type: input.type ?? "PAYMENT_SUCCESS",
    source: input.source ?? "PAYMENT",
    severity: input.severity ?? "INFO",
    title: input.title ?? "title",
    message: input.message ?? "message",
    metadata: input.metadata ?? null,
    readAt: input.readAt ?? null,
  };
}

describe("sortNotificationsByRecency", () => {
  it("sorts by createdAt desc regardless of severity", () => {
    const items: MerchantNotification[] = [
      makeNotification({ id: "a", createdAt: "2026-05-29T09:00:00.000Z", severity: "ERROR" }),
      makeNotification({ id: "b", createdAt: "2026-05-29T12:00:00.000Z", severity: "INFO" }),
      makeNotification({ id: "c", createdAt: "2026-05-29T10:00:00.000Z", severity: "WARNING" }),
    ];

    const result = sortNotificationsByRecency(items);
    expect(result.map((item) => item.id)).toEqual(["b", "c", "a"]);
  });

  it("uses id desc as tie-breaker when createdAt is identical", () => {
    const items: MerchantNotification[] = [
      makeNotification({ id: "n1", createdAt: "2026-05-29T12:00:00.000Z" }),
      makeNotification({ id: "n3", createdAt: "2026-05-29T12:00:00.000Z" }),
      makeNotification({ id: "n2", createdAt: "2026-05-29T12:00:00.000Z" }),
    ];

    const result = sortNotificationsByRecency(items);
    expect(result.map((item) => item.id)).toEqual(["n3", "n2", "n1"]);
  });

  it("keeps global recency order after pagination-like merge", () => {
    const firstPage: MerchantNotification[] = [
      makeNotification({ id: "n5", createdAt: "2026-05-29T12:05:00.000Z" }),
      makeNotification({ id: "n4", createdAt: "2026-05-29T12:04:00.000Z" }),
    ];
    const olderPage: MerchantNotification[] = [
      makeNotification({ id: "n3", createdAt: "2026-05-29T12:03:00.000Z" }),
      makeNotification({ id: "n2", createdAt: "2026-05-29T12:02:00.000Z" }),
      makeNotification({ id: "n1", createdAt: "2026-05-29T12:01:00.000Z" }),
    ];

    const result = sortNotificationsByRecency([...firstPage, ...olderPage]);
    expect(result.map((item) => item.id)).toEqual(["n5", "n4", "n3", "n2", "n1"]);
  });
});
