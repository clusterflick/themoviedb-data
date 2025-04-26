const getMovieIds = require("../common/get-movie-ids");
const fetchMovieData = require("../common/fetch-movie-data");

async function main() {
  const movieIds = await getMovieIds();
  await fetchMovieData(movieIds);
}

main().catch(console.error);
