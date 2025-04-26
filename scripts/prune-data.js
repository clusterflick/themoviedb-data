const fs = require("node:fs").promises;
const path = require("node:path");
const fg = require("fast-glob");
const getMovieIds = require("../common/get-movie-ids");
const getDataPath = require("../common/get-data-path");

async function getLocalMovieIds() {
  const files = await fg("data/**/*.json");
  const ids = [];
  for (const filePath of files) {
    const rawData = await fs.readFile(
      path.join(process.cwd(), filePath),
      "utf8",
    );
    const data = JSON.parse(rawData);
    ids.push(data.id);
  }
  return ids;
}

async function deleteFilesFor(ids) {
  for (const id of ids) {
    const dataPath = getDataPath(id);
    console.log(` - Deleting ${dataPath}`);
    await fs.unlink(dataPath);
  }
}

async function main() {
  console.log("Getting movie IDs from service ...");
  const movieIds = await getMovieIds();
  console.log(` - ${movieIds.length} movie IDs`);
  console.log("Getting movie IDs from local data ...");
  const localMovieIds = await getLocalMovieIds();
  console.log(` - ${localMovieIds.length} movie IDs`);
  console.log("Calculating deleted movies from missing IDs ...");
  const deletedIds = localMovieIds.filter((item) => !movieIds.includes(item));
  console.log(` - ${deletedIds.length} deleted movies found`);
  await deleteFilesFor(deletedIds);
}

main().catch(console.error);
