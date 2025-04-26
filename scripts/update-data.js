const fg = require("fast-glob");
const { format, isAfter, differenceInDays, subDays } = require("date-fns");
const { MovieDb } = require("moviedb-promise");
const fetchMovieData = require("../common/fetch-movie-data");
const { dailyCache } = require("../common/cache");
const extractFromFiles = require("../common/extract-from-files");

require("dotenv").config();

const moviedb = new MovieDb(process.env.MOVIEDB_API_KEY);

async function getLatestDate() {
  const files = await fg("data/**/*.json");
  const retrievedAtDates = await extractFromFiles(
    files,
    ({ retrievedAt }) => retrievedAt,
  );
  const latestRetrievedAtDate = retrievedAtDates.reduce(
    (latestDate, retrievedAt) =>
      isAfter(retrievedAt, latestDate) ? retrievedAt : latestDate,
    subDays(new Date(), 15),
  );

  // Go back one more day, just in case
  return subDays(latestRetrievedAtDate, 1);
}

async function getMovieIds(latestDate) {
  const start = format(latestDate, "yyy-MM-dd");
  const end = format(new Date(), "yyy-MM-dd");
  return dailyCache(`changed-movies-${start}-${end}`, async () => {
    const payload = { start_date: start, end_date: end };
    const firstPage = await moviedb.changedMovies(payload);
    let results = [].concat(firstPage.results);
    for (let page = 2; page <= firstPage.total_pages; page++) {
      const nextPage = await moviedb.changedMovies({ ...payload, page });
      results = results.concat(nextPage.results);
    }
    return results.map(({ id }) => id);
  });
}

async function main() {
  console.log("Scanning files to determine last retrieval date ...");
  const latestDate = await getLatestDate();
  console.log(` - Found latest request date ${latestDate}`);
  const updatePeriod = differenceInDays(new Date(), latestDate);
  console.log(
    `Requesting updates from the last ${updatePeriod} day${updatePeriod === 1 ? "" : "s"}`,
  );
  if (updatePeriod > 14) {
    throw Error(`Distance too great, ${updatePeriod} days`);
  }
  const movieIds = await getMovieIds(latestDate);
  console.log(`Getting latest data for ${movieIds.length} movies\n`);

  await fetchMovieData(movieIds);
}

main().catch(console.error);
