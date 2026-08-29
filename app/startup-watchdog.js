(() => {
  "use strict";

  window.setTimeout(() => {
    if (document.documentElement.dataset.applicationState) return;

    const localFile = window.location.protocol === "file:";
    const status = document.querySelector("#status");
    const records = document.querySelector("#record-count");
    const bundle = document.querySelector("#bundle-digest");
    const runtime = document.querySelector("#tool-status");
    if (status) {
      status.textContent = localFile
        ? "Search unavailable: this application must be served over HTTP. From the repository, run npm run serve, then open http://127.0.0.1:4173/."
        : "Search unavailable: application startup did not complete. Reload the page or check that the complete built directory is being served.";
    }
    if (records) records.textContent = "Unavailable";
    if (bundle) bundle.textContent = "Startup failed";
    if (runtime) runtime.textContent = "Unavailable";
  }, 2000);
})();
