export type QueryPrimitive = string | number | boolean | Date | null | undefined;
export type QueryValue = QueryPrimitive | QueryPrimitive[];
export type QueryParams = Record<string, QueryValue>;

export type ApiListResponse<T> = {
  rows: T[];
  total: number;
};

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? `API request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = {
  query?: QueryParams;
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");
const API_PREFIX = "/api/v1";

const toQueryString = (query?: QueryParams): string => {
  if (!query) return "";

  const params = new URLSearchParams();
  for (const [key, rawValue] of Object.entries(query)) {
    if (rawValue == null) continue;

    const push = (value: QueryPrimitive) => {
      if (value == null) return;
      if (value instanceof Date) {
        params.append(key, value.toISOString());
      } else {
        params.append(key, String(value));
      }
    };

    if (Array.isArray(rawValue)) {
      rawValue.forEach((item) => push(item));
    } else {
      push(rawValue);
    }
  }

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
};

const buildUrl = (path: string, query?: QueryParams): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const base = `${API_BASE_URL}${API_PREFIX}${normalizedPath}`;
  return `${base}${toQueryString(query)}`;
};

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
};

const request = async <T>(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  options?: RequestOptions,
): Promise<T> => {
  const url = buildUrl(path, options?.query);
  const hasBody = options?.body !== undefined;
  const headers: HeadersInit = {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(options?.headers ?? {}),
  };

  const response = await fetch(url, {
    method,
    headers,
    credentials: "include",
    signal: options?.signal,
    body: hasBody ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorBody = await parseResponse<unknown>(response);
    throw new ApiError(response.status, errorBody);
  }

  return parseResponse<T>(response);
};

export const apiGet = <T>(path: string, options?: Omit<RequestOptions, "body">): Promise<T> =>
  request<T>("GET", path, options);

export const apiPost = <T>(path: string, options?: RequestOptions): Promise<T> =>
  request<T>("POST", path, options);

export const apiPatch = <T>(path: string, options?: RequestOptions): Promise<T> =>
  request<T>("PATCH", path, options);

export const apiPut = <T>(path: string, options?: RequestOptions): Promise<T> =>
  request<T>("PUT", path, options);

export const apiDelete = <T>(path: string, options?: RequestOptions): Promise<T> =>
  request<T>("DELETE", path, options);
