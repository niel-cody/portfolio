---
title: How I built a product council
dek: Synthetic users agree with everything and know nothing about a docket rail. So I built a panel designed to disagree.
date: 2026-09-28
kind: Build log
status: Working draft
minutes: 6
order: 4
---

Hospitality operators are the hardest users in software to reach. They work nights and weekends. They do not answer surveys. And one bad Friday decides whether a feature survives.

So teams build on guesses, or on the one friendly customer who always picks up the phone.

The obvious fix is synthetic users: ask a model to play the customer. It is a real category, with real products. It also has two problems its own critics name. The personas are generic. And models tend to please, so a synthetic panel agrees with almost anything you put in front of it. Nielsen Norman Group says plainly not to use synthetic users when your users are niche or specialised. Hospitality operators are both.

The [Council](/playground/council/) is my answer to those two problems.

## What it borrows

- **STORM**, from Stanford: research a question from several perspectives before writing about it.
- **Andrej Karpathy's LLM Council**: independent answers first, so no member anchors on another, then a chair.
- **Ten years of decision records**: what, why, evidence, options, kill signal, dissent.

## What it adds

The part those projects do not have: **a recorded decision.** A verdict, a confidence, the kill signals to watch, the riskiest assumptions, and a human sign-off. The visitor clicks "I agree" or "I disagree, because". That click is the point. The panel advises, and a person decides.

## How a run works

1. **You state the decision.** Up to about a thousand words. No attachments.
2. **A short evidence brief** is built from the pack's own cited sources. No live web search, to keep it fast, cheap and predictable.
3. **Four members answer independently and in parallel.** A pub group GM, a café owner-operator, a head chef and a club duty manager, each written from evidence rather than imagination. Each one runs your idea through a Friday service and says where it breaks.
4. **A chair writes the decision record.** Where the members disagree, the chair says so rather than averaging it away.

## Decisions I made, and why

**Four members and a chair, not six with peer review.** Karpathy's council adds a round where members review each other anonymously. It is elegant, and it doubles the wait. I left it out until an evaluation shows it produces better verdicts. Resembling a good project is not a reason to copy its latency.

**Dissent is a requirement, not a hope.** Every member is instructed to disagree with the others and with you. Then it is tested. The eval set is twenty deliberately bad ideas, and the panel must fail at least eighteen. If it passes more than two, the build is broken, whatever the demo looks like.

**Recorded runs first, live runs second.** The site launches with recorded runs you can explore, so the interaction can be perfect before a model meter is running. Live runs come next, with hard caps on tokens, concurrency and daily spend, all enforced in code.

**No bring-your-own-key.** Pasting an API key into a stranger's portfolio is a trust problem bigger than the cost problem. If you want unlimited runs, clone the repo and run it locally with your own key.

**Cheap members, a stronger chair.** Members need speed and volume, so they run on a small, fast model. The chair needs judgement, so it runs on a stronger one. A full run is budgeted at around six US cents.

## What I kept back

The method is public: the loop, the decision record format, and a sample pack written for the site. The operator panel it runs is generic and new. Nothing built in my day job, no personas, no records and no data, goes anywhere near it.

## What would tell me it is not working

- Fewer than three in five people who run it say the verdict told them something true they had not written down.
- The sycophancy eval passes more than two bad ideas.
- Runs take longer than ninety seconds to a verdict.

Any one of those, and it goes back to the workbench. That is the Friday Night Test, applied to my own work.
