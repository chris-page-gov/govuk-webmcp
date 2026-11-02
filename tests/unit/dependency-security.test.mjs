import assert from "node:assert/strict";
import test from "node:test";
import uri from "fast-uri";

test("URI normalisation does not activate percent-encoded schemes", () => {
  for (const input of ["%6Aavascript:alert(1)", "%u006Aavascript:alert(1)"]) {
    assert.ok(uri.parse(input).error);
    assert.notEqual(uri.normalize(input), "javascript:alert(1)");
    assert.throws(() => uri.resolve("https://example.org/", input), /scheme is malformed/);
  }
  assert.equal(uri.equal("%68ttp://example.org/", "http://example.org/"), false);
});

test("ordinary HTTPS URI resolution remains available", () => {
  assert.equal(uri.resolve("https://example.org/a/", "../b"), "https://example.org/b");
  assert.equal(uri.parse("https://example.org/b").error, undefined);
});
