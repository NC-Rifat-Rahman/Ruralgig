# Software Requirements Specification (SRS)
## RuralGig — AI-Powered Micro-Freelance Platform

| Field | Value |
|---|---|
| **Document version** | 1.0 |
| **Date** | 2026-04-23 |
| **Status** | Draft — In Review |
| **Author** | RuralGig Engineering |
| **Standard** | IEEE 830 (adapted) |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Stakeholders and User Classes](#3-stakeholders-and-user-classes)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [System Architecture Constraints](#6-system-architecture-constraints)
7. [External Interface Requirements](#7-external-interface-requirements)
8. [Data Requirements](#8-data-requirements)
9. [AI Requirements](#9-ai-requirements)
10. [Security Requirements](#10-security-requirements)
11. [Constraints and Assumptions](#11-constraints-and-assumptions)
12. [Glossary](#12-glossary)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional and non-functional requirements for **RuralGig** — an AI-powered micro-freelance marketplace designed to connect skilled workers in rural and underserved communities with businesses that need short-term task help. This document serves as the authoritative reference for the development team, QA engineers, stakeholders, and any external evaluators of the system.

### 1.2 Scope

RuralGig consists of:

- A **web platform** (Next.js PWA) accessible on mobile browsers with low-bandwidth optimisation
- A **backend API** of eight NestJS microservices communicating via domain events
- An **AI service** integrating with the Anthropic Claude API for task enhancement, skill extraction, and dispute resolution
- A **payment integration** with bKash (primary) and Stripe (international)
- A **real-time layer** using WebSocket for live task feed updates and notifications

The system is designed primarily for the **Bangladeshi market** (Chattogram pilot), with architecture that supports expansion to other South and Southeast Asian markets.

The following are **out of scope** for version 1.0:
- Native iOS or Android applications (PWA only)
- Video-based task submission or verification
- Escrow dispute arbitration by third parties
- Multi-language support beyond Bangla and English

### 1.3 Definitions and Abbreviations

| Term | Definition |
|---|---|
| **Task** | A discrete unit of work posted by a Business with a defined deliverable, budget, and deadline |
| **Worker** | A registered individual who claims and completes tasks in exchange for payment |
| **Business** | A registered organisation or individual who posts tasks and pays workers |
| **Task Feed** | The paginated, filtered list of OPEN tasks visible to workers |
| **Claim** | The act of a worker reserving a task for exclusive completion |
| **Payout** | The transfer of payment from the platform escrow to a worker's bKash or bank account |
| **Bounded Context** | A DDD concept — a self-contained domain with its own model and language |
| **CQRS** | Command Query Responsibility Segregation — separate read and write models |
| **Domain Event** | An immutable record of a significant business fact that occurred |
| **ACL** | Anti-Corruption Layer — a DDD translation layer between bounded contexts |
| **SLA** | Service Level Agreement — a committed performance target |
| **OTP** | One-Time Password — a time-limited numeric code sent via SMS for authentication |
| **PWA** | Progressive Web App — a web application installable on mobile home screens |
| **bKash** | Bangladesh's largest mobile financial services provider |
| **ADR** | Architecture Decision Record — a document explaining a significant architectural choice |

### 1.4 Overview

Section 2 describes the product context and overall system. Section 3 defines the user classes. Sections 4–10 define the requirements. Section 11 states constraints. Section 12 is the glossary.

Requirements are identified with unique IDs in the format `[CATEGORY-NNN]` for traceability.

---

## 2. Overall Description

### 2.1 Product Perspective

RuralGig is a new standalone product. It does not replace or extend an existing system. It operates as a two-sided marketplace with a platform sitting between Workers (supply) and Businesses (demand).

The system is composed of eight backend microservices, a frontend PWA, and integrations with third-party services:

```
┌─────────────────────────────────────────────────────────────────┐
│                     External Users                               │
│      Workers (mobile PWA)    Businesses (web/mobile PWA)        │
└───────────────┬──────────────────────────┬──────────────────────┘
                │ HTTPS                    │ HTTPS
       ┌────────▼──────────────────────────▼────────┐
       │              Next.js Frontend               │
       │       (PWA — responsive, offline-capable)   │
       └────────────────────┬───────────────────────┘
                            │ REST / WebSocket
                   ┌────────▼────────┐
                   │   API Gateway   │
                   │ (Nginx + NestJS)│
                   └────────┬────────┘
                            │ Internal HTTP / RabbitMQ
        ┌───────────────────┼──────────────────────────┐
        │                   │                          │
  ┌─────▼──────┐  ┌─────────▼──────┐  ┌───────────────▼──┐
  │    auth    │  │    task        │  │     worker        │
  │  service   │  │   service      │  │    service        │
  └────────────┘  └────────┬───────┘  └───────────────────┘
                           │ RabbitMQ (domain events)
         ┌─────────────────┼──────────────────────┐
         │                 │                      │
  ┌──────▼─────┐  ┌────────▼──────┐  ┌───────────▼────────┐
  │  matching  │  │   payment     │  │   notification     │
  │  service   │  │   service     │  │    service         │
  └────────────┘  └────────┬──────┘  └────────────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
          ┌───▼───┐  ┌─────▼───┐  ┌────▼─────┐
          │ bKash │  │ Stripe  │  │ Twilio   │
          └───────┘  └─────────┘  └──────────┘
                   ┌────────────────────┐
                   │    ai-service      │
                   │  (Claude API)      │
                   └────────────────────┘
```

### 2.2 Product Functions (Summary)

The major functions are:

1. **Identity** — Phone-based OTP registration for Workers; email registration for Businesses
2. **Task lifecycle** — Post, browse, claim, submit, approve, pay
3. **AI enhancement** — Task description improvement, skill extraction, quality scoring
4. **Matching** — Algorithmic ranking of Workers against Tasks using skill, location, and rating
5. **Payments** — Escrow-style payment via bKash/Stripe, released on business approval
6. **Real-time** — Live task feed updates, payment notifications via WebSocket and SMS
7. **Fraud detection** — Anomaly scoring, rate limiting, duplicate detection
8. **Dispute resolution** — AI-assisted summarisation for admin review

### 2.3 Operating Environment

| Component | Technology |
|---|---|
| Backend runtime | Node.js 20 LTS |
| Backend framework | NestJS 10 |
| Frontend framework | Next.js 14 (App Router) |
| Primary database | PostgreSQL 16 |
| Cache / read model | Redis 7 |
| Message broker | RabbitMQ 3 |
| Job queues | BullMQ |
| ORM | Prisma 5 |
| Containerisation | Docker + Docker Compose |
| Orchestration | Kubernetes (Phase 4) |
| CI/CD | GitHub Actions |
| Hosting | AWS / Render (Phase 1–2), EKS (Phase 4) |

### 2.4 Design and Implementation Constraints

- All backend services must be written in TypeScript with strict mode enabled
- All inter-service communication for async workflows must use domain events via RabbitMQ (see ADR-001)
- The task feed read model must be served from Redis, not PostgreSQL (see ADR-002)
- All monetary values must be stored as integers in the smallest currency unit (poisha for BDT, cents for USD)
- All domain events must conform to the schema in `packages/shared-events/`
- The system must be deployable with a single `docker compose up -d` command for local development

---

## 3. Stakeholders and User Classes

### 3.1 Worker

**Description:** An individual in a rural or underserved area who has a skill and a smartphone. May have limited English proficiency. Likely uses a mid-range Android device on a 4G connection.

**Goals:** Find tasks matching their skills, complete them reliably, receive payment quickly.

**Technical sophistication:** Low to medium. Comfortable with WhatsApp and Facebook. May not have used a freelance platform before.

**Priority:** High — Workers are the supply side. Without them, the platform has no value for Businesses.

### 3.2 Business

**Description:** A small or medium business, e-commerce seller, or individual entrepreneur who needs short-term task help. May post one task occasionally or many tasks regularly.

**Goals:** Find reliable Workers quickly, pay fairly, approve completed work with confidence.

**Technical sophistication:** Medium. Comfortable with email, online banking, and e-commerce platforms.

**Priority:** High — Businesses generate demand and revenue.

### 3.3 Platform Administrator

**Description:** RuralGig team member with full system access.

**Goals:** Monitor task health, review flagged tasks and disputes, manage payouts, view fraud alerts.

**Technical sophistication:** High.

**Priority:** Medium — Administrators enable trust and safety but are not end users.

### 3.4 NGO / Partner Organisation

**Description:** Organisations like BRAC that supply pre-trained Workers to the platform through a partnership programme.

**Goals:** Track their graduates' employment outcomes. Feed trained workers into the platform.

**Priority:** Low for v1.0 — partnership API is a Phase 3 feature.

---

## 4. Functional Requirements

Requirements are written in the format: **[ID] The system shall...**

Priority levels: **MUST** (v1.0 launch), **SHOULD** (Phase 2), **COULD** (Phase 3).

---

### 4.1 Authentication and Identity (auth-service)

#### 4.1.1 Worker Registration

**[AUTH-001]** MUST — The system shall allow a Worker to register using a Bangladeshi mobile phone number (+880 format).

**[AUTH-002]** MUST — The system shall send a 6-digit OTP to the Worker's phone number via SMS within 10 seconds of a registration request.

**[AUTH-003]** MUST — The system shall reject OTP attempts after 3 incorrect entries and lock the phone number for 15 minutes.

**[AUTH-004]** MUST — The system shall allow a maximum of 5 OTP requests per phone number per hour.

**[AUTH-005]** MUST — Upon successful OTP verification, the system shall create a Worker profile and issue a JWT access token (15-minute expiry) and a refresh token (7-day expiry stored in Redis).

**[AUTH-006]** MUST — The system shall associate the refresh token with the device fingerprint and invalidate all other refresh tokens for the same account when a new login is detected from a different device.

#### 4.1.2 Business Registration

**[AUTH-007]** MUST — The system shall allow a Business to register using an email address and password.

**[AUTH-008]** MUST — The system shall send an email verification link valid for 24 hours to the provided email address.

**[AUTH-009]** MUST — The system shall require a minimum password length of 8 characters containing at least one uppercase letter, one number, and one special character.

**[AUTH-010]** MUST — The system shall hash all passwords using bcrypt with a minimum cost factor of 12 before storage.

#### 4.1.3 Session Management

**[AUTH-011]** MUST — The system shall issue a new access token using the refresh token without requiring re-authentication, provided the refresh token is valid and has not been rotated.

**[AUTH-012]** MUST — The system shall implement refresh token rotation: each use of a refresh token must invalidate it and issue a new one.

**[AUTH-013]** MUST — The system shall provide a logout endpoint that invalidates the current refresh token in Redis.

**[AUTH-014]** MUST — The system shall attach the user's role (WORKER, BUSINESS, ADMIN) to the JWT payload and enforce role-based access control on all protected endpoints.

---

### 4.2 Worker Profile (worker-service)

**[WORKER-001]** MUST — The system shall allow a Worker to set their display name, profile photo, and short bio after registration.

**[WORKER-002]** MUST — The system shall provide a skill tag input with autocomplete, powered by a Trie data structure with O(L) prefix lookup where L is the length of the typed prefix.

**[WORKER-003]** MUST — The system shall allow a Worker to add a maximum of 15 skill tags to their profile.

**[WORKER-004]** MUST — The system shall allow a Worker to set their availability status (available / unavailable). Workers marked unavailable shall not appear in matching results.

**[WORKER-005]** MUST — The system shall display a Worker's aggregate rating (average of all received reviews, rounded to one decimal place) on their public profile.

**[WORKER-006]** MUST — The system shall display a Worker's total completed task count on their public profile.

**[WORKER-007]** MUST — The system shall display a Worker's current wallet balance in BDT.

**[WORKER-008]** SHOULD — The system shall allow a Worker to input their bio in Bangla and auto-extract skill tags using the AI service.

**[WORKER-009]** SHOULD — The system shall allow a Worker to link their bKash mobile wallet number for automatic payouts.

**[WORKER-010]** COULD — The system shall display a Worker's career suggestions generated by the AI service after 5 completed tasks.

---

### 4.3 Task Management (task-service)

#### 4.3.1 Task Creation

**[TASK-001]** MUST — The system shall allow a Business to create a task with the following required fields: title, description, required skills (minimum 1, maximum 8), budget amount, budget currency, estimated hours, and deadline.

**[TASK-002]** MUST — The system shall allow a Business to optionally specify whether the task is remote or location-specific. If location-specific, latitude and longitude coordinates must be provided.

**[TASK-003]** MUST — The system shall allow a Business to save a task as DRAFT before publishing.

**[TASK-004]** MUST — The system shall require all tasks to have a deadline at least 24 hours in the future at the time of creation.

**[TASK-005]** MUST — The system shall enforce the following minimum and maximum budget constraints: minimum ৳100 (10,000 poisha), maximum ৳500,000 (50,000,000 poisha).

**[TASK-006]** SHOULD — When a Business submits a task description, the system shall send the rough description to the AI service and return an enhanced version with structured title, description, deliverables, and suggested skills for the Business to review and accept or edit before publishing.

**[TASK-007]** SHOULD — Before a task is published (status transitions from DRAFT to OPEN), the system shall request an AI quality score. Tasks with an overall quality score below 5/10 or a scam risk score above 7/10 shall be held in a PENDING_REVIEW status and flagged for admin review rather than published immediately.

**[TASK-008]** MUST — The system shall publish a `TaskCreatedEvent` domain event to RabbitMQ when a task transitions from DRAFT to OPEN, containing: taskId, businessId, title, requiredSkills, budget, isRemote, location, deadline, and businessName.

#### 4.3.2 Task State Machine

The task lifecycle is governed by a state machine with the following valid transitions:

```
DRAFT      ──[publish]──► OPEN
OPEN       ──[claim]───► CLAIMED
OPEN       ──[cancel]──► CANCELLED
CLAIMED    ──[submit]──► SUBMITTED
CLAIMED    ──[unclaim]─► OPEN        (worker releases the task)
SUBMITTED  ──[approve]─► APPROVED
SUBMITTED  ──[reject]──► OPEN        (business rejects, task reopens)
APPROVED   ──[pay]─────► PAID
PAID                                 (terminal state)
CANCELLED                            (terminal state)
```

**[TASK-009]** MUST — The system shall enforce the state machine strictly. Any attempt to trigger a transition that is not valid for the current state shall return a 422 Unprocessable Entity error with a descriptive message.

**[TASK-010]** MUST — The system shall publish a domain event for every state transition. Events: `TaskClaimedEvent`, `TaskSubmittedEvent`, `TaskApprovedEvent`, `TaskPaidEvent`, `TaskCancelledEvent`.

**[TASK-011]** MUST — The system shall record the timestamp of every state transition (claimedAt, submittedAt, approvedAt, paidAt) immutably.

#### 4.3.3 Task Claiming

**[TASK-012]** MUST — The system shall allow a Worker to claim a task only if: the task is in OPEN status, the Worker is marked as available, and no other Worker holds a distributed lock on the task at the moment of the claim request.

**[TASK-013]** MUST — The system shall implement a Redis distributed lock (Redlock algorithm) to prevent two Workers from simultaneously claiming the same task. The lock must be acquired before any database write and must have a TTL of 30 seconds.

**[TASK-014]** MUST — The system shall allow a Worker to hold a maximum of 3 active (CLAIMED) tasks simultaneously.

**[TASK-015]** MUST — The system shall allow a Worker to unclaim a task (return it to OPEN) up to 1 hour after claiming it with no penalty. After 1 hour, unclaiming shall decrement the Worker's reliability score.

#### 4.3.4 Task Feed

**[TASK-016]** MUST — The system shall serve the task feed from the Redis read model (per ADR-002), not from a direct PostgreSQL query.

**[TASK-017]** MUST — The task feed shall be paginated with a default page size of 20 and a maximum of 100 items per page.

**[TASK-018]** MUST — The task feed shall support the following filters: required skills (intersection match), minimum budget, maximum budget, remote only, maximum distance (km) from Worker location.

**[TASK-019]** MUST — The task feed shall return results in reverse chronological order (newest first) by default.

**[TASK-020]** MUST — The task feed endpoint shall have a p99 response time of under 50ms measured at the service boundary.

**[TASK-021]** SHOULD — The system shall maintain per-skill sorted sets in Redis enabling O(1) amortised skill-filtered feed queries using ZINTERSTORE.

---

### 4.4 Matching Engine (matching-service)

**[MATCH-001]** MUST — When a Worker opens the task feed, the system shall return a personalised ranking of OPEN tasks scored by a composite algorithm combining: skill overlap score (weight: 0.5), location proximity score (weight: 0.2), business rating score (weight: 0.2), task urgency score (weight: 0.1).

**[MATCH-002]** MUST — The skill overlap score shall be calculated as the ratio of matched required skills to total required skills: `matched_skills / total_required_skills` (range 0.0–1.0).

**[MATCH-003]** MUST — The location proximity score shall be calculated using the Haversine formula. Tasks within 5km of the Worker's location score 1.0; tasks beyond 50km score 0.0; linear interpolation between.

**[MATCH-004]** MUST — The task urgency score shall be calculated as `1 - (hours_until_deadline / 168)` clamped to [0, 1], where 168 is hours in a week. Tasks due within 24 hours score highest.

**[MATCH-005]** MUST — The composite scorer shall implement the Strategy pattern. Each scoring dimension (skill, location, business rating, urgency) shall be a separate `ScoringStrategy` class implementing a common interface.

**[MATCH-006]** MUST — The match filter pipeline shall implement the Chain of Responsibility pattern. Filters applied in order: AvailabilityFilter → SkillMinimumFilter (at least 1 skill must match) → BudgetFilter → DeadlineFilter. Tasks failing any filter are excluded before scoring.

**[MATCH-007]** SHOULD — The matching service shall maintain a priority queue (min-heap) of OPEN tasks sorted by urgency score, enabling O(log n) retrieval of the most urgent unmatched tasks.

**[MATCH-008]** SHOULD — When a new task is posted, the system shall proactively notify the top 10 matched Workers in real time via WebSocket.

---

### 4.5 Payments (payment-service)

#### 4.5.1 Payment Flow

**[PAY-001]** MUST — When a Business creates a task with status OPEN, the system shall place the budget amount in a platform-held escrow (not charged yet — charged only when work is approved).

**[PAY-002]** MUST — When a Business approves submitted work, the system shall initiate a payout to the Worker's bKash wallet for the task budget minus the platform fee (10%).

**[PAY-003]** MUST — The payout flow shall be implemented as a Saga with the following steps and compensating transactions:

```
Step 1: Mark task as APPROVED (task-service)
  Compensating: Revert task to SUBMITTED

Step 2: Deduct budget from business escrow (payment-service)
  Compensating: Refund escrow

Step 3: Credit Worker wallet (worker-service)
  Compensating: Debit Worker wallet

Step 4: Initiate bKash payout (payment-service → bKash API)
  Compensating: Cancel bKash transfer if within cancellation window

Step 5: Mark task as PAID (task-service)
  No compensation needed — terminal state
```

**[PAY-004]** MUST — All payment operations shall include an idempotency key (composed of taskId + workerId + transactionType) stored in Redis. Duplicate requests with the same idempotency key shall return the cached result without re-executing.

**[PAY-005]** MUST — The system shall implement a circuit breaker on all calls to the bKash API. After 5 consecutive failures within 60 seconds, the circuit shall open and return a 503 error. The circuit shall attempt to close after 30 seconds.

**[PAY-006]** MUST — All wallet operations shall use double-entry bookkeeping. Every credit to a Worker wallet must have a corresponding debit from the escrow ledger. No money shall be created or destroyed by the system.

**[PAY-007]** SHOULD — The system shall support Stripe as a secondary payment gateway for international businesses, implemented behind the same `PaymentGateway` interface (Adapter pattern).

#### 4.5.2 Revenue

**[PAY-008]** MUST — The platform shall deduct a 10% service fee from the task budget before releasing payment to the Worker.

**[PAY-009]** MUST — The service fee breakdown shall be stored in the transaction ledger: `gross_amount`, `platform_fee`, `net_amount_to_worker`.

**[PAY-010]** COULD — The system shall support Business SaaS subscriptions at ৳2,000/month or ৳5,000/month, implemented as a Stripe recurring subscription.

---

### 4.6 Notifications (notification-service)

**[NOTIF-001]** MUST — The system shall send an SMS notification to a Worker when: a task they expressed interest in is posted (if SHOULD-MATCH-008 is implemented), their task claim is confirmed, their submitted work is approved, their payment is released.

**[NOTIF-002]** MUST — The system shall send an SMS notification to a Business when: a Worker claims their task, a Worker submits work for review, a payout has been processed.

**[NOTIF-003]** MUST — All notification channels (SMS, email, in-app) shall be implemented as subclasses of a `BaseNotification` abstract class (Template Method pattern), sharing a common send → validate → log → deliver lifecycle.

**[NOTIF-004]** MUST — The notification service shall consume domain events from RabbitMQ and react asynchronously. Notification delivery shall never block a write operation in another service.

**[NOTIF-005]** MUST — The system shall implement a WebSocket gateway that pushes real-time task feed updates to connected Workers when a new task is published that matches their skills.

**[NOTIF-006]** SHOULD — The system shall respect per-user notification preferences: Workers shall be able to disable SMS notifications while retaining in-app notifications, and vice versa.

**[NOTIF-007]** SHOULD — The system shall support digest notifications: a daily SMS summary for Workers showing new tasks matching their skills, sent at a configurable time (default: 9am local time).

---

### 4.7 Dispute Resolution (admin-service)

**[DISPUTE-001]** MUST — The system shall provide a mechanism for a Business to reject submitted work with a written reason, returning the task to OPEN status.

**[DISPUTE-002]** MUST — After 2 rejections of the same submission, the task shall be escalated to DISPUTED status and assigned to an admin for review.

**[DISPUTE-003]** SHOULD — When a task is escalated to DISPUTED, the system shall call the AI service to generate a neutral 3-point summary of the dispute (what the worker claims, what the business claims, what the evidence shows), and attach it to the admin review ticket.

**[DISPUTE-004]** MUST — An admin shall be able to resolve a dispute in favour of the Worker (release payment), in favour of the Business (refund escrow), or split the payment at a configurable percentage.

---

### 4.8 Referral System

**[REFER-001]** SHOULD — Each registered Worker and Business shall have a unique referral link.

**[REFER-002]** SHOULD — When a referred Worker completes their first task, the referring Worker shall receive ৳100 platform credit.

**[REFER-003]** SHOULD — When a referred Business posts their first task (and it is completed), the referring Business shall receive ৳500 platform credit.

**[REFER-004]** SHOULD — Platform credit shall be applicable as a discount on the platform's service fee on future tasks, not withdrawable as cash.

---

### 4.9 Admin Dashboard

**[ADMIN-001]** MUST — The admin dashboard shall display: total tasks by status, total Workers registered, total Businesses registered, total payout volume (BDT), tasks flagged for fraud or review.

**[ADMIN-002]** MUST — An admin shall be able to search for any task, Worker, or Business by ID or name.

**[ADMIN-003]** MUST — An admin shall be able to manually change a task's status, override a payout, and suspend or reinstate a Worker or Business account.

**[ADMIN-004]** SHOULD — The system shall flag tasks and Workers for review based on the following fraud signals: task completion time more than 2 standard deviations below the mean for that task type, Worker account with more than 3 dispute escalations in 30 days, duplicate task submission (detected via Bloom filter), suspicious rating pattern (detected via graph cycle detection on the review graph).

---

## 5. Non-Functional Requirements

### 5.1 Performance

**[PERF-001]** The task feed endpoint (`GET /api/v1/tasks`) shall achieve a p99 response time of **≤ 50ms** under a load of 1,000 concurrent users.

**[PERF-002]** The task claim endpoint (`POST /api/v1/tasks/:id/claim`) shall achieve a p99 response time of **≤ 100ms**.

**[PERF-003]** The task creation endpoint (`POST /api/v1/tasks`) including AI enhancement shall achieve a p99 response time of **≤ 3,000ms**. The AI enhancement call is made asynchronously after the task is saved; the endpoint returns as soon as the task is persisted.

**[PERF-004]** The skill tag autocomplete endpoint shall achieve a p99 response time of **≤ 10ms** for any prefix of length ≥ 2.

**[PERF-005]** The payment Saga shall complete (Worker receives bKash payment) within **5 minutes** of a Business approving work under normal conditions.

**[PERF-006]** SMS notifications shall be delivered within **60 seconds** of the triggering domain event under normal conditions.

**[PERF-007]** The system shall support **500 concurrent WebSocket connections** per `notification-service` instance without degradation.

### 5.2 Availability

**[AVAIL-001]** The platform shall target **99.5% uptime** (measured monthly), allowing approximately 3.6 hours of downtime per month.

**[AVAIL-002]** Planned maintenance windows shall be scheduled between 02:00–04:00 Bangladesh Standard Time (BST, UTC+6) on weekdays.

**[AVAIL-003]** The task feed shall degrade gracefully if Redis is unavailable: the system shall fall back to a PostgreSQL query (slower, but functional) and log a warning. Redis unavailability shall not cause a 5xx error on the task feed endpoint.

**[AVAIL-004]** A bKash API outage shall not prevent task claiming or task approval. Payments shall be queued and retried when the bKash API recovers. The Worker shall be notified of any delay exceeding 15 minutes.

### 5.3 Scalability

**[SCALE-001]** The system shall be architected to support horizontal scaling of any individual service independently (stateless services behind a load balancer).

**[SCALE-002]** The task feed read path (Redis) shall be scalable to handle **10,000 concurrent task feed requests per second** using Redis Cluster, without changes to the application code.

**[SCALE-003]** The RabbitMQ event bus shall support message persistence and at-least-once delivery guarantees. Consumer groups shall allow multiple instances of each service to process events concurrently without duplicate processing.

**[SCALE-004]** Each service shall be individually deployable without restarting other services (independent deployability, as established in ADR-001).

### 5.4 Reliability

**[REL-001]** No domain event shall be permanently lost due to a transient infrastructure failure. The Outbox Pattern (per ADR-001) shall ensure events are durably stored before being published to RabbitMQ.

**[REL-002]** All RabbitMQ consumers shall implement manual acknowledgement: a message shall only be acknowledged after it has been successfully processed. Failed processing shall result in the message being moved to a dead-letter queue for inspection and retry.

**[REL-003]** All payment operations shall be idempotent. Retrying a payment request with the same idempotency key shall never result in a double charge.

**[REL-004]** The system shall have automated database migration management (Prisma Migrate). All migrations shall be applied atomically and shall be reversible.

### 5.5 Usability

**[USE-001]** The Worker-facing task feed shall load and be interactive within **3 seconds** on a 4G connection with a mid-range Android device.

**[USE-002]** The Worker registration flow (phone entry → OTP → profile setup) shall be completable in under **3 minutes** by a first-time user.

**[USE-003]** All user-facing error messages shall be written in plain language. Technical error codes shall only appear in logs, not in the UI.

**[USE-004]** The platform shall support Bangla script in all user-generated text fields (task titles, descriptions, bios).

**[USE-005]** The platform PWA shall be installable on Android home screens and shall function with reduced capability in offline mode (cached task feed, queued actions).

### 5.6 Maintainability

**[MAINT-001]** All services shall have unit test coverage of at least **80%** for domain logic and at least **60%** for infrastructure code.

**[MAINT-002]** All NestJS services shall expose a health check endpoint (`GET /health`) returning HTTP 200 when operational.

**[MAINT-003]** All services shall use structured JSON logging (Pino) with the following fields on every log line: `level`, `service`, `correlationId`, `timestamp`, `message`.

**[MAINT-004]** All inter-service events shall carry a `schemaVersion` field. Breaking changes to an event schema shall introduce a new event type suffix (e.g. `task.claimed.v2`) rather than modifying the existing schema.

**[MAINT-005]** All significant architectural decisions shall be documented in ADR format in `docs/adr/` before the corresponding code is written.

---

## 6. System Architecture Constraints

**[ARCH-001]** Services shall communicate asynchronously via RabbitMQ domain events for all cross-context workflows, as defined in ADR-001. Synchronous HTTP calls between services shall only be used for query operations where a real-time response is required by the calling service.

**[ARCH-002]** Each service shall own its own PostgreSQL schema. No service shall read from or write to another service's schema directly.

**[ARCH-003]** The task feed shall be served from the Redis read model, not from PostgreSQL, as defined in ADR-002.

**[ARCH-004]** All monetary values shall be stored and transmitted as integers in the smallest unit of the relevant currency (poisha for BDT, cents for USD). Floating-point types shall never be used for monetary values.

**[ARCH-005]** The `Task` aggregate root shall be the sole entry point for all task state changes. No service shall modify the `tasks` table directly without going through the `Task` aggregate.

**[ARCH-006]** All domain events shall be published to RabbitMQ via the Outbox Pattern. Direct publishing without an outbox is prohibited in production.

**[ARCH-007]** The AI service shall be the only service that calls the Anthropic Claude API. No other service shall hold an Anthropic API key or call the Claude API directly.

---

## 7. External Interface Requirements

### 7.1 Anthropic Claude API

| Attribute | Value |
|---|---|
| **Endpoint** | `https://api.anthropic.com/v1/messages` |
| **Models used** | claude-haiku-4-5 (skill extraction, task scoring), claude-sonnet-4-6 (dispute summarisation, career advice) |
| **Authentication** | API key in `x-api-key` header |
| **Rate limit** | Governed by Anthropic account tier — monitor with daily spend cap |
| **Timeout** | 10 seconds per request — if exceeded, the task is saved without AI enhancement |
| **Error handling** | Circuit breaker: after 3 consecutive failures, bypass AI enhancement and save task with `aiEnhanced: false` |

### 7.2 bKash API

| Attribute | Value |
|---|---|
| **Environment** | Sandbox (Phase 1–3), Production (Phase 4) |
| **Authentication** | OAuth2 client credentials grant |
| **Key operations** | Create payment, execute payment, query payment status, refund |
| **Timeout** | 30 seconds — exceeded triggers the Saga compensating transaction |
| **Error handling** | Circuit breaker (5 failures / 60 seconds), dead-letter queue for failed payouts |

### 7.3 Twilio (SMS)

| Attribute | Value |
|---|---|
| **Operation** | Send SMS via REST API |
| **Authentication** | Account SID + Auth Token |
| **Rate limit** | 1 SMS/second per sending number (configurable with multiple numbers) |
| **Error handling** | Retry with exponential backoff (1s, 2s, 4s, max 3 retries) |
| **Fallback** | If Twilio fails after retries, notification is logged and admin is alerted. Core platform functionality continues. |

### 7.4 Stripe

| Attribute | Value |
|---|---|
| **Usage** | International business payments, SaaS subscriptions |
| **Integration** | Stripe Payment Intents API + Stripe Billing for subscriptions |
| **Webhooks** | `payment_intent.succeeded`, `payment_intent.failed`, `invoice.paid` |
| **Authentication** | Secret key (server-side), publishable key (client-side) |

---

## 8. Data Requirements

### 8.1 Data Retention

**[DATA-001]** Task records shall be retained for a minimum of **7 years** after completion, for financial and legal compliance.

**[DATA-002]** Domain event logs (RabbitMQ durable queues and Outbox table) shall be retained for a minimum of **90 days** for debugging and event replay capability.

**[DATA-003]** OTP codes shall be stored in Redis with a TTL of **5 minutes** and deleted immediately upon successful verification.

**[DATA-004]** Refresh tokens shall be stored in Redis with a TTL matching their expiry (7 days). Revoked tokens shall be deleted immediately.

### 8.2 Data Privacy

**[DATA-005]** Worker phone numbers shall be stored encrypted at rest using AES-256.

**[DATA-006]** Payment card details shall never be stored by the platform — all card data is handled exclusively by Stripe's PCI-DSS compliant infrastructure.

**[DATA-007]** The platform shall support a "right to deletion" request: upon a Worker's account deletion, their personal data (name, phone, bio, photo) shall be anonymised. Task records (amounts, dates, skills) shall be retained in anonymised form for financial compliance.

**[DATA-008]** Worker location data shall only be used for task matching and shall never be displayed to Businesses or other Workers.

### 8.3 Backup and Recovery

**[DATA-009]** PostgreSQL databases shall be backed up daily with a retention period of 30 days. Point-in-time recovery shall be supported to within 5 minutes.

**[DATA-010]** The Redis read model shall be recoverable from the PostgreSQL write model and the domain event log within **30 minutes** of a complete Redis failure.

---

## 9. AI Requirements

**[AI-001]** MUST — The AI task description enhancer shall accept a free-text description of up to 1,000 characters and return a structured JSON object with: `title` (5–10 words), `description` (2 sentences), `requiredSkills` (array, max 8), `deliverables` (array), `estimatedHours` (number).

**[AI-002]** MUST — The AI skill extractor shall accept a free-text worker bio of up to 500 characters and return a JSON array of up to 8 lowercase, hyphenated skill tag strings.

**[AI-003]** MUST — The AI task quality scorer shall return a JSON object with: `clarity` (1–10), `fairness` (1–10), `scamRisk` (1–10), `overall` (1–10), `flags` (array of strings). A task with `scamRisk` > 7 or `overall` < 5 shall be routed to admin review.

**[AI-004]** SHOULD — The AI match explainer shall accept a worker profile and a task, and return a single sentence explaining the match quality.

**[AI-005]** SHOULD — The AI dispute summariser shall accept the full message thread and submission record for a disputed task, and return a 3-point neutral summary for admin review.

**[AI-006]** SHOULD — The AI career advisor shall accept a worker's task history (last 10 completed tasks) and return a JSON array of 3 skill development suggestions, each with `skillName`, `rationale`, and `estimatedPayUpliftPercent`.

**[AI-007]** COULD — The AI Bangla translator shall accept an English task description and return a natural Bangla translation, keeping skill tag names in English.

**[AI-008]** MUST — All AI calls shall time out after 10 seconds. On timeout, the system shall proceed without AI enhancement and log a warning. AI failure shall never cause a user-facing error on core operations (task creation, task claiming).

**[AI-009]** MUST — All AI prompts shall instruct the model to respond in JSON only. All AI responses shall be parsed with try/catch. On JSON parse failure, the system shall fall back to the non-AI flow and log the raw response for debugging.

**[AI-010]** MUST — The AI service shall log every API call with: model used, token count (input + output), latency, task type, and cost estimate. A daily spend cap shall be configured in the Anthropic console.

---

## 10. Security Requirements

**[SEC-001]** All API endpoints shall be served over HTTPS. HTTP connections shall be redirected to HTTPS with a 301 response.

**[SEC-002]** All authentication endpoints shall implement rate limiting: maximum 5 requests per IP per minute for login, maximum 3 OTP requests per phone number per 15 minutes.

**[SEC-003]** All database queries shall use parameterised statements via Prisma ORM. Raw SQL queries are prohibited.

**[SEC-004]** All user-supplied input shall be validated and sanitised by the NestJS `ValidationPipe` using `class-validator` decorators before reaching any business logic.

**[SEC-005]** The API Gateway shall implement global rate limiting: maximum 1,000 requests per IP per hour for authenticated users, 100 requests per IP per hour for unauthenticated endpoints.

**[SEC-006]** All services shall run as non-root users inside Docker containers.

**[SEC-007]** The `ANTHROPIC_API_KEY`, `JWT_SECRET`, bKash credentials, and database connection strings shall never be committed to version control. They shall be stored in environment variables and injected via a secrets manager in production.

**[SEC-008]** The system shall implement OWASP Top 10 mitigations. A dependency vulnerability scan (Snyk or npm audit) shall be run in CI on every pull request.

**[SEC-009]** All Worker phone numbers and Business email addresses shall be stored encrypted at rest.

**[SEC-010]** The admin dashboard shall be restricted to IP allowlisted addresses and shall require multi-factor authentication (TOTP).

---

## 11. Constraints and Assumptions

### 11.1 Constraints

- The platform must operate within the legal framework for online freelance marketplaces in Bangladesh, including applicable tax withholding obligations on payouts exceeding certain thresholds.
- bKash API access requires a merchant account approved by BRAC Bank. This approval process may take 4–8 weeks and must be initiated in Phase 1.
- The Claude API is a paid service. A monthly budget cap must be configured in the Anthropic console. The system must operate correctly when the cap is reached by falling back to non-AI flows.
- All SMS notifications to Bangladeshi numbers must comply with BTRC regulations regarding commercial messaging.

### 11.2 Assumptions

- Workers have access to a smartphone (Android 8+) with a mobile data connection of at least 3G.
- Workers have a Bangladeshi mobile number registered with one of the major operators (Grameenphone, Robi, Banglalink, Teletalk).
- The majority of Workers will access the platform via mobile browser, not desktop.
- Businesses have access to internet banking or a bKash merchant wallet for funding escrow.
- Task budgets and payouts will be denominated primarily in BDT. USD support is a secondary requirement for international businesses.
- The initial pilot will be geographically constrained to the Chattogram metropolitan area for the first 90 days.

---

## 12. Glossary

| Term | Definition |
|---|---|
| **Aggregate Root** | The DDD pattern designating a single domain object (e.g. `Task`) as the entry point for all state changes within a cluster of related objects. |
| **Anti-Corruption Layer (ACL)** | A translation component that converts data from one bounded context's language into another's, preventing model contamination. |
| **Bounded Context** | A DDD concept — a self-contained portion of the domain with its own model, language, and data ownership boundary. Maps 1:1 to a NestJS service in this system. |
| **Circuit Breaker** | A resilience pattern that temporarily disables calls to a failing external service after a threshold of failures, preventing cascading failures. |
| **CQRS** | Command Query Responsibility Segregation — the pattern of maintaining separate data models for write operations (commands) and read operations (queries). |
| **Dead-letter Queue (DLQ)** | A RabbitMQ queue that receives messages that could not be successfully processed, for inspection and manual retry. |
| **Domain Event** | An immutable, past-tense record of a significant business fact. Raised by an aggregate root after a state change. Published to RabbitMQ for cross-context communication. |
| **Event Sourcing** | A pattern where the state of an entity is derived by replaying a sequence of immutable domain events, rather than reading a current-state database row. |
| **Event Storming** | A collaborative DDD workshop technique used to discover domain events, commands, aggregates, and bounded context boundaries. |
| **Idempotency** | The property of an operation that can be safely applied multiple times without changing the result beyond the first application. Critical for payment operations. |
| **Min-Heap** | A binary heap data structure where the minimum element is always at the root. Used in the matching service for priority queue of urgent tasks. |
| **Outbox Pattern** | A reliability pattern where domain events are stored in a transactional outbox table (in the same DB transaction as the state change) before being published to the message broker. |
| **Redlock** | A distributed mutual exclusion algorithm using Redis. Used to prevent two workers from simultaneously claiming the same task. |
| **Saga** | A DDD pattern for managing long-running, cross-service business transactions using a sequence of local transactions and compensating transactions for rollback. |
| **SLA** | Service Level Agreement — a committed target for system behaviour (e.g. p99 response time). |
| **Trie** | A tree data structure for storing strings, enabling O(L) prefix search where L is the length of the prefix. Used for skill tag autocomplete. |
| **Ubiquitous Language** | The shared vocabulary within a DDD bounded context, used consistently in code, documentation, and conversations between developers and domain experts. |
| **ZINTERSTORE** | A Redis command that computes the intersection of multiple sorted sets. Used for skill-filtered task feed queries. |