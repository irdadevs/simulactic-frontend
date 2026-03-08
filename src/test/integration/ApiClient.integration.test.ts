import { ApiError, apiDelete, apiGet, apiPost } from "../../infra/api/client";

describe("api client integration", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it("serializes query params (including arrays and dates) into request url", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const from = new Date("2026-03-08T00:00:00.000Z");
    await apiGet("/metrics", {
      query: {
        metricType: ["api", "use_case"],
        from,
        limit: 10,
      },
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/v1/metrics?");
    expect(url).toContain("metricType=api");
    expect(url).toContain("metricType=use_case");
    expect(url).toContain(`from=${encodeURIComponent(from.toISOString())}`);
    expect(url).toContain("limit=10");
    expect(init.method).toBe("GET");
    expect(init.credentials).toBe("include");
  });

  it("omits nullish query fields and keeps false/zero values", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    await apiGet("/metrics", {
      query: {
        nullable: null,
        undef: undefined,
        enabled: false,
        amount: 0,
      },
    });

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("enabled=false");
    expect(url).toContain("amount=0");
    expect(url).not.toContain("nullable=");
    expect(url).not.toContain("undef=");
  });

  it("throws ApiError with parsed json body on non-2xx", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ ok: false, error: "FORBIDDEN" }), {
        status: 403,
        headers: { "content-type": "application/json" },
      }),
    );

    await expect(apiPost("/users/login", { body: { email: "a", rawPassword: "b" } })).rejects.toMatchObject({
      name: "ApiError",
      status: 403,
      body: { ok: false, error: "FORBIDDEN" },
    });
  });

  it("returns undefined for 204 responses", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(apiDelete("/users/logout")).resolves.toBeUndefined();
  });

  it("returns plain text payload when response is not json", async () => {
    fetchMock.mockResolvedValue(
      new Response("OK", {
        status: 200,
        headers: { "content-type": "text/plain" },
      }),
    );

    await expect(apiGet<string>("/health")).resolves.toBe("OK");
  });

  it("wraps timeout aborts with a timeout message", async () => {
    fetchMock.mockRejectedValue(new DOMException("Aborted", "AbortError"));

    await expect(apiGet("/users", { timeoutMs: 10 })).rejects.toThrow(
      "Request timeout after 10ms: GET /api/v1/users",
    );
  });

  it("still exposes typed ApiError for caller guards", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: "conflict" }), {
        status: 409,
        headers: { "content-type": "application/json" },
      }),
    );

    try {
      await apiPost("/galaxies", { body: { name: "Alpha", systemCount: 3 } });
      fail("Expected ApiError");
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(ApiError);
    }
  });

  it("forwards external abort signal and rejects with timeout-formatted message", async () => {
    let capturedSignal: AbortSignal | null | undefined;
    fetchMock.mockImplementation((_url: string, init?: RequestInit) => {
      capturedSignal = init?.signal;
      return new Promise<Response>((_resolve, reject) => {
        capturedSignal?.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });
      });
    });

    const externalController = new AbortController();
    const promise = apiGet("/metrics", { signal: externalController.signal, timeoutMs: 5000 });

    externalController.abort();

    await expect(promise).rejects.toThrow("Request timeout after 5000ms: GET /api/v1/metrics");
  });
});
