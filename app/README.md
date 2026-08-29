# Application workspace

This directory contains the complete static TypeScript prototype. It provides
accessible search, record and provenance views plus the imperative
`search_government_knowledge`, `get_resource_record` and `show_provenance`
WebMCP registrations over an 80-record, same-origin, digest-bound catalogue.

Run `npm test` for research-pack, unit and browser validation. Run `npm run
serve`, then open `http://127.0.0.1:4173/` for manual use. Do not open an HTML
file directly: the startup watchdog will explain that modules and same-origin
data require HTTP. The page makes no runtime provider request and remains usable
when WebMCP is absent. The generated catalogue and evidence receipts must not be
edited by hand; update the reviewed inputs in `data/sources/` and run `npm run
catalogue:build`.
