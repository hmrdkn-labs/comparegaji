// Writes src/data/fx.json from Frankfurter (USD base, all rates).
// On any failure: warn, keep the committed file, exit 0.
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const URL_ = "https://api.frankfurter.app/latest?from=USD";
const OUT = fileURLToPath(new URL("../src/data/fx.json", import.meta.url));

try {
  const response = await fetch(URL_, { redirect: "follow", signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const body = await response.json();
  if (body.base !== "USD" || !/^\d{4}-\d{2}-\d{2}$/.test(body.date) || !(body.rates?.IDR > 0)) {
    throw new Error("unexpected response shape");
  }
  const snapshot = {
    base: "USD",
    date: body.date,
    provider: "central-bank reference rates",
    providerUrl: "https://frankfurter.dev/",
    rates: { USD: 1, ...body.rates },
  };
  await writeFile(OUT, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`fx-snapshot: ${body.date} IDR ${body.rates.IDR}`);
} catch (error) {
  let kept = "no committed file";
  try {
    kept = `keeping committed snapshot ${JSON.parse(await readFile(OUT, "utf8")).date}`;
  } catch {}
  console.warn(`fx-snapshot: fetch failed (${error.message}); ${kept}`);
}
