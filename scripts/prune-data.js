const fs = require("node:fs").promises;
const fg = require("fast-glob");
const getMovieIds = require("../common/get-movie-ids");
const getDataPath = require("../common/get-data-path");
const extractFromFiles = require("../common/extract-from-files");

async function getLocalMovieIds() {
  const files = await fg("data/**/*.json");
  return await extractFromFiles(files, ({ id }) => id);
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
