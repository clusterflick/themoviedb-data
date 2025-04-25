const fs = require("node:fs");
const path = require("node:path");
const fg = require("fast-glob");
const getMovieIds = require("../common/get-movie-ids");
const getDataPath = require("../common/get-data-path");

async function getLocalMovieIds() {
  const files = await fg("data/**/*.json");
  return files.map((filePath) => {
    const data = require(path.join(process.cwd(), filePath));
    return data.id;
  });
}

async function deleteFilesFor(ids) {
  for (const id of ids) {
    try {
      const dataPath = getDataPath(id);
      console.log(`Deleting ${dataPath}`);
      fs.unlinkSync(dataPath);
    } catch (err) {
      console.error(`Error deleting file: ${err}`);
    }
  }
}

async function main() {
  const movieIds = await getMovieIds();
  const localMovieIds = await getLocalMovieIds();
  const deletedIds = localMovieIds.filter((item) => !movieIds.includes(item));
  deleteFilesFor(deletedIds);
}

main().catch(console.error);
