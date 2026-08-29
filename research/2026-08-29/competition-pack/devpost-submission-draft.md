# 19. Draft Devpost submission text

## Project title

**Trusted GOV.UK Knowledge Discovery**

## One-line description

An independent read-only WebMCP prototype that helps people and agents discover public-sector knowledge together and inspect the authoritative source, access status, licence, provenance and limitations behind every result.

## The problem

Government information is widely published but fragmented across GOV.UK pages, dataset catalogues, API catalogues and publisher documentation. Ordinary search can return plausible links without a consistent way to tell who publishes a resource, whether an API is actually accessible, which licence is confirmed, when metadata was observed, or which relationships were inferred.

## What we built

The prototype packages a small, reviewed Open Knowledge Format corpus of GOV.UK content, public datasets and API records. A person can search and inspect it through an accessible web interface. On the same page, a compatible agent discovers three explicit WebMCP tools:

- `search_government_knowledge`
- `get_resource_record`
- `show_provenance`

The tools are page-scoped and read-only. They return structured records with authoritative human links, deterministic match reasons, access and licence status, field-level assertion labels, observation dates, digests, evidence receipts and known limitations. The same application functions drive the visible interface and tool results.

## Why WebMCP is a strong fit

Without WebMCP, an agent must infer the meaning of search controls and rendered cards or rely on screenshots. WebMCP lets the page publish a narrow, typed interaction contract while the person remains on the same inspectable page. This is material to the experience: the agent receives exact record identifiers and evidence fields rather than reconstructing them from presentation markup.

WebMCP itself does not guarantee trust. The trust contribution comes from combining authoritative links, explicit provenance, bounded tools, deterministic transformations, accessible manual equivalents and fail-closed handling of missing or conflicting metadata.

## What people and agents can do together

A person can ask a government-data or API question. The agent can search the page’s validated bundle, explain which fields matched and inspect an exact record. The person sees the same record, opens the publisher’s page and checks the evidence. Where access or licence is not established, both see that limitation. Catalogue inclusion is never presented as access authority.

## Implementation

The application is a static TypeScript site with no page-side account, credentials, analytics or provider calls. It validates a same-origin checksum-bound corpus before registering imperative WebMCP tools. Tool inputs use closed JSON Schemas and repeat validation in executable code. Outputs are treated as untrusted source-derived content. Every agent capability has a human-visible equivalent.

The corpus reuses disclosed, pre-existing OKF assets under their applicable licences. The competition repository documents the pre-challenge baseline and the post-start WebMCP extension with commit-bound evidence, manifests and checksums.

## Execution

- live public static URL;
- public open-source repository with a detected MIT licence;
- deterministic build and immutable competition release;
- keyboard and screen-reader-oriented UI;
- security, injection, stale/missing/conflict and parity tests;
- authoritative source links and downloadable JSON evidence.

## Potential impact

The pattern is useful wherever public knowledge must be discovered without turning an AI summary into an authority. It can help developers, analysts, researchers and citizens identify relevant official resources and understand the limits of catalogue metadata before investing effort or making claims.

## Creativity and ambition

The prototype treats the webpage as a shared evidence plane for people and agents. Instead of hiding provenance behind an AI response, it exposes the same record, source chain and uncertainty to both. It demonstrates how OKF publication patterns and WebMCP page tools can complement a deeper governed MCP gateway without confusing the two.

## Boundary

This is an independent experimental prototype. It is not a GOV.UK or UK Government service and is not endorsed by any public body. It does not provide access to restricted APIs, make official decisions, or claim comprehensive or current coverage. Follow the linked publisher page for authoritative information.
