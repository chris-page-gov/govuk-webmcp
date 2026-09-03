# Government Knowledge for Your AI

## Inspiration

AI is becoming another way people find and understand public information.

That raises a question I have been thinking about for some time:

Does every government website need its own chatbot?

Or could the AI a person already uses interact directly with authoritative
public websites?

That second possibility is what interested me about WebMCP.

A personal AI may already understand the conversation and the user's
circumstances. The government publisher, meanwhile, is better placed to say
what information it provides, where it came from and what the boundaries of
that information are.

So I wanted to explore a proposed division of responsibility:

- the personal AI handles the conversation;
- a publisher defines the tools and evidence; and
- the person remains able to inspect the source before acting.

This independent experimental prototype demonstrates that pattern using
packaged public-source evidence. It is not GOV.UK, an official government
service or an endorsement by the source organisations.

Government information is a particularly useful test case because plausible
answers are not enough.

A result may depend on jurisdiction, date, eligibility, the authority of the
source or information that is simply not present.

The important question therefore becomes not just:

> Can an AI find an answer?

but:

> Can I see the evidence behind what my AI is telling me?

That became the guiding principle for the project:

> Provide the evidence with the answer.

## What I built

This project demonstrates how a personal AI can use WebMCP to access structured
government knowledge directly from a webpage.

The site exposes six bounded WebMCP tools that can:

- search government knowledge;
- retrieve an exact resource;
- inspect its provenance;
- explore the evidence behind a claim in the packaged worked answer;
- compare claims in that worked answer with their evidence foundations; and
- present the evidence for a selected resource back on the webpage.

There is deliberately no general-purpose `answer_question` tool.

The website provides evidence rather than attempting to become the
conversational AI.

A compatible AI can use that evidence to help its user, while the human
interface independently presents the same underlying information as an
Evidence answer.

That lets the person inspect:

- the recorded source;
- provenance;
- observation date;
- evidence level;
- access and reuse information;
- limitations;
- remaining unknowns; and
- the appropriate next check.

The human interface and WebMCP tools use the same underlying application
actions, so there is not one implementation for people and another hidden
implementation for AI.

## Where OKF fits

WebMCP solves only part of the problem.

It gives an AI a structured way to interact with a webpage, but government
information also needs context.

Finding a record is not the same as knowing:

- who published it;
- whether it is authoritative for the question;
- when it was observed;
- what has been transformed;
- what rights or access have been established; or
- what the evidence cannot tell us.

I therefore used Open Knowledge Format (OKF) as the knowledge and provenance
layer beneath the WebMCP experience.

That gives the prototype three distinct parts:

- **WebMCP** — the interaction layer;
- **OKF** — the knowledge and provenance layer; and
- **Evidence answer** — the human verification layer.

The demonstration includes 80 receipt-bound reviewed records together with
58,652 searchable source-snapshot records projected from 58,655 locked rows.
The four federated OKF discovery collections cover A Life in the UK, Office for
National Statistics metadata, the UK Government API catalogue and
metadata-only HM Land Registry discovery.

Those collections intentionally have different evidence levels. Discovery
does not magically become verification simply because an AI can search it.

## How I built it

The application is a static TypeScript web application.

When the page loads, it validates its packaged knowledge artefacts before
enabling search and registering its WebMCP tools.

The WebMCP interfaces use bounded inputs, closed schemas and deterministic
application actions.

Source-derived text is treated as untrusted content rather than instructions
for the AI.

The site contains no embedded language model, user account or personal-profile
database.

That reduces what the page itself receives, but it is not a claim of complete
privacy. Free-text searches can contain personal information, and a remote AI
provider may receive the person's prompt, tool metadata, arguments and results.

That was an intentional architectural choice.

The experiment is not about building another AI service. It is about exploring
what happens when an ordinary website becomes directly usable by the AI chosen
by the visitor.

I used Codex extensively as the implementation agent.

I supplied the product direction, architecture, constraints and review
decisions, while Codex implemented and repeatedly tested the TypeScript
application, data pipeline, WebMCP tools, browser behaviour, schemas and
supporting documentation.

ChatGPT, Claude and Gemini also helped with research, critique and evaluation
design.

Microsoft Copilot and a local Ollama model were used as experimental
personal-AI hosts rather than as components of the application itself.

