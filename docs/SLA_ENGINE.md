# SLA Calculation Engine

## Overview
CivicPulse calculates statutory Service Level Agreement (SLA) deadlines based on issue severity to track overdue cases and trigger escalation.

## Target SLA Matrix

| Severity Level | Hazard Priority | SLA Target Deadline |
| :---: | :--- | :---: |
| **5** | Critical Hazard (e.g. Open Sewer / Fallen Tree) | 48 Hours (2 Days) |
| **4** | High Priority (e.g. Deep Pothole / Main Leak) | 5 Days |
| **3** | Moderate Priority (e.g. Broken Footpath) | 7 Days |
| **2** | Low Priority (e.g. Minor Streetlight) | 14 Days |
| **1** | Advisory Report | 30 Days |

## Metric Fields
- `sla_deadline`: ISO timestamp when SLA expires.
- `time_remaining_hours`: Floating point remaining hours (negative if overdue).
- `is_overdue`: Boolean flag indicating SLA breach.
