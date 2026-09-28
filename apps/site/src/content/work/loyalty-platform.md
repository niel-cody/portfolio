---
title: From bespoke builds to a product
kicker: Loyalty, rebuilt as configurable SaaS
summary: Every customer app was a cloned repository with weeks of bespoke design behind it. I turned it into one configurable, multi-tenant product. Delivery went from weeks to under a week, and the estate from under 10 apps to over 250.
period: 2021 — 2024
seat: Product Manager, Customer Engagement
team: Tech lead across front end, back end and QA, plus two onboarding specialists
status: Shipped
order: 1
headline:
  value: 25×
  label: Estate growth, <10 to 250+ instances
spec:
  - ['Product', 'myPLACE, the group’s loyalty and customer engagement platform']
  - ['Before', 'One cloned repository and one bespoke design per customer']
  - ['After', 'Serverless, multi-tenant, version-controlled, configurable']
  - ['Delivery', 'Weeks of scoping, then under a week end to end']
  - ['Scale', 'Customers with hundreds of thousands of weekly active users']
  - ['Commercial', 'One-off licence became SaaS, bundled into the platform']
---

## The situation

I inherited myPLACE as a project the CEO had been running personally during COVID, alongside a designer and a few engineers. It sold, and customers liked it. But every new customer meant a cloned repository, a bespoke design in Figma or XD, and weeks of specification before a line of product changed.

Nothing was reusable. Each sale made the next one no cheaper. The return on effort was poor, and it would only get worse as volume grew.

## What was actually wrong

The problem was not the app. It was the unit of delivery. We were shipping *projects* that happened to look like a product. So every improvement had to be made once per customer, and a fix for one venue was a merge conflict for the next.

## The options

| Option | What it meant | Why not |
|---|---|---|
| Keep cloning, hire for volume | More engineers and designers per sale | Cost grows with every customer. Margin never improves |
| Rebuild from scratch | A new product, then migrate everyone | Stops delivery for a year. Existing customers pay for it |
| **Re-found it as a configurable product** | One codebase, one config per customer, rebuilt in stages on existing infrastructure | **The bet.** Harder to design, but every step ships |

## The bet

Rebuild it as a serverless, multi-tenant, version-controlled product, in stages, without missing a single existing commitment. Then migrate the whole estate off the legacy apps.

I diagnosed it, specified the alternative with the engineers, and wrote the proposal. Leadership signed it off straight away, because the proposal led with the thing they cared about: every sale would get cheaper to deliver.

## How it shipped

Roughly twelve months of staged iterations. Existing customers kept getting their releases while the foundation was swapped out underneath them. Configuration replaced design work: branding, content, offers, push notifications, a control panel and native messaging, all set per customer rather than built per customer. It ran on every point-of-sale system in the group.

I built the team as the product grew. It started as a couple of engineers reporting to the CEO. It became a tech lead reporting to me across front end, back end and QA, plus two implementation and onboarding specialists as rollout volume picked up.

## What happened

- **Delivery:** from weeks of bespoke scoping and design to **under a week**, discovery through to live in the app stores.
- **Estate:** from **fewer than 10** instances to **over 250**, roughly twenty-five times.
- **Scale:** the same product served customers with **hundreds of thousands of weekly active users**.
- **Commercial model:** from an expensive one-off licence to a lower-priced SaaS product bundled into the wider platform.
- **Legacy:** the whole estate migrated off the old apps.

## What I cannot claim

The revenue effect. Several commercial models ran at the same time, so the net revenue change is not cleanly measurable, and I will not put a number on it.

## The kill signal I did not write

At the time, I never wrote down what would have told me the bet was wrong. I would now. It would have read:

> If a configured app still needs more than two days of engineering to go live by the tenth customer, the configuration model is wrong. Stop migrating and redesign it.

That is the habit this project taught me, and every decision record I have written since has one.