Earlier OKF and GIS AI GO work supplied the design lineage. During the
competition period I built this repository's six-tool WebMCP application,
four-source federation, Evidence answer interface, tests, evaluation and
protected public deployment.

## The biggest challenge

The hardest part turned out not to be registering a WebMCP tool.

It was deciding what we can legitimately claim happened.

During testing, an AI could produce a convincing response that appeared to
understand the website and even talked about tools.

But that did not necessarily mean a WebMCP tool had actually been discovered
and invoked.

That distinction became important.

I separated several questions that are easy to accidentally collapse into
one:

- Did the browser expose the tools?
- Could the tool be called successfully?
- Did an AI choose the appropriate tool?
- Did the AI correctly interpret the tool result?
- Could the person independently understand the evidence?

Those are five different tests.

Direct testing through Chrome DevTools successfully exercised all six fixed
WebMCP calls against deployed commit `a4d2db44`, with matching tool and page
Evidence answer digests. A model did not select those direct calls.

An owner-operated ChatGPT Chrome extension journey visibly completed the ONS
search-and-present flow. A later directed ChatGPT extension evaluation in Edge
reported exercising all six page tools. Those host observations did not expose
raw browser traces, and the Chrome journey did not expose an exportable exact
call trace, host version or model identity.

Testing with other personal-AI hosts was much less predictable.

Microsoft Copilot could read and discuss the page, but no Site-tool invocation
or Evidence answer update was observed; its call and page state remained
unobservable. No Gemini Site-tool invocation was observed either.

The local model produced a mixture of successful and unsuccessful
tool-selection runs.

Initially that felt like a limitation of the demonstration.

It became one of the most useful things I learned.

## What I learned

### WebMCP changes the role of the website

Most discussion about agents interacting with websites starts from the agent:

- How can the AI read the page?
- How can it find the button?
- How can it automate the browser?

WebMCP lets us reverse the question:

> What capabilities should the website deliberately make available to an AI?

That is a significant shift.

Instead of an agent reverse-engineering the user interface, the publisher can
define a small, explicit machine interface alongside the human one.

### Personal AI creates a different public-service architecture

A public body does not necessarily have to own the entire conversational
experience.

There is another possible architecture:

> citizen-selected AI + publisher-defined tools + inspectable evidence

The AI can remain personal to the user.

The publisher can remain responsible for its information and tool boundaries.

That separation seems particularly interesting for government.

### Provenance matters as much as retrieval

It is easy to make a large body of information searchable.

It is much harder to preserve the distinction between:

- authoritative information;
- publisher-declared metadata;
- transformed data;
- frozen discovery snapshots;
- inferred relationships; and
- things that remain unknown.

OKF became important because I did not want the project merely to demonstrate
retrieval.

I wanted the AI and the human to be able to ask:

> What exactly is this evidence?

### A checksum does not prove truth

One of the most useful design disciplines was keeping different kinds of trust
separate.

Integrity can establish that I am looking at the expected bytes.

It does not establish that those bytes are factually correct, current or
applicable to a particular person.

Likewise, a GOV.UK link does not automatically mean that every statement an AI
makes around that link is authoritative.

The interface therefore avoids producing a single "trust score".

### Failure is useful evidence

The personal-agent testing also reinforced something important about emerging
standards.

A demonstration should not imply interoperability that has not actually been
observed.

WebMCP support is still developing.

So the project reports successful direct tool execution separately from model
behaviour and host compatibility.

I think that makes the experiment more useful, not less.

## Why this matters

The project is intentionally bounded, but the pattern could become much
larger.

Imagine a personal AI being able to interact with publisher-defined
capabilities across:

- GOV.UK guidance;
- government services;
- statistical organisations;
- legislation;
- public APIs;
- local government;
- regulators; and
- other authoritative public information sources.

The alternative does not have to be either:

- every organisation builds its own chatbot; or
- AI agents freely scrape and interpret every website they encounter.

WebMCP suggests a third possibility.

Websites can become intentional participants in an AI conversation.

The publisher can define what the AI may ask for.

Structured knowledge can carry provenance and limitations.

And the human can still inspect the evidence independently.

That is what this prototype is trying to make tangible.

## In one sentence

This project explores how a person's own AI can use WebMCP to access
publisher-defined government knowledge, while OKF preserves the evidence and
the webpage lets the person check it before acting.
