import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

describe("GitHub Pages deployment configuration", () => {
  test("uses the repository subpath as the Vite base", () => {
    const config = readFileSync("vite.config.ts", "utf8");

    expect(config).toContain('base: "/pocket-planetarium/"');
  });

  test("documents the GitHub Pages branch deployment path", () => {
    const readme = readFileSync("README.md", "utf8");

    expect(readme).toContain("gh-pages");
    expect(readme).toContain("npm test");
    expect(readme).toContain("npm run build");
  });
});
