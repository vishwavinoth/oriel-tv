# ADR 0001: Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-10-24

## Context

Oriel TV starts from an empty repository and will be built by many contributors over time. Decisions about technology, structure, and design need to be easy to find, easy to question, and hard to lose.

## Decision

Record every significant decision as a short, numbered Markdown file in `docs/adr/`. Each record states its status, date, context, decision, and consequences.

Records are never deleted. When a decision changes, a new record supersedes the old one, and the old record's status is updated to point to it.

## Consequences

- New contributors can learn why the project is shaped the way it is.
- Changing a recorded decision requires writing down the reason.
