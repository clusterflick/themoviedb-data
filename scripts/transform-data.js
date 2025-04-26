const fs = require("node:fs").promises;
const path = require("node:path");
const fg = require("fast-glob");

async function transform() {
  const files = await fg("data/**/*.json");
  console.log(`- Transforming ${files.length} files`);
  for (const filePath of files) {
    try {
      const absolutePath = path.join(process.cwd(), filePath);
      const rawData = await fs.readFile(absolutePath, "utf8");
      const data = JSON.parse(rawData);
      delete data.parameters;
      await fs.writeFile(absolutePath, JSON.stringify(data));
    } catch (e) {
      console.log(`ERROR: Failed to transform ${filePath}`);
      throw e;
    }
  }
}

async function main() {
  console.log("Running transform ...");
  await transform();
}

main().catch(console.error);
