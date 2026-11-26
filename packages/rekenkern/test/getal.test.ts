import { expect, it } from "vitest";
import { getal } from "../../../leidenwerkt/src/formulier.ts";

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

it("een komma of punt met precies 3 cijfers erachter scheidt duizendtallen", () => {
  expect(getal("40,000")).toBe(40000);
  expect(getal("40.000")).toBe(40000);
  expect(getal("1,234,567")).toBe(1234567);
  expect(getal("1,234.56")).toBe(1234.56);
  expect(getal("1.234,56")).toBe(1234.56);
  expect(getal("12,5")).toBe(12.5);
  expect(getal("1250,50")).toBe(1250.5);
  expect(getal("1,5")).toBe(1.5);
});

