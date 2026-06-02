import { parseApiErrorResponse, toDiagnosticMessage } from "@/lib/api-error-client";

export async function throwApiResponseError(res: Response, fallbackMessage: string): Promise<never> {
  const apiError = await parseApiErrorResponse(res);
  const message = toDiagnosticMessage(apiError);

  throw new Error(message || fallbackMessage);
}
