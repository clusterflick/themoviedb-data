const path = require("node:path");

function getDataPath(id) {
  const prefix = Math.ceil(parseInt(id, 10) / 1000);
  return path.join(process.cwd(), "data", `${prefix}`, `${id}.json`);
}

module.exports = getDataPath;
