import { expect, it } from "vitest";
import { getal } from "../../../app/src/formulier.ts";

it("leest Nederlandse en internationale getallen", () => {
  expect(getal("1.200")).toBe(1200);
  expect(getal("1.250,50")).toBe(1250.5);
  expect(getal("15,00")).toBe(15);
  expect(getal("15.50")).toBe(15.5);
  expect(getal("€ 2.000")).toBe(2000);
  expect(getal("1250")).toBe(1250);
  expect(getal("")).toBeUndefined();
  expect(getal("abc")).toBeNaN();
});
