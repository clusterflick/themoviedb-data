const path = require("node:path");
const fs = require("node:fs").promises;
const fg = require("fast-glob");
const { parseISO, format, isBefore, differenceInDays } = require("date-fns");
const { MovieDb } = require("moviedb-promise");
const fetchMovieData = require("../common/fetch-movie-data");
const { dailyCache } = require("../common/cache");

require("dotenv").config();

const moviedb = new MovieDb(process.env.MOVIEDB_API_KEY);

async function getEarliestDate() {
  const files = await fg("data/**/*.json");
  let earliestDate = new Date();
  for (const filePath of files) {
    const rawData = await fs.readFile(
      path.join(process.cwd(), filePath),
      "utf8",
    );
    const data = JSON.parse(rawData);
    const retrievedAt = parseISO(data.retrievedAt);
    if (isBefore(retrievedAt, earliestDate)) {
      earliestDate = retrievedAt;
    }
  }
  return earliestDate;
}

async function getMovieIds(earliestDate) {
  const start = format(earliestDate, "yyy-MM-dd");
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
  console.log("Scanning files to determine last retrieval date...");
  const earliestDate = await getEarliestDate();
  console.log(` - Found earliest date ${earliestDate}`);
  const updatePeriod = differenceInDays(new Date(), earliestDate);
  console.log(
    `Requesting updates from the last ${updatePeriod} day${updatePeriod === 1 ? "" : "s"}`,
  );
  if (updatePeriod > 14) {
    throw Error(`Distance too great, ${updatePeriod} days`);
  }
  const movieIds = await getMovieIds(earliestDate);
  console.log(`Getting latest data for ${movieIds.length} movies\n`);

  await fetchMovieData(movieIds);
}

main().catch(console.error);
