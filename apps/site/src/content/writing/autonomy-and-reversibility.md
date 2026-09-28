---
title: An agent that writes to a live till
dek: A wrong answer costs trust. A wrong action costs money. How much autonomy an AI agent gets should depend on one thing.
date: 2026-09-24
kind: Field note
status: Published
minutes: 4
order: 2
---

Most AI assistants in business software answer questions. Ask about last week's sales and you get a number and a chart. If the number is wrong, you lose a little trust and ask again.

The agent I lead crossed a line most never cross. It takes actions. It creates service charges and discounts. It changes what is available on the menu. It maps imported menu items to products. It does this inside a live point of sale, sometimes in the middle of service.

That is a different risk profile, and it changes where the work is.

## The work moves out of the model

When an agent only answers, the model is most of the product. When it acts, the model is the smallest part. Most of the real work becomes:

- **Guardrails.** What it is allowed to do at all.
- **Permissions.** Whose authority it is acting under.
- **Reversibility.** How a mistake gets undone, and by whom.
- **Evaluation.** How you know it behaves before a venue finds out that it does not.

## One rule for autonomy

The principle I use is simple enough to say in a meeting:

> **The more reversible an action, the more autonomy it gets. The less reversible, the more a human stays in the loop.**

Take two actions. Marking an item unavailable is easy to undo, so it can move fast. A price change that runs through a whole Friday service is not, so it should wait for a person to confirm it. The test is not how clever the model is. It is how bad the worst case is, and how fast someone can fix it.

## Do not let the model guess what has one right answer

A lesson from the decision log. In a point of sale, order IDs, transaction IDs and payment IDs all look the same. We were asking the model to work out which kind of ID it had been handed. It was a probabilistic guess at a question with one right answer.

We replaced the guess with a deterministic lookup. When we traced failed queries, the biggest causes were not model problems at all. They were plumbing. That is worth remembering whenever an AI feature underperforms: check the plumbing before you blame the model.

## Earn the right to do more

We also chose to teach the agent the back office, the "how do I" questions, before giving it deeper actions. A large share of what people actually asked was how to do something, not what the numbers were. An agent that cannot answer those has not earned more power yet.

## The short version

Give an agent autonomy in proportion to how reversible its actions are. Do not let a model guess anything with one right answer. And make it earn each new power by being good at the last one.

The demo is the easy part. The product is everything that makes the demo safe to leave running on a Friday night.
