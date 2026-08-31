# Evidence before answers

This short learning pathway explains how this prototype can help you check an
AI answer. It assumes no knowledge of artificial intelligence, government data,
APIs or technical evidence.

The prototype is independent. It is not GOV.UK, it does not make government
decisions and it does not know your personal circumstances. Its useful job is
smaller: it helps a person or their chosen AI find a recorded source, keep the
source attached and show where the available evidence stops.

The interface described here is a proposed beginner experience. The public
`v0.3.0-rc.1` site still uses the existing detailed interface, which will be
assessed as the future **Technical review** view before any redesign.

## Choose a route

You do not need to learn everything at once.

### Short orientation

Read:

1. [An answer is not the same as evidence](#an-answer-is-not-the-same-as-evidence);
2. [Five questions to ask](#five-questions-to-ask); and
3. [What this prototype can and cannot do](#what-this-prototype-can-and-cannot-do).

At the end, you should be able to explain why a confident answer can still need
checking and why a source link is useful without being a guarantee.

### Full pathway

Complete the short orientation, then work through:

1. [A new-baby example](#a-new-baby-example);
2. [Three different kinds of result](#three-different-kinds-of-result); and
3. [Check your understanding](#check-your-understanding).

At the end, you should be able to separate what the evidence says, what an AI
has added and what you still need to check before acting.

## Start with the person's question

A person is not trying to “inspect provenance”. They may be trying to register
a birth, appeal a school-place decision, understand a tenancy deposit, find an
inflation dataset or discover where property information is held.

Their first need is practical:

> Help me find the right official starting point, understand why it is relevant
> and see what I still need to check.

This prototype can support that need when its catalogue contains a suitable
record. It cannot turn a catalogue description into a complete personalised
answer.

## An answer is not the same as evidence

Keep three things separate.

| Thing | Plain-English meaning | Example |
| --- | --- | --- |
| Answer | The explanation an AI gives you | “Start by checking birth registration, Child Benefit and parental leave or pay.” |
| Evidence | The recorded material that supports some or all of that explanation | A captured GOV.UK page title, description, observation date and source link |
| Decision | The conclusion that applies to your actual circumstances | Whether you qualify, which deadline applies or which authority must act |

An answer can be clear and still be wrong. Evidence can be genuine and still be
old, incomplete or irrelevant to your circumstances. A decision can require
facts or current rules that this static catalogue does not hold.

The safest pattern is:

> **Answer → evidence → limitation → current official source → decision**

Do not skip from a plausible answer straight to a consequential decision.

## Five questions to ask

Use these questions whenever an AI gives you government information.

### 1. What am I being asked to believe?

Turn a long answer into one or more short statements. “There is a GOV.UK route
for appealing a school admission decision” is different from “your appeal will
succeed” or “you have 14 days”. Each statement needs its own basis.

### 2. Which source supports it?

Look for a meaningful source name and a link you can open. Check that the
destination is the organisation or service you expected. A link shows where to
look; it does not prove that every sentence in the AI's answer appears there.

### 3. What did the AI add or change?

An AI may shorten, combine, infer or invent details. Ask which words came from
the recorded result and which were the AI's explanation. Dates, amounts,
deadlines, eligibility rules and legal steps deserve particular care.

### 4. What is missing, conditional or out of date?

Look for the strongest relevant limitation. The catalogue may contain only
metadata about a page or dataset. It may not contain live figures, current
rules, local variations, property records or the facts needed to decide your
case.

### 5. What is the safest next action?

Prefer a reversible action: open the recorded source, refine the question,
check the responsible authority or ask for qualified help. The next step should
not pretend that a discovery result has already made a decision.

## A new-baby example

Imagine asking your chosen AI:

> We have a new baby. Which official starting points should we check?

The prototype has a small reviewed directory answer containing three starting
points. It can return records for:

- [registering a birth](https://www.gov.uk/register-birth);
- [Child Benefit](https://www.gov.uk/child-benefit); and
- [maternity or paternity leave, pay or Maternity Allowance](https://www.gov.uk/maternity-paternity-pay-leave).

### Explain

The useful plain-English result is: “These are three official starting points
recorded in this prototype.” It is not: “These are all the things every new
parent must do.”

### Inspect

For each starting point, inspect the recorded title, source link, observation
date and limitation. The prototype's reviewed records have item-level evidence
receipts and checksum bindings. Those checks show that the packaged record has
not silently changed; they do not prove that the live page is unchanged or that
its guidance applies to you.

### Do

Open the relevant current GOV.UK page. Your AI may use circumstances it already
knows to decide which starting point to discuss first, but the page tool should
receive only the small query or record identifier needed for the task.

### Check

Compare the AI's wording with the current official page. If the AI gives an
amount, deadline or eligibility conclusion that the returned evidence did not
contain, treat that detail as unverified.

### Reflect

You can now say:

- what the prototype supported: three recorded starting points and their
  source links;
- what the AI added: its ordering, explanation and any personalisation;
- what remains unknown: current applicability, eligibility and wider tasks;
  and
- what was shared with the page: only the question and references needed for
  this task, not a general personal profile.

## Three different kinds of result

Not every useful response looks like an answer.

### A route to check

Question: “Where can I check how to appeal a school-admission decision?”

Useful result: the recorded
[GOV.UK appeal route](https://www.gov.uk/schools-admissions/appealing-a-schools-decision),
with a warning that the snapshot does not contain the complete current process,
deadline or facts of the person's case.

Unsafe leap: inventing a deadline, required evidence or likely outcome from the
catalogue description.

### Metadata, not the number

Question: “What is today's unemployment rate?”

Useful result: identify a relevant ONS or Nomis dataset record, then explain
that this prototype contains metadata rather than current statistical
observations.

Unsafe leap: presenting a remembered or inferred number as though the page tool
returned it.

### An honest boundary

Question: “Who owns this property?”

Useful result: explain that the Land Registry collection in this prototype is
metadata-only, contains no title, address, ownership, polygon or personal rows,
and can only point to recorded official guidance.

Unsafe leap: naming an owner or treating a catalogue record as legal proof.

An honest “this evidence cannot answer that” is a successful result when it
prevents a plausible invention.

## What the technical labels mean

The detailed interface uses language intended for evidence review. A beginner
experience should introduce these ideas only when they help with the current
task.

| Detailed label | Ask instead |
| --- | --- |
| Type | What kind of thing is this? |
| Authority | Who supplied or published the source? |
| Assertion | What does the evidence actually say? |
| Verification | Can this exact packaged record be traced? |
| Freshness | When was it observed, and was a currentness limit established? |
| Integrity | Did the declared packaged bytes change? |
| Access | Can I open or use it, and was that checked? |
| Rights | What permission to reuse was established? |
| Coverage | What is included, and what is missing? |

These are separate questions. Do not collapse them into one “trust score”. A
source can be official but stale, current but outside the right jurisdiction,
or easy to open without a confirmed reuse licence. A checksum can pass while a
source statement is still inaccurate.

## What your AI and the page each do

The intended division of work is:

| Participant | Role |
| --- | --- |
| Your chosen AI | Understand the conversation, choose one of the page's limited search or evidence actions and explain what comes back |
| This static page | Check a small request and return the same source-linked catalogue evidence for the same request |
| The recorded source | Supply the current official route or specialist material to inspect |
| You | Decide whether the explanation is sufficient and what to check before acting |

The page contains no AI and does not contact an official service while you
search. A compatible AI can use the page's search and evidence actions through
a browser feature called WebMCP. Those actions reject a general personal
profile. This reduces what needs to be sent to the page, but it does not prove
end-to-end privacy: an AI provider may still receive the conversation, the
available action descriptions, the small request and the result.

The complete human search must remain available when that AI connection is
unavailable.

## What this prototype can and cannot do

It can:

- search 80 reviewed records and 58,652 wider source-snapshot records;
- distinguish reviewed evidence from broader discovery metadata;
- return recorded source links, dates, access, rights and limitations;
- show item-level provenance for reviewed records and snapshot-level
  provenance for federated records;
- refuse malformed or unrelated tool inputs; and
- let a person use the same underlying search without an AI.

It cannot:

- cover the whole of GOV.UK;
- decide eligibility, legal position, ownership or entitlement;
- provide live statistics, transactions or official API responses;
- prove that a recorded source is correct, current or suitable merely because
  its bytes match a checksum;
- infer open access or a licence from catalogue inclusion; or
- guarantee that an AI will explain the returned evidence accurately.

The wider records are source-snapshot metadata without item-level review. Three
standalone Land Registry legislation rows are quarantined. There is no
standalone legislation collection in this product.

## Check your understanding

1. An AI cites an official page. Does that prove every sentence in its answer?
2. A checksum matches. What has been checked, and what has not?
3. A search finds an ONS dataset. Can this page provide today's figure?
4. A Land Registry result has a GOV.UK link. Can it name a property's owner?
5. Which personal details must be sent to the page when a short search phrase
   is enough?

Suggested answers:

1. No. Check which statements the page supports and which the AI added.
2. The identity of the declared packaged bytes was checked, not their truth,
   currentness or applicability.
3. No. This release contains dataset metadata, not current observations.
4. No. The admitted collection contains no property or ownership rows.
5. None. Send only the search words or record reference that the page needs.

## What needs testing next

This pathway and its fictional examples are product hypotheses, not completed
user research. Before replacing the current interface, a Technical review
should turn these ideas into a testable design and observe whether people can:

- identify what is supported and what the AI added;
- notice the most important limitation before acting;
- reach the correct current source;
- understand reviewed versus snapshot evidence without learning specialist
  vocabulary first;
- discover what was shared with the page tool; and
- complete the journey with keyboard, touch and assistive technology as well as
  with a citizen-selected AI.

The research should include occasions when the right outcome is a clarifying
question, a metadata-only response or no government-tool call at all.
