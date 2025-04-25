const zlib = require("node:zlib");
const axios = require("axios");
const { format } = require("date-fns");
const { dailyCache } = require("../common/cache");

const getExportUrlFor = (name) => {
  const dateString = format(new Date(), "MM_dd_yyyy");
  return `http://files.tmdb.org/p/exports/${name}_${dateString}.json.gz`;
};

const getExportIds = async (url) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data);
  const decompressed = zlib.gunzipSync(buffer);
  const lines = decompressed.toString().trim().split("\n");
  return lines.map((line) => JSON.parse(line).id);
};

async function getMovieIds() {
  const movieIdsRequest = dailyCache("movie-ids", async () =>
    getExportIds(getExportUrlFor("movie_ids")),
  );
  const adultMovieIdsRequest = dailyCache("adult-movie-ids", async () =>
    getExportIds(getExportUrlFor("adult_movie_ids")),
  );
  const [movieIds, adultMovieIds] = await Promise.all([
    movieIdsRequest,
    adultMovieIdsRequest,
  ]);
  return [...movieIds, ...adultMovieIds];
}

module.exports = getMovieIds;
