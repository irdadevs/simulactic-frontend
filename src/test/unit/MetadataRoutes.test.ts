import robots from "../../app/robots";
import sitemap from "../../app/sitemap";

describe("metadata routes", () => {
  it("exposes a production-safe robots policy", () => {
    const result = robots();

    expect(result.sitemap).toContain("/sitemap.xml");
    expect(result.rules).toEqual(
      expect.objectContaining({
        userAgent: "*",
      }),
    );
  });

  it("includes public static pages in the sitemap", () => {
    const result = sitemap();

    expect(result.map((entry) => entry.url)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/simulactic\.app$/),
        expect.stringMatching(/\/login$/),
        expect.stringMatching(/\/privacy-policy$/),
      ]),
    );
  });
});
