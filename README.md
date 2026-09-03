# Evidence answer — government knowledge for your personal AI

**An experimental WebMCP application exploring how the AI a person chooses could discover government information while keeping the evidence visible to the person.**

> **Evidence before answer.**

AI is becoming another way people find and understand public information.

But there is an important architectural question:

**Could authoritative websites expose bounded, inspectable evidence to the AI a person already uses, without each site operating its own chatbot?**

Evidence answer explores that possibility.

It uses **WebMCP** to expose bounded, structured tools from a government-information webpage to compatible personal AI agents.

It uses **Open Knowledge Format (OKF)** to organise government knowledge together with its source, provenance, status and limitations.

And it gives the person an **Evidence answer** showing the same underlying evidence, so an AI's response does not have to be taken on trust.

This is an independent experimental prototype, not a GOV.UK service.

[Try the public Evidence answer](https://chris-page-gov.github.io/govuk-webmcp/) ·
[Read the technical implementation and audit trail](TECHNICAL_README.md)

## The idea

Imagine asking your personal AI:

> Find the government information about Tax-Free Childcare and show me what evidence supports it.

Instead of the AI searching the visual page, guessing which links matter or relying only on information already in its model, a WebMCP-enabled page can expose an explicit set of tools.

The AI can:

1. search the published government-knowledge collection;
2. retrieve an exact resource record;
3. inspect where that record came from;
4. examine the evidence behind the prototype's worked claim;
5. compare evidence foundations; and
6. ask the page to present the evidence for the person.

The page defines and validates the tool contracts and execution. The AI host decides whether and how to call them.

The person can inspect the corresponding information in the normal webpage.

```text
Person
  │
  │ asks a question
  ▼
Personal AI
  │
  │ WebMCP tool call
  ▼
Government-information webpage
  │
  ├── search
  ├── exact record
  ├── provenance
  ├── evidence
  └── limitations
       │
       ▼
   OKF knowledge
       │
       ├── source
       ├── provenance
       ├── observation date
       ├── access and rights
       ├── integrity
       └── known limitations

Personal AI ───────► conversational response
                         │
Person ◄────────────────┘
  │
  └──── can inspect the Evidence answer independently
```

## Why WebMCP?

Today an AI interacting with a website may have to infer how the site works from text, HTML, screenshots or simulated user actions.

WebMCP proposes something simpler: **the webpage can declare structured tools for an AI agent to discover and call.**

That creates an interesting possibility for public information.

Instead of treating a government website merely as pages for humans to read, the publisher could also expose carefully bounded capabilities for AI agents — while preserving the human interface.

This prototype explores WebMCP as a **progressive enhancement**:

- people can use the website normally without AI;
- compatible AI agents can use the same underlying actions through WebMCP;
- the page determines the permitted operations and their schemas;
- AI access does not require turning the website itself into a chatbot.

## Why personal AI?

A person may already have an AI assistant they use across many parts of their life. That AI may already hold conversational context that could help it formulate a useful request. This is a hypothesis the prototype evaluates, not an established privacy or answer-quality benefit.

This suggests a possible division of responsibility:

**The personal AI**
- understands the conversation;
- helps formulate the question;
- combines information for the person;
- explains it in a useful form.

**The publisher**
- packages source material with its recorded authority clearly labelled;
- defines bounded tools;
- returns deterministic evidence;
- exposes provenance and limitations;
- remains the place where the person can verify what was found.

Recorded publisher identity does not by itself establish authority, access or reuse rights.

Evidence answer tests that separation.

It does **not** send a personal profile to its WebMCP tools. Search text may still contain personal information, and the user's chosen AI provider may receive prompts, tool metadata, arguments and results, so this design should not be interpreted as providing automatic privacy.

## Why OKF?

Finding a web page is only part of the problem.

An AI — and a person checking its work — may also need to know:

- Where did this information come from?
- Who published it?
- When was it observed?
- Has it been transformed?
- Is this an official source or a discovery record pointing elsewhere?
- Has access or reuse actually been established?
- What does the evidence **not** tell us?

The **Open Knowledge Format (OKF)** provides a portable, human- and agent-readable way of representing knowledge together with its surrounding context.

In this prototype, OKF acts as the knowledge and provenance layer underneath WebMCP.

The combination is:

**OKF — knowledge that can be inspected**

**WebMCP — bounded ways for an AI to interact with it**

**Evidence answer — a way for a human to check what the AI was given**

## Evidence before answers

The prototype deliberately does not expose a general-purpose `answer_question` WebMCP tool.

That is important.

The page supplies evidence. The AI can use that evidence when helping its user, but the AI's prose does not become an authoritative government answer merely because a government source was involved.

The interface therefore keeps several questions separate:

- **Authority** — who is the recorded source?
- **Assertion** — what exactly is being claimed?
- **Verification** — what has actually been checked?
- **Freshness** — when was it observed?
- **Integrity** — are these the expected artefacts?
- **Access** — does discovery establish permission to use the resource?
- **Rights** — what reuse information is available?
- **Coverage** — what does this record include or omit?

There is deliberately no single “trust score”.

## The WebMCP tools

The current prototype exposes six page-scoped tools.

| Tool | Purpose |
| --- | --- |
| `search_government_knowledge` | Search the bounded government knowledge collections |
| `get_resource_record` | Retrieve one exact resource record |
| `show_provenance` | Inspect its recorded provenance |
| `explore_answer_foundations` | Explore the evidence behind the packaged worked answer |
| `compare_evidence_foundations` | Compare claim foundations within that worked answer |
| `present_resource_evidence` | Present the evidence for an exact resource in the human interface |

The tools use closed input schemas and bounded arguments.

Human interactions and WebMCP calls use the same application actions rather than implementing two different versions of the service.

See [the WebMCP tool catalogue](docs/competition/tool-catalogue.md) for the exact contracts and limitations.

## Government knowledge in the demonstration

The prototype contains two deliberately different evidence tiers.

### Reviewed evidence

The reviewed tier contains 80 digest-bound records with 80 matching item-level evidence receipts. “Reviewed” describes this prototype's evidence and integrity process; it does not certify that each statement is current or substantively correct.

### Federated discovery

The separate frozen discovery tier contains 58,652 searchable records from 58,655 locked source rows. Three standalone HM Land Registry legislation rows are quarantined, and no standalone legislation.gov.uk collection is exposed. Federated records are snapshot-bound and do not gain item-level receipts.

It currently includes source snapshots derived from:

- **A Life in the UK**
- **Office for National Statistics metadata**
- **UK Government APIs**
- **HM Land Registry public-estate metadata**

These records support **discovery**. Their presence does not mean that every item has been independently reviewed, remains current, grants access, proves eligibility or constitutes an authoritative answer.

That distinction is intentional and visible to both the human and the AI.

## Example

A user might ask their AI:

> Find information about ONS statistics and show me the evidence behind the best result.

A compatible AI can use WebMCP to:

```text
search_government_knowledge
        ↓
get_resource_record
        ↓
show_provenance
        ↓
present_resource_evidence
```

The person can then inspect the resulting Evidence answer in the webpage and
compare the following with what their AI has told them:

- the source;
- the evidence tier;
- the observation date;
- limitations;
- remaining unknowns; and
- the recommended next check.

The aim is not:

> “The AI says this, therefore it is true.”

It is:

> **“Here is what the AI found, and here is the evidence you can inspect before acting.”**

## What this demonstrates

This is a small example of a potentially much larger pattern.

A future public web could allow a person's chosen AI to move across authoritative services whose websites expose machine-readable capabilities directly.

For government information, that might eventually mean:

```text
Personal AI
   │
   ├── GOV.UK guidance
   ├── public services
   ├── statistical sources
   ├── government APIs
   └── local government
```

Each publisher could retain responsibility for its own information and tool boundaries.

The AI would not need unrestricted access to an opaque government knowledge base, and every public body would not necessarily need to operate a separate conversational model.

WebMCP could provide the interaction contract.

OKF could provide portable knowledge and provenance.

The citizen could retain their choice of AI.

This repository explores what one small part of that architecture might look like.

## An experiment, not a claim of solved safety

WebMCP is still experimental and host support varies.

Testing of this project intentionally separates:

- whether WebMCP tools are technically discoverable;
- whether they execute correctly;
- whether an AI chooses the right tool;
- whether the AI accurately describes the result;
- and whether a person can understand and use the evidence.

These are different questions.

A direct Chrome DevTools observation against deployed commit `a4d2db44e60024c3eadbdb2b1722153ce19dff4c` executed all six fixed tool calls and matched the page and tool Evidence answer digests. No model selected those calls.

Testing with personal-AI environments has produced positive, negative and mixed observations. Those observations are host- and session-specific and are retained rather than being converted into a claim of general compatibility or safe-answer behaviour.

That is part of the experiment.

## Human first

WebMCP is an enhancement, not a replacement for the website.

The human interface provides both:

- **Evidence answer** — a simpler explanation of the result, source, limitations, unknowns and next check; and
- **Technical review** — detailed records, provenance, evidence traces and diagnostics.

The application is designed so that the evidence can still be inspected when no WebMCP-capable AI is available.

Start with [Evidence before answers](docs/beginners/index.md) for the beginner-oriented explanation.

## Architecture

The project is a static TypeScript application.

At a high level:

```text
Locked knowledge sources
        │
        ▼
Validated OKF-derived corpus
        │
        ▼
Shared deterministic application actions
       ╱ ╲
      ╱   ╲
Human UI  WebMCP tools
      ╲   ╱
       ╲ ╱
    Evidence result
```

The browser validates the expected knowledge artefacts before enabling search and WebMCP tools.

The static page loads only packaged same-origin artefacts and makes no runtime call to an official API, OKF producer or model provider. It registers WebMCP tools only after artefact validation succeeds.

Source-derived strings are treated as untrusted content.

No language model is embedded in the page.

There is no user account or personal-profile database.

See the competition architecture and tool catalogue for the precise implementation and assurance boundaries.

## The broader question

This prototype started with government information, but the underlying question is broader:

**What changes when websites become participants in a person's AI conversation rather than just documents for an AI to scrape?**

For public services, there is a second question:

**Can we make government information easier for AI to use without making it harder for people to see where an answer came from?**

Evidence answer is one experiment towards answering those questions.

## WebMCP Challenge

This project was built as an entry to **The WebMCP Challenge**.

The objective of the entry is not to demonstrate the largest number of tools.

It is to explore a particular use case for the emerging standard:

> **giving a citizen-selected AI bounded access to inspectable public knowledge while preserving evidence, provenance and human verification.**

## Documentation

For deeper inspection:

- [Beginner documentation](docs/beginners/index.md)
- [Technical implementation and audit trail](TECHNICAL_README.md)
- [Architecture](docs/competition/architecture.md)
- [WebMCP tool catalogue](docs/competition/tool-catalogue.md)
- [Product requirements](docs/product/beginner-trust-pathway-prd.md)
- [Interface specification](docs/product/beginner-interface-specification.md)
- [Accessibility evidence](ACCESSIBILITY.md)
- [Privacy model](PRIVACY.md)
- [Security model](SECURITY.md)
- [Project status](PROJECT_STATUS.md)
- [Release evidence](docs/competition/evidence/)
- [Changelog](CHANGELOG.md)

## Run locally

Node.js 22.12 or later and Python 3.11 or later are required by the pinned toolchain. From a clone of this repository:

```bash
npm ci --ignore-scripts --no-audit
npm run python:setup
npm test
npm run serve
```

Then open <http://127.0.0.1:4173/>. The complete verification, evidence and release procedures remain in the [technical implementation and audit trail](TECHNICAL_README.md).

## Licence and source rights

Original application code is available under the [MIT Licence](LICENSE). Imported and linked source material retains its own access and reuse conditions; see [NOTICE](NOTICE.md). Catalogue inclusion does not grant access or permission to reuse a source.

## Status

This is an independent experimental prototype.

The public candidate serves product commit [`a4d2db44e60024c3eadbdb2b1722153ce19dff4c`](https://github.com/chris-page-gov/govuk-webmcp/commit/a4d2db44e60024c3eadbdb2b1722153ce19dff4c). Its deployment and byte comparison are complete; the `v0.4.0-rc.1` tag, public demonstration video and final competition entry remain separate gates.

It is not an official GOV.UK product or service and does not represent endorsement by the UK Government, GDS, the organisations represented in its discovery data, Google, Microsoft or the WebMCP specification authors.

Do not use the prototype itself to determine eligibility, legal obligations, property ownership, current statistics or another decision requiring current authoritative information.

Follow the recorded official source and check that it remains current and applicable to your circumstances.

---

**WebMCP lets the webpage tell an AI what it can do.
OKF helps the webpage tell it what the evidence means.
Evidence answer lets the person check before acting.**
