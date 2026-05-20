import type { ApiErrorCode } from "@/lib/api-errors";

export type ClientApiError = {
  code: ApiErrorCode | "UNKNOWN_ERROR";
  message: string;
  requestId?: string;
  retryable?: boolean;
  docsUrl?: string;
  status?: number;
};

export async function parseApiErrorResponse(res: Response): Promise<ClientApiError> {
  try {
    const json = (await res.json()) as Record<string, unknown>;

    const rawError = json.error;
    const payloadError = typeof rawError === "object" && rawError !== null ? (rawError as Record<string, unknown>) : undefined;
    const fallbackMessage = typeof json.message === "string"
      ? json.message
      : typeof rawError === "string"
        ? rawError
        : "Unexpected error";

    return {
      code: (typeof payloadError?.code === "string" ? payloadError.code : "UNKNOWN_ERROR") as ApiErrorCode | "UNKNOWN_ERROR",
      message: typeof payloadError?.message === "string" ? payloadError.message : fallbackMessage,
      requestId: typeof payloadError?.requestId === "string" ? payloadError.requestId : undefined,
      retryable: typeof payloadError?.retryable === "boolean" ? payloadError.retryable : undefined,
      docsUrl: typeof payloadError?.docsUrl === "string" ? payloadError.docsUrl : undefined,
      status: res.status,
    };
  } catch {
    return {
      code: "UNKNOWN_ERROR",
      message: `Request failed with HTTP ${res.status}`,
      status: res.status,
    };
  }
}

export function toDiagnosticMessage(error: ClientApiError): string {
  const requestPart = error.requestId ? ` (requestId: ${error.requestId})` : "";
  return `${error.message}${requestPart}`;
}
