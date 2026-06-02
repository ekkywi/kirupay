import { throwApiResponseError } from "@/lib/client-api-error";

export async function throwAuthResponseError(res: Response, fallbackMessage: string): Promise<never> {
  return throwApiResponseError(res, fallbackMessage);
}
