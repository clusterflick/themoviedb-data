function estimateTimeRemaining(samples, remainingRounds) {
  // Don't estimate without at least 10 samples
  if (samples.length !== 10) return null;

  const sum = samples.reduce((total, value) => total + value, 0);
  const averageTime = Math.round(sum / samples.length);
  return Math.round((averageTime * remainingRounds) / 1000 / 60);
}

module.exports = estimateTimeRemaining;
