const requestId = require("../common/request-id");
const estimateTimeRemaining = require("../common/estimate-time-remaining");

const displayEstimatedTime = (estimatedTime) => {
  if (!Number.isInteger(estimatedTime)) return "";
  if (estimatedTime === 0) return "(less than 1 minute left)";
  if (estimatedTime === 1) return "(1 minute left)";
  return `(${estimatedTime} minutes left)`;
};

async function fetchMovieData(movieIds) {
  let failedRequests = [];
  let sampleDurations = [];
  const batchSize = 100;

  for (let i = 0; i < movieIds.length; i += batchSize) {
    const start = Date.now();
    const batch = movieIds.slice(i, i + batchSize);
    const requests = [];
    for (const id of batch) {
      requests.push(requestId(id));
    }
    const results = await Promise.allSettled(requests);
    const end = Date.now();

    const duration = end - start;
    if (duration > 500) {
      sampleDurations = sampleDurations.slice(-9).concat(duration);
    }

    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(movieIds.length / batchSize);
    const remaining = totalBatches - batchNumber;
    let estimatedTime = estimateTimeRemaining(sampleDurations, remaining);
    console.log(
      `Batch ${batchNumber} of ${totalBatches} finished in ${duration} ms ${displayEstimatedTime(estimatedTime)}`,
    );

    const failed = results.filter(({ status }) => status === "rejected");
    if (failed.length > 0) {
      console.log(
        ` - ${failed.length} failed request${failed.length === 1 ? "" : "s"}`,
      );
    }
    failedRequests = failedRequests.concat(failed);
  }

  if (failedRequests.length > 0) {
    console.log(
      `Warning: ${failedRequests.length} failed request${failedRequests.length === 1 ? "" : "s"}`,
    );
    console.log(
      JSON.stringify(
        failedRequests.map(({ reason }) => ({
          id: reason.id,
          status: reason.error.status,
        })),
        null,
        4,
      ),
    );
  }
}

module.exports = fetchMovieData;
