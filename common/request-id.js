const { MovieDb } = require("moviedb-promise");
const { cache } = require("./cache");
const getDataPath = require("./get-data-path");

require("dotenv").config();

const moviedb = new MovieDb(process.env.MOVIEDB_API_KEY);

const parameters = {
  append_to_response: [
    "alternative_titles",
    "credits",
    "external_ids",
    "images",
    "keywords",
    "release_dates",
    "videos",
  ].join(","),
};

function requestId(id) {
  return cache(
    `${id}`,
    async () => {
      const retrievedAt = new Date().toISOString();
      try {
        const response = await moviedb.movieInfo({ id, ...parameters });
        return { id, retrievedAt, response };
      } catch (error) {
        throw { id, retrievedAt, error };
      }
    },
    getDataPath,
  );
}

module.exports = requestId;
