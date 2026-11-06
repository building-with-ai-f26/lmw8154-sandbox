// Runs every sample thread in samples/ through Homeward, in order, and prints
// what it flagged so you can compare against samples/ANSWER_KEY.md.
// Uses a separate test data file, so your real saved claims are never touched.
// This calls the real AI and costs real money (about $0.20 for all six on Claude Opus 5.5).
//
// Run it with: npm run test:samples
const fs = require("node:fs");
const path = require("node:path");

process.env.HOMEWARD_DATA_FILE = path.join(__dirname, "..", "data", "test-claims.json");
const { analyzeThread, emptyStore, saveStore, publicState, MODEL, DATA_FILE } = require("../server.js");

const SAMPLES = path.join(__dirname, "..", "samples");

async function main() {
  const files = fs.readdirSync(SAMPLES).filter((f) => /^\d+.*\.txt$/.test(f)).sort();
  const store = emptyStore();
  console.log(`Model: ${MODEL}`);
  console.log(`Test data file: ${path.relative(process.cwd(), DATA_FILE)}\n`);

  for (const file of files) {
    const run = await analyzeThread(fs.readFileSync(path.join(SAMPLES, file), "utf8"), store);
    saveStore(store);
    const cost = run.cost == null ? "cost not reported" : `$${run.cost.toFixed(4)}`;
    console.log(`== ${file}: ${run.newClaimIds.length} claims, ${run.newConflictIds.length} conflicts, ${cost}`);

    const state = publicState(store);
    for (const k of state.conflicts.filter((c) => run.newConflictIds.includes(c.id))) {
      console.log(`   CONFLICT [${k.kind}] ${k.topic}: ${k.summary}`);
      for (const side of [k.earlier, k.later]) {
        console.log(`      ${side.date}  ${side.party} (${side.id}): ${side.statement}`);
      }
    }
    for (const q of store.questions.filter((q) => q.thread === run.thread)) {
      console.log(`   QUESTION (ask ${q.ask}): ${q.question}`);
    }
    console.log("");
  }

  console.log(`Total: ${store.claims.length} claims, ${store.conflicts.length} conflicts, $${store.totalCost.toFixed(4)}`);
  console.log(`All claims are saved in ${path.relative(process.cwd(), DATA_FILE)}`);
}

main().catch((err) => {
  console.error("\nSample run failed:", err.message);
  process.exit(1);
});
