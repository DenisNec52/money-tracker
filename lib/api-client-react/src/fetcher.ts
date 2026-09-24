// Orval mutator (includeHttpResponseReturnType: false): resolves with the parsed body only.
// Non-2xx responses throw instead of resolving, so React Query routes them to `error`.

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Picked up by Orval as the TError type of every generated hook. */
export type ErrorType<_E> = ApiError;

async function parseBody(res: Response): Promise<unknown> {
  if (res.status === 204) return undefined;
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const customFetch = async <T>(url: string, options: RequestInit): Promise<T> => {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await parseBody(res);

  if (!res.ok) {
    const body = data as { error?: string; details?: unknown } | undefined;
    throw new ApiError(res.status, body?.error ?? `Errore HTTP ${res.status}`, body?.details);
  }

  return data as T;
};
