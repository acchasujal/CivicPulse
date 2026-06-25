# COMPONENTS.md

# CivicPulse Component Architecture

Version: 1.0

This document defines every reusable frontend component.

Never recreate an existing component.

If a new screen can reuse an existing component, reuse it.

Extract components after the second use.

---

# Architecture

Pages

↓

Layouts

↓

Sections

↓

Cards

↓

Primitive Components

↓

UI Library

Never skip layers.

---

# Folder Structure

```
components/

    layout/

    navigation/

    cards/

    timeline/

    forms/

    feedback/

    dialogs/

    map/

    issue/

    drafts/

    escalation/

    shared/
```

---

# Layout Components

## AppLayout

Responsible for:

* Navigation
* Responsive spacing
* Global padding
* Max width

Never place page logic here.

---

## PageHeader

Contains:

* Title
* Subtitle
* Optional action button

One header per page.

---

## Section

Reusable content section.

Supports:

* title
* description
* children

Never duplicate spacing.

---

## Container

Centers content.

Maximum width.

Responsive padding.

---

# Navigation

## Sidebar

Desktop only.

Minimal.

Collapsible.

---

## Bottom Navigation

Mobile only.

Maximum five destinations.

---

## Breadcrumb

Only when navigation depth > 2.

---

# Issue Components

## UploadCard

Contains:

Photo upload

Preview

Location

Description

Submit

---

## PhotoPreview

Displays:

Image

Zoom

Remove

Retry

---

## IssueCard

Displays:

Issue type

Severity

Status

Created date

Cluster

Reusable everywhere.

---

## IssueStatusBadge

Allowed states:

classified

clustered

drafted

approved

escalated

One color per status.

Never invent new states.

---

# Timeline

## AgentTimeline

Core component.

Shows:

Issue Understanding

↓

Verification

↓

Impact Intelligence

↓

Draft Generation

↓

Escalation

Supports:

pending

running

completed

failed

Never expose AI model names.

---

## TimelineStep

Reusable.

Contains:

Icon

Title

Status

Description

Timestamp

---

# Evidence Components

## EvidenceCard

Shows:

Photo

Issue Type

Severity

Confidence

Description

Always shown before AI outputs.

Evidence first.

---

## ClusterCard

Shows:

Area

Reports

Risk

Last Updated

Never overload with statistics.

---

## Impact Components

## ImpactCard

Contains:

Risk Level

Evidence Count

Affected Area

Potential Consequences

One responsibility only.

---

## RiskBadge

Levels:

Low

Moderate

High

Consistent colors everywhere.

---

# Draft Components

## DraftTabs

Complaint

RTI

Community Summary

Never create multiple pages.

Use tabs.

---

## DraftViewer

Readable typography.

Copy button.

Download button.

Approve button.

Reject button.

---

## DraftStatus

Pending Review

Approved

Rejected

Readonly display.

---

# Escalation Components

## EscalationCard

Displays:

Method

Recipient

Status

Provider Response

Timestamp

---

## EscalationDialog

Collects:

Recipient Email

Confirmation

Send

Minimal.

---

## SuccessCard

Shown after escalation.

Includes:

Success message

Reference

Download PDF (if available)

---

# Dashboard Components

## StatsRow

Maximum four metrics.

Examples:

Issues

Clusters

Escalations

High Risk

Avoid analytics overload.

---

## ActivityFeed

Chronological.

Recent actions only.

---

## CommunityCard

Displays:

Area

Reports

Trend

Risk

---

# Feedback Components

## EmptyState

Always includes:

Illustration (simple)

Reason

Primary Action

---

## LoadingState

Prefer:

Skeletons

Progress

Timeline

Avoid endless spinners.

---

## ErrorState

Contains:

Title

Explanation

Retry

---

## Toast

Only for:

Success

Error

Information

Never stack multiple toasts.

---

# Dialogs

## ConfirmationDialog

Reusable.

For:

Delete

Approve

Escalate

Reject

---

## ImageViewer

Fullscreen.

Zoom.

Close.

Nothing else.

---

# Shared Components

## StatusBadge

Single badge system.

Never create multiple badge styles.

---

## Avatar

Only if users exist.

Otherwise do not create.

---

## Divider

One divider component.

Consistent spacing.

---

## InfoRow

Reusable label/value pair.

Example:

Severity

High

---

## SectionTitle

Consistent typography.

Never manually recreate.

---

# Page Composition

Issue Upload

```
AppLayout

PageHeader

UploadCard

AgentTimeline
```

---

Issue Detail

```
AppLayout

PageHeader

EvidenceCard

ClusterCard

ImpactCard

DraftTabs

EscalationCard

AgentTimeline
```

---

Dashboard

```
AppLayout

PageHeader

StatsRow

CommunityCard

ActivityFeed
```

---

Draft Review

```
AppLayout

PageHeader

DraftViewer

ConfirmationDialog
```

---

Escalation

```
AppLayout

PageHeader

EscalationDialog

SuccessCard
```

---

# Component Rules

Every component should:

Have one responsibility.

Support loading.

Support empty.

Support error.

Support mobile.

Support dark mode if implemented.

Never contain unrelated business logic.

---

# Naming

PascalCase.

One component per file.

Named exports preferred.

Keep props minimal.

Avoid boolean explosion.

---

# Reuse Rules

Never duplicate components.

If similar,

extend.

Don't copy.

Extract after second use.

---

# Performance

Memoize expensive components.

Lazy load pages.

Avoid unnecessary renders.

Stable keys.

Stable callbacks.

---

# Animation

Only components that benefit from motion should animate.

Preferred:

Fade

Layout

Opacity

Small Scale

No decorative animation.

---

# Final Rule

When implementing a screen:

1.

Reuse existing components.

2.

Create new only if necessary.

3.

Keep hierarchy shallow.

4.

Optimize readability.

5.

Generate only modified files.
