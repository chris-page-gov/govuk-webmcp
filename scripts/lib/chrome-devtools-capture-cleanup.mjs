export async function completeChromeDevtoolsCaptureCleanup({
  primaryFailed,
  cleanupSteps,
}) {
  if (typeof primaryFailed !== "boolean") {
    throw new TypeError("Chrome DevTools capture primary-failure state must be boolean.");
  }
  if (!Array.isArray(cleanupSteps) || cleanupSteps.some((step) => typeof step !== "function")) {
    throw new TypeError("Chrome DevTools capture cleanup steps must be functions.");
  }

  const failures = [];
  for (const cleanup of cleanupSteps) {
    try {
      await cleanup();
    } catch (error) {
      failures.push(error);
    }
  }

  if (primaryFailed || failures.length === 0) return;
  if (failures.length === 1) throw failures[0];
  throw new AggregateError(failures, "Chrome DevTools capture cleanup failed.");
}
