---
title: The Friday Night Test
dek: Most hospitality software demos beautifully, then meets 8pm. One question fixes most of it.
date: 2026-09-20
kind: Essay
status: Evergreen
minutes: 5
order: 1
---

Most hospitality software is specified by people who have never worked a Friday night. You can tell.

It demos beautifully. The sales deck has a venue with soft light and six happy guests. The flow works on a clean tablet, on office wifi, with a product manager tapping slowly and explaining each screen.

Then it meets 8pm.

## What 8pm actually looks like

A table of twelve walks in without a booking. The kitchen printer jams halfway through a docket. Two staff called in sick and nobody told the roster. The card terminal drops to offline. There is a queue out the door and the manager is on the pass, calling tickets, because that is where the fire is.

That manager does not care what the roadmap said. They have about four seconds of attention for your software, and they will give it with one hand while holding a plate in the other.

I ran operations across three venues turning over £3.5m before I ever wrote a spec. Every improvement we made had to hold at 8pm on a Saturday, or it was not an improvement. It was a nice idea that cost us a night.

## The test

So I use one test for everything I build, and it is not complicated:

> **Will it actually work when the venue is full?**

If it does not hold under pressure, it is not finished. It might be shipped. It might be on the release notes. It is not finished.

## What the test changes

Asking it early changes what gets built. In practice it means:

- **Three taps, not seven.** Every extra step is a step someone skips when the room is full, and a skipped step is where the data goes wrong.
- **Offline is a feature, not an edge case.** The network will drop on the busiest night of the year, because that is when everyone in the building is on it.
- **Defaults that are right on a bad night.** Nobody configures anything during service. Whatever the default is, is what happens.
- **Recovery beats prevention.** Something will go wrong. The question is whether a tired person can undo it in one move, without calling support.
- **Built for the person holding the plate.** Not the owner reviewing reports on Monday morning. They matter too, but they are not the one who decides whether the feature survives.

## Why it matters more now

The next wave of hospitality software is AI that does things, not AI that answers things. An agent that changes a price, 86s an item or adds a service charge is acting on a live venue, during service.

That raises the bar. A wrong answer costs a moment of trust. A wrong action costs a venue money in the middle of a Friday. The Friday Night Test was always the right test. Now it is the only one that matters.

## The short version

Build for 8pm, not for the demo. Watch someone use it with one hand. If they cannot recover from a mistake in one move, it is not done.

A good system makes an average night reliable. A bad one makes a good team look incompetent. I learned that behind a bar twenty years ago, and it is still the clearest lesson I have had about product.
