const fs = require("node:fs");
const path = require("node:path");
const { format } = require("date-fns");

function getCachePath(filename) {
  return path.join(process.cwd(), "cache", filename);
}

function getPathDaily(filename) {
  const suffix = format(new Date(), "yyyy-MM-dd");
  return getCachePath(`${filename}-${suffix}`);
}

const setupCacheDirectory = async (directoryPath) => {
  if (
    !fs.existsSync(directoryPath) ||
    !fs.statSync(directoryPath).isDirectory()
  ) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
};

function checkCache(filename, getPath) {
  return fs.existsSync(getPath(filename));
}

function readCache(filename, getPath) {
  const readPath = getPath(filename);
  setupCacheDirectory(path.dirname(readPath));
  const data = fs.readFileSync(readPath, "utf8");
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
}

function writeCache(filename, value, getPath) {
  const writePath = getPath(filename);
  setupCacheDirectory(path.dirname(writePath));
  let data;
  try {
    data = JSON.stringify(value);
  } catch {
    data = value;
  }
  fs.writeFileSync(writePath, data);
}

async function cache(key, retrieve, getPath = getCachePath) {
  let data;
  if (checkCache(key, getPath)) {
    data = readCache(key, getPath);
  } else {
    data = await retrieve();
    writeCache(key, data, getPath);
  }
  return data;
}

function dailyCache(key, retrieve) {
  return cache(key, retrieve, getPathDaily);
}

function readDailyCache(key) {
  if (checkCache(key, getPathDaily)) {
    return readCache(key, getPathDaily);
  }
}

module.exports = {
  getCachePath,
  cache,
  dailyCache,
  readDailyCache,
  readCache,
};
