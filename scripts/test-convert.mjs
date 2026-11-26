import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { convertAnnual } from "../src/utils/convert.js";

const fx = JSON.parse(readFileSync(new URL("../src/data/fx.json", import.meta.url), "utf8"));
const sources = readFileSync(new URL("../src/data/sources.ts", import.meta.url), "utf8");

// Germany middle, copied independently from the ledger source text.
const block = sources.slice(sources.indexOf('country: "Germany"'));
const median = Number(/middle: \{ median: (\d+), n: \d+ \}/.exec(block)[1]);
const currency = /currency: "(\w+)"/.exec(block)[1];

const expected = (median / 12) * (fx.rates.IDR / fx.rates[currency]);
const actual = convertAnnual(median, currency, "IDR", "monthly", fx.rates);
assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} != ${expected}`);
assert.equal(median, 69609);
assert.ok(Math.abs(convertAnnual(1200, "IDR", "IDR", "monthly", fx.rates) - 100) < 1e-9);
assert.equal(convertAnnual(1200, "USD", "USD", "annual", fx.rates), 1200);
assert.throws(() => convertAnnual(1, "XXX", "IDR", "annual", fx.rates), /no rate for XXX/);
console.log(`convert: Germany middle ${median} ${currency}/yr -> Rp ${Math.round(actual)}/month at ${fx.rates.IDR} (${fx.date}), all cases passed`);
