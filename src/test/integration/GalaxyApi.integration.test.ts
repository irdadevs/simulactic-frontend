import { galaxyApi } from "../../infra/api/galaxy.api";

describe("galaxyApi integration", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it("calls populate with pagination query params", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          galaxy: {
            id: "11111111-1111-4111-8111-111111111111",
            ownerId: "22222222-2222-4222-8222-222222222222",
            name: "Alpha",
            shape: "spherical",
            systemCount: 120,
            createdAt: "2026-03-08T00:00:00.000Z",
          },
          total: 120,
          limit: 40,
          offset: 0,
          systems: [],
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    await galaxyApi.populate("11111111-1111-4111-8111-111111111111", {
      limit: 40,
      offset: 80,
    });

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/v1/galaxies/11111111-1111-4111-8111-111111111111/populate?");
    expect(url).toContain("limit=40");
    expect(url).toContain("offset=80");
  });

  it("encodes galaxy id safely for populate path", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          galaxy: {
            id: "id/with space",
            ownerId: "22222222-2222-4222-8222-222222222222",
            name: "Alpha",
            shape: "spherical",
            systemCount: 1,
            createdAt: "2026-03-08T00:00:00.000Z",
          },
          total: 1,
          systems: [],
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    await galaxyApi.populate("id/with space");

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/v1/galaxies/id%2Fwith%20space/populate");
  });

  it("calls per-galaxy counts endpoint", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          systems: 120,
          stars: 228,
          planets: 380,
          moons: 756,
          asteroids: 388,
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    await galaxyApi.counts("11111111-1111-4111-8111-111111111111");

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/v1/galaxies/11111111-1111-4111-8111-111111111111/counts");
  });

  it("calls global counts endpoint", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          galaxies: 12,
          systems: 1200,
          stars: 2400,
          planets: 5000,
          moons: 9000,
          asteroids: 4100,
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    await galaxyApi.globalCounts();

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/api/v1/galaxies/counts/global");
  });

  it("handles zero global counts payload for empty datasets", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          galaxies: 0,
          systems: 0,
          stars: 0,
          planets: 0,
          moons: 0,
          asteroids: 0,
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    await expect(galaxyApi.globalCounts()).resolves.toEqual({
      galaxies: 0,
      systems: 0,
      stars: 0,
      planets: 0,
      moons: 0,
      asteroids: 0,
    });
  });
});
