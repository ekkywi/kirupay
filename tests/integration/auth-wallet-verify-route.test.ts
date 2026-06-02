import { beforeEach, describe, expect, it, vi } from "vitest";

const verifySignatureMock = vi.fn();
const setMerchantSessionTokenMock = vi.fn();

const prismaMock = {
  merchantPrivateWalletIdentity: {
    findUnique: vi.fn(),
  },
  businessMembership: {
    findFirst: vi.fn(),
  },
  merchant: {
    update: vi.fn(),
  },
  $transaction: vi.fn(),
};

vi.mock("tweetnacl", () => ({
  sign: {
    detached: {
      verify: verifySignatureMock,
    },
  },
}));

vi.mock("@/lib/merchant-session", () => ({
  setMerchantSessionToken: setMerchantSessionTokenMock,
}));

vi.mock("@/lib/neon", () => ({
  default: prismaMock,
}));

describe("POST /api/auth/wallet/verify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when signature is invalid", async () => {
    verifySignatureMock.mockReturnValue(false);
    const { POST } = await import("@/app/api/auth/wallet/verify/route");

    const res = await POST(
      new Request("http://localhost/api/auth/wallet/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: "11111111111111111111111111111111",
          signature: "11111111111111111111111111111111",
          message: "authenticate",
        }),
      }),
    );

    const json = (await res.json()) as { error: { code: string } };
    expect(res.status).toBe(401);
    expect(json.error.code).toBe("AUTH_WALLET_SIGNATURE_INVALID");
  });

  it("authenticates existing merchant without touching business settlement wallet", async () => {
    verifySignatureMock.mockReturnValue(true);
    prismaMock.merchantPrivateWalletIdentity.findUnique.mockResolvedValue({
      id: "identity_1",
      walletAddress: "wallet_1",
      isActive: true,
      merchant: {
        id: "m_1",
        email: "merchant@test.com",
        activeBusinessId: "biz_1",
        isActive: true,
      },
    });

    const { POST } = await import("@/app/api/auth/wallet/verify/route");
    const res = await POST(
      new Request("http://localhost/api/auth/wallet/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: "11111111111111111111111111111111",
          signature: "11111111111111111111111111111111",
          message: "authenticate",
        }),
      }),
    );

    expect(res.status).toBe(200);
    expect(setMerchantSessionTokenMock).toHaveBeenCalledWith({
      actorId: "m_1",
      email: "merchant@test.com",
      activeBusinessId: "biz_1",
    });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("creates new merchant and private wallet identity without auto-provisioning business", async () => {
    verifySignatureMock.mockReturnValue(true);
    prismaMock.merchantPrivateWalletIdentity.findUnique.mockResolvedValue(null);

    const tx = {
      merchant: {
        create: vi.fn().mockResolvedValue({ id: "m_new", email: "new@wallet.auth" }),
      },
      merchantPrivateWalletIdentity: {
        create: vi.fn(),
        update: vi.fn(),
      },
      businessWalletIdentity: {
        create: vi.fn(),
      },
    };

    prismaMock.$transaction.mockImplementation(async (callback: (arg: typeof tx) => Promise<unknown>) => callback(tx));

    const { POST } = await import("@/app/api/auth/wallet/verify/route");
    const res = await POST(
      new Request("http://localhost/api/auth/wallet/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: "11111111111111111111111111111111",
          signature: "11111111111111111111111111111111",
          message: "authenticate",
        }),
      }),
    );

    expect(res.status).toBe(200);
    expect(tx.businessWalletIdentity.create).not.toHaveBeenCalled();
    expect(tx.merchantPrivateWalletIdentity.create).toHaveBeenCalled();
    expect(setMerchantSessionTokenMock).toHaveBeenCalledWith({
      actorId: "m_new",
      email: "new@wallet.auth",
      activeBusinessId: null,
    });
  });

  it("relinks inactive identity by creating new merchant and updating private wallet identity", async () => {
    verifySignatureMock.mockReturnValue(true);
    prismaMock.merchantPrivateWalletIdentity.findUnique.mockResolvedValue({
      id: "identity_inactive",
      walletAddress: "wallet_legacy",
      isActive: false,
      merchant: {
        id: "m_old",
        email: "old@wallet.auth",
        activeBusinessId: null,
        isActive: true,
      },
    });

    const tx = {
      merchant: {
        create: vi.fn().mockResolvedValue({ id: "m_relinked", email: "relinked@wallet.auth" }),
      },
      merchantPrivateWalletIdentity: {
        create: vi.fn(),
        update: vi.fn(),
      },
      businessWalletIdentity: {
        create: vi.fn(),
      },
    };

    prismaMock.$transaction.mockImplementation(async (callback: (arg: typeof tx) => Promise<unknown>) => callback(tx));

    const { POST } = await import("@/app/api/auth/wallet/verify/route");
    const res = await POST(
      new Request("http://localhost/api/auth/wallet/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: "11111111111111111111111111111111",
          signature: "11111111111111111111111111111111",
          message: "authenticate",
        }),
      }),
    );

    expect(res.status).toBe(200);
    expect(tx.merchantPrivateWalletIdentity.update).toHaveBeenCalled();
    expect(tx.merchantPrivateWalletIdentity.create).not.toHaveBeenCalled();
    expect(tx.businessWalletIdentity.create).not.toHaveBeenCalled();
    expect(setMerchantSessionTokenMock).toHaveBeenCalledWith({
      actorId: "m_relinked",
      email: "relinked@wallet.auth",
      activeBusinessId: null,
    });
  });
});
