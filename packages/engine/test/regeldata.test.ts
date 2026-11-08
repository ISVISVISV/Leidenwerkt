/**
 * Controles op de regeldata (scripts/bouw-regels.ts): alleen officiële
 * domeinen, en een sprong van meer dan 10% vraagt een notitie.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";

const wortel = new URL("../../../", import.meta.url).pathname;

it("weigert bronnen van niet-officiële domeinen en onverklaarde sprongen", () => {
  let uitvoer = "";
  try {
    execFileSync("npx", ["tsx", "scripts/bouw-regels.ts"], {
      cwd: wortel,
      env: { ...process.env, REGELS_MAP: join(wortel, "packages/engine/test/fixtures/regels-fout"), REGELS_UITVOER: join(mkdtempSync(join(tmpdir(), "lw-")), "r.json") },
      stdio: "pipe",
    });
  } catch (e: any) {
    uitvoer = String(e.stderr);
  }
  expect(uitvoer).toContain("www.rekensite.example is geen officieel domein");
  expect(uitvoer).toMatch(/test.bedrag: \S*b.yaml wijkt 20% af van \S*a.yaml/);
});
