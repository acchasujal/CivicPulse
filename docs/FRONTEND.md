# FRONTEND.md

# CivicPulse Frontend Design System

Version: 1.0

This document is the single source of truth for every frontend implementation.

Do not deviate unless explicitly instructed.

---

# Product Identity

CivicPulse is a civic intelligence platform.

It is **not**:

* an AI chatbot
* an admin dashboard
* a government portal
* a data analytics tool

It is a modern consumer product that transforms a civic issue into community action.

Every screen should communicate:

> Observe → Understand → Act

The interface should feel calm, trustworthy and premium.

---

# Design Philosophy

Design priorities:

1. Clarity
2. Trust
3. Speed
4. Evidence
5. Simplicity

Remove everything that does not help users complete their task.

Never design to impress.

Design to build confidence.

---

# Visual Identity

Style:

* Minimal
* Modern
* Premium
* Human
* Calm
* Confident

Inspirations:

* Apple
* Linear
* Stripe
* Raycast
* Notion

Never imitate them.

Use them only as quality references.

---

# Never Build

Never generate:

* AI gradients
* Glassmorphism everywhere
* Cyberpunk themes
* Neon colors
* Dashboard templates
* Analytics-style layouts
* Vibrant hero sections
* Marketing landing pages
* Floating blobs
* Random illustrations
* Excessive icons
* Emoji-heavy interfaces

Avoid anything that immediately looks AI-generated.

---

# Color System

Primary

Deep Blue

Used for:

* primary actions
* active navigation
* important highlights

Secondary

Slate

Used for:

* text
* dividers
* borders

Success

Green

Warning

Amber

Danger

Red

Background

Near-white

Cards

Pure white

Avoid more than one accent color on a screen.

---

# Typography

Hierarchy creates beauty.

Prefer typography over decoration.

Sizes should feel spacious.

Use:

* Bold only for importance
* Medium for titles
* Regular for content

Never overuse uppercase.

Keep line lengths readable.

---

# Spacing

Whitespace is a feature.

Prefer generous spacing.

Use a consistent spacing scale.

Never stack unrelated components tightly.

Group by meaning.

---

# Border Radius

Small

Buttons

Inputs

Medium

Cards

Dialogs

Large

Major containers

Avoid inconsistent radii.

---

# Shadows

Very subtle.

One shadow system.

Never create floating UI with large blurred shadows.

---

# Icons

Use Lucide.

One icon style.

Only where they improve comprehension.

Never decorate with icons.

---

# Animations

Animation should communicate state.

Allowed:

* fade
* slide
* layout
* progress
* opacity
* scale (small)

Avoid:

* bounce
* elastic
* spin
* exaggerated transitions

Duration:

150–250ms

---

# Motion Rules

Every animation must answer:

What changed?

If it does not communicate state,

remove it.

---

# Layout

Desktop:

Centered container

Maximum width:

1280px

Content width:

900–1100px

Mobile first.

Never create full-width unreadable layouts.

---

# Navigation

Simple.

Persistent.

Predictable.

Maximum navigation depth:

3

Never hide important actions.

---

# Cards

Cards represent meaningful information.

Not decoration.

Every card must answer one question.

Avoid dashboard grids containing dozens of cards.

---

# Buttons

Primary

One per screen.

Secondary

Neutral.

Danger

Rare.

Ghost

Low emphasis.

Do not create five equally important buttons.

---

# Forms

Short.

Obvious.

Progressive.

Validate immediately.

Explain errors clearly.

Never clear user input after validation failures.

---

# Loading

Never use generic spinners if progress can be shown.

Prefer:

Skeletons

Progress indicators

Agent progress timeline

Streaming updates

---

# Empty States

Every empty state should teach.

Show:

* why empty
* what to do next

Never show:

"No data"

---

# Error States

Human.

Helpful.

Actionable.

Always provide recovery.

---

# Agent Experience

The AI should feel like background intelligence.

Never expose prompts.

Never expose raw JSON.

Never expose model names.

Present intelligence as progress.

Preferred flow:

Upload

↓

Issue Understanding

↓

Verification

↓

Community Intelligence

↓

Action Drafts

↓

Escalation

---

# Evidence First

Every AI output should appear connected to evidence.

Whenever possible show:

Photo

↓

Classification

↓

Reasoning

↓

Impact

↓

Generated Action

Users should trust outputs naturally.

---

# Responsiveness

Support:

Mobile

Tablet

Laptop

Desktop

No separate mobile UI.

One adaptive layout.

---

# Accessibility

Keyboard navigable.

Visible focus.

Readable contrast.

ARIA where required.

Semantic HTML.

---

# Components

Prefer reusable components.

Extract after second use.

Keep props minimal.

Avoid prop drilling.

---

# Performance

Lazy load routes.

Memoize expensive renders.

Avoid unnecessary state.

Avoid unnecessary effects.

No dead code.

---

# Code Style

React

TypeScript

Vite

Tailwind

ShadCN

Lucide

Framer Motion

No inline styles.

No duplicated components.

No unused imports.

No commented code.

No placeholder data in production.

---

# API Rules

Backend is the source of truth.

Never invent endpoints.

Never fabricate fields.

Never mock responses unless explicitly requested.

---

# Quality Checklist

Before completing any task verify:

✓ Matches backend

✓ Responsive

✓ Accessible

✓ Production ready

✓ Minimal

✓ Maintainable

✓ Consistent with FRONTEND.md

If all checks pass:

Stop.

Do not continue polishing.

Do not redesign working UI.

Generate only files that changed.

---

# CivicPulse Feeling

The interface should make judges think:

"This looks like a real civic product someone could launch tomorrow."

Not:

"This looks like another AI hackathon dashboard."

If uncertain,

choose the simpler solution.
