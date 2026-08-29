#!/usr/bin/env python3
"""Verify the portable research/prototype pack without network access."""

from __future__ import annotations

import csv
import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]


def canonical_bytes(value: Any) -> bytes:
    return json.dumps(
        value,
        ensure_ascii=False,
        separators=(",", ":"),
        sort_keys=True,
    ).encode("utf-8")


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def verify_catalogue_file() -> None:
    path = ROOT / "examples" / "catalogue.example.json"
    sidecar = ROOT / "examples" / "catalogue.example.json.sha256"
    expected = sidecar.read_text(encoding="utf-8").strip().split()[0]
    observed = sha256_bytes(path.read_bytes())
    if observed != expected:
        raise ValueError(f"catalogue raw-byte checksum mismatch: {observed} != {expected}")


def verify_example_digests() -> None:
    record_path = ROOT / "examples" / "govuk-discovery-okf-example.jsonld"
    receipt_path = ROOT / "examples" / "evidence-receipt-example.json"
    record = load_json(record_path)
    receipt = load_json(receipt_path)

    source_capture = {
        "observedAt": receipt["observedAt"],
        "publisher": receipt["source"]["publisher"],
        "title": record["dcterms:title"],
        "url": receipt["source"]["url"],
    }
    source_digest = sha256_bytes(canonical_bytes(source_capture))
    if source_digest != record["okfx:sourceDigest"]:
        raise ValueError("source digest mismatch in JSON-LD example")
    if source_digest != receipt["source"]["sourceDigest"]:
        raise ValueError("source digest mismatch in receipt example")

    digest_input = dict(record)
    for key in ("okfx:recordDigest", "okfx:bundleDigest", "okfx:evidenceReceipt"):
        digest_input.pop(key, None)
    record_digest = sha256_bytes(canonical_bytes(digest_input))
    if record_digest != record["okfx:recordDigest"]:
        raise ValueError("record digest mismatch in JSON-LD example")
    if record_digest != receipt["output"]["recordDigest"]:
        raise ValueError("record digest mismatch in receipt example")

    bundle_root = {
        "schema": "trusted-govuk-discovery.bundle-root.v1",
        "recordDigests": [record_digest],
    }
    bundle_digest = sha256_bytes(canonical_bytes(bundle_root))
    if bundle_digest != record["okfx:bundleDigest"]:
        raise ValueError("bundle digest mismatch in JSON-LD example")
    if bundle_digest != receipt["output"]["bundleDigest"]:
        raise ValueError("bundle digest mismatch in receipt example")


def verify_json_and_schemas() -> None:
    for path in sorted(ROOT.rglob("*.json")) + sorted(ROOT.rglob("*.jsonld")):
        load_json(path)

    try:
        import jsonschema  # type: ignore[import-not-found]
    except ImportError:
        print("NOTE: jsonschema is not installed; meta-schema checks were skipped.")
        return

    for path in sorted((ROOT / "schemas").glob("*.schema.json")):
        schema = load_json(path)
        jsonschema.validators.validator_for(schema).check_schema(schema)


def verify_report_source_references() -> None:
    report = (ROOT / "decision-grade-report.md").read_text(encoding="utf-8")
    with (ROOT / "source-register.csv").open(encoding="utf-8", newline="") as handle:
        source_ids = {row["id"] for row in csv.DictReader(handle)}
    referenced = {
        token
        for brackets in re.findall(r"\[([^\]]+)\]", report)
        for token in re.findall(r"\b(?:GH|STD|IP|[RWGAPSC])\d{2}\b", brackets)
    }
    missing = sorted(referenced - source_ids)
    if missing:
        raise ValueError(f"report references missing source IDs: {', '.join(missing)}")


def main() -> int:
    checks = [
        ("catalogue file checksum", verify_catalogue_file),
        ("example source/record/bundle digests", verify_example_digests),
        ("JSON and JSON Schema syntax", verify_json_and_schemas),
        ("report source-register references", verify_report_source_references),
    ]
    try:
        for label, check in checks:
            check()
            print(f"PASS: {label}")
    except Exception as exc:  # noqa: BLE001 — command-line verifier
        print(f"FAIL: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
