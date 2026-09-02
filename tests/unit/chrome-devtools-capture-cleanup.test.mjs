import assert from "node:assert/strict";
import test from "node:test";

import {
  completeChromeDevtoolsCaptureCleanup,
} from "../../scripts/lib/chrome-devtools-capture-cleanup.mjs";

async function runCapture(main, cleanupSteps) {
  let primaryFailed = false;
  try {
    return await main();
  } catch (error) {
    primaryFailed = true;
    throw error;
  } finally {
    await completeChromeDevtoolsCaptureCleanup({ primaryFailed, cleanupSteps });
  }
}

test("a stop failure is propagated after a successful capture and later cleanup still runs", async () => {
  const stopFailure = new Error("Injected Chrome DevTools stop failure.");
  const calls = [];

  await assert.rejects(
    runCapture(
      async () => "captured",
      [
        async () => {
          calls.push("stop");
          throw stopFailure;
        },
        async () => calls.push("server"),
      ],
    ),
    (error) => error === stopFailure,
  );
  assert.deepEqual(calls, ["stop", "server"]);
});

test("a primary capture failure is preserved when stopping Chrome DevTools also fails", async () => {
  const primaryFailure = new Error("Injected capture failure.");
  const stopFailure = new Error("Injected Chrome DevTools stop failure.");
  const calls = [];

  await assert.rejects(
    runCapture(
      async () => {
        throw primaryFailure;
      },
      [
        async () => {
          calls.push("stop");
          throw stopFailure;
        },
        async () => calls.push("server"),
      ],
    ),
    (error) => error === primaryFailure,
  );
  assert.deepEqual(calls, ["stop", "server"]);
});

test("successful capture and cleanup preserve the capture result", async () => {
  const calls = [];
  const result = await runCapture(
    async () => "captured",
    [async () => calls.push("stop")],
  );

  assert.equal(result, "captured");
  assert.deepEqual(calls, ["stop"]);
});
