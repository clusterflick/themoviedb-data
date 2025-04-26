const path = require("node:path");
const fs = require("node:fs").promises;

async function extractFromFiles(files, extractor) {
  const data = [];
  const batchSize = 500;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const batchData = await Promise.all(
      batch.map(async (filePath) => {
        const absolutePath = path.join(process.cwd(), filePath);
        const rawData = await fs.readFile(absolutePath, "utf8");
        return extractor(JSON.parse(rawData));
      }),
    );
    data.push(...batchData);
  }
  return data;
}

module.exports = extractFromFiles;
