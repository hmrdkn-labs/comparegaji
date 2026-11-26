import assert from "node:assert/strict";
import { parseSalary } from "../src/components/islands/parseSalary.js";

const ok = (input, value) => assert.deepEqual(parseSalary(input), { ok: true, value }, input);
const bad = (input, error) => assert.deepEqual(parseSalary(input), { ok: false, error }, input);

for (const s of ["15000000", "15.000.000", "15,000,000", "15jt", "15 jt", "Rp 15 juta", "15 juta"]) {
  ok(s, 15_000_000);
}
ok("1,5 jt", 1_500_000);
ok("1.5jt", 1_500_000);
ok("Rp15.000.000", 15_000_000);

bad("abc", "invalid");
bad("", "invalid");
bad("   ", "invalid");
bad("-5000000", "invalid");
bad("-15jt", "invalid");
bad("15jtx", "invalid");
bad("99999", "min");
bad("0,05jt", "min");

console.log("parseSalary: all cases passed");
