# RuralGig

**AI-powered micro-freelance platform connecting skilled workers in rural and underserved communities with businesses that need short-term task help.**

> Built with Node.js · NestJS · TypeScript · PostgreSQL · Redis · RabbitMQ · Next.js · Claude API

---

## The Problem

Millions of skilled people in Bangladesh and across South Asia — data entry workers, translators, graphic designers, bookkeepers — cannot access the digital gig economy. Platforms like Upwork and Fiverr require strong English, a credit card, and a professional portfolio. Most rural workers have none of these, even though they have real, valuable skills and a smartphone.

At the same time, thousands of small businesses and e-commerce sellers post tasks to WhatsApp groups and Facebook, manually chasing reliable workers for hours or days.

**RuralGig closes that gap.**

---

## What It Does

A worker signs up with their phone number, writes a short bio in Bangla or English, and the AI extracts their skills automatically. A business posts a rough task description and the AI rewrites it into a clear, structured posting with deliverables and a fair budget estimate. The matching engine scores and ranks available workers by skill, location, and rating, then notifies the best matches in real time.

When a worker completes a task and the business approves it, payment is sent directly to the worker's bKash wallet — no bank account needed.

```
Business posts task → AI enhances it → Matching engine finds best workers
→ Worker claims task → Worker submits work → Business approves
→ Payment released to worker's bKash wallet instantly
```

---

## AI Features (Claude API)

| Feature | What it does |
|---|---|
| **Task description enhancer** | Rewrites rough business input into a structured, clear task posting |
| **Skill extractor** | Reads a worker's bio and extracts structured skill tags automatically |
| **Task quality scorer** | Scores tasks 1–10 for clarity, fairness, and scam risk before publishing |
| **Match explainer** | Generates a 1-sentence explanation of why a worker was matched to a task |
| **Dispute summariser** | Writes a neutral 3-point summary for admin when worker and business disagree |
| **Career path advisor** | Suggests higher-paying skills to learn based on a worker's task history |
| **Bangla translator** | Translates task descriptions to natural Bangla for rural workers |

---

## Architecture

RuralGig is a **NestJS microservices monorepo** (Turborepo) where each service owns its own PostgreSQL schema and communicates via **RabbitMQ domain events**. Services never read each other's databases directly.

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│              (worker PWA + business dashboard)           │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
              ┌────────▼────────┐
              │   API Gateway   │  ← Nginx + rate limiting
              └────────┬────────┘
                       │
        ┌──────────────┼──────────────────┐
        │              │                  │
  ┌─────▼──────┐ ┌─────▼──────┐ ┌────────▼───────┐
  │    auth    │ │    task    │ │    worker      │
  │  service   │ │  service   │ │   service      │
  └────────────┘ └─────┬──────┘ └────────────────┘
                       │ domain events
              ┌────────▼────────┐
              │    RabbitMQ     │  ← event bus
              └────────┬────────┘
        ┌──────────────┼──────────────────┐
        │              │                  │
  ┌─────▼──────┐ ┌─────▼──────┐ ┌────────▼───────┐
  │  matching  │ │  payment   │ │ notification   │
  │  service   │ │  service   │ │   service      │
  └────────────┘ └────────────┘ └────────────────┘
                                ┌────────────────┐
                                │   ai-service   │  ← Claude API
                                └────────────────┘
```

### Services

| Service | Port | Responsibility |
|---|---|---|
| `api-gateway` | 3000 | Public entrypoint, rate limiting, auth forwarding |
| `auth-service` | 3001 | Phone OTP, JWT access + refresh tokens |
| `task-service` | 3002 | Task CRUD, CQRS, state machine, event publishing |
| `worker-service` | 3003 | Worker profiles, skill Trie, ratings, earnings |
| `matching-service` | 3004 | Bipartite matching, priority queue ranking |
| `payment-service` | 3005 | Saga orchestration, bKash + Stripe adapters |
| `notification-service` | 3006 | WebSocket gateway, SMS, email |
| `ai-service` | 3007 | Claude API: task enhancer, skill extractor |

### Infrastructure

| Tool | Purpose |
|---|---|
| PostgreSQL 16 | Primary data store (one schema per service) |
| Redis 7 | CQRS read model cache, distributed locks, rate limiting |
| RabbitMQ 3 | Async domain event bus between services |
| BullMQ | Job queues (digest emails, scheduled payouts) |

---

## Design Patterns

See [`docs/PATTERNS.md`](docs/PATTERNS.md) for the full catalogue with code examples and rationale.

| Pattern | Where used |
|---|---|
| **CQRS** | `task-service` — separate read/write models |
| **Repository** | All services — abstract DB access behind interfaces |
| **Factory** | `task-service` — `TaskFactory` enforces domain invariants |
| **State Machine** | `task-service` — `TaskStateMachine` guards valid transitions |
| **Strategy** | `matching-service` — pluggable scoring algorithms |
| **Chain of Responsibility** | `matching-service` — match filter pipeline |
| **Observer / Domain Events** | All services — RabbitMQ event bus |
| **Adapter** | `payment-service` — bKash and Stripe behind one interface |
| **Saga** | `payment-service` — distributed payout transaction |
| **Outbox** | `task-service` — reliable event publishing |
| **Specification** | `matching-service` — composable match criteria |
| **Decorator** | `matching-service` — logged scorer wraps any strategy |

---

## DSA Implementations

| Algorithm / Structure | Where | Complexity |
|---|---|---|
| **Trie** | `worker-service` — skill tag autocomplete | O(L) lookup |
| **Min-Heap / Priority Queue** | `matching-service` — urgent task scheduling | O(log n) insert |
| **Weighted Bipartite Matching** | `matching-service` — worker-to-task assignment | O(V·E) |
| **Redlock** | `task-service` — distributed claim mutex | O(1) |
| **Sliding Window** | `api-gateway` + `admin-service` — rate limiting | O(1) amortised |
| **Bloom Filter** | `admin-service` — duplicate submission detection | O(k) |
| **Z-Score Anomaly Detection** | `admin-service` — fraud scoring | O(n) |
| **Haversine Formula** | `matching-service` — proximity scoring | O(1) |

---

## Monorepo Structure

```
ruralgig/
├── apps/
│   ├── web/                    # Next.js 14 frontend
│   ├── api-gateway/            # NestJS — public entrypoint
│   ├── auth-service/           # NestJS — JWT, OTP
│   ├── task-service/           # NestJS — CQRS, task lifecycle  ← start here
│   ├── worker-service/         # NestJS — profiles, skills
│   ├── matching-service/       # NestJS — algorithms
│   ├── payment-service/        # NestJS — bKash, Saga
│   ├── notification-service/   # NestJS — WebSocket, SMS
│   └── ai-service/             # NestJS — Claude API
├── packages/
│   ├── shared-types/           # TypeScript domain interfaces
│   ├── shared-events/          # RabbitMQ event schemas
│   ├── shared-utils/           # Money, Pagination helpers
│   └── shared-db/              # Prisma base config
├── infra/
│   ├── docker-compose.yml      # Local dev infrastructure
│   └── k8s/                    # Kubernetes Helm charts
└── docs/
    ├── adr/                    # Architecture Decision Records
    └── PATTERNS.md             # Design patterns catalogue
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker Desktop
- Git

### 1. Clone and install

```bash
git clone https://github.com/yourusername/ruralgig.git
cd ruralgig
npm install
```

### 2. Start infrastructure

```bash
cd infra
docker compose up -d
```

This starts:
- PostgreSQL at `localhost:5432`
- Redis at `localhost:6379`
- RabbitMQ at `localhost:5672` (management UI at `http://localhost:15672`)
- pgAdmin at `http://localhost:8080`

### 3. Configure environment

```bash
# Copy the example env file for each service you're running
cp apps/task-service/.env.example apps/task-service/.env
# Edit with your local values
```

### 4. Run database migrations

```bash
cd apps/task-service
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start the task service

```bash
# From root — starts all services in parallel
npx turbo dev

# Or just the task service
cd apps/task-service
npm run dev
```

Swagger UI will be available at `http://localhost:3002/docs`

---

## API Overview

Full OpenAPI spec at [`docs/openapi.yaml`](docs/openapi.yaml).
Interactive Swagger UI at `http://localhost:3002/docs` when running locally.

### Task endpoints

```
POST   /api/v1/tasks              Create a task (business only)
GET    /api/v1/tasks              Browse open tasks (worker feed)
GET    /api/v1/tasks/:id          Get a single task
PATCH  /api/v1/tasks/:id          Update a task (draft only)
POST   /api/v1/tasks/:id/claim    Claim a task (worker only)
POST   /api/v1/tasks/:id/submit   Submit completed work
POST   /api/v1/tasks/:id/approve  Approve submitted work (business only)
POST   /api/v1/tasks/:id/cancel   Cancel a task
DELETE /api/v1/tasks/:id          Delete a draft task
```

---

## Running Tests

```bash
# All services
npx turbo test

# Single service with coverage
cd apps/task-service
npm run test:cov
```

---

## Architecture Decision Records

All major architectural decisions are documented in [`docs/adr/`](docs/adr/).

| ADR | Decision |
|---|---|
| [ADR-001](docs/adr/ADR-001.md) | Why event-driven architecture over synchronous REST between services |
| ADR-002 | Why CQRS for the task feed *(coming soon)* |
| ADR-003 | Why Saga over 2-phase commit for payments *(coming soon)* |
| ADR-004 | Why bipartite matching over keyword search *(coming soon)* |
| ADR-005 | Why schema-per-service over shared database *(coming soon)* |

---

## Revenue Model

| Phase | Stream | Detail |
|---|---|---|
| Month 1–2 | Free | Build trust. Collect real usage data. |
| Month 3+ | 10% platform fee | On every completed task payout. Workers keep 90%. |
| Month 5+ | Business SaaS | $20–50/month for bulk posting + analytics. |
| Month 8+ | Premium worker profiles | $5/month for verified badge + higher ranking. |

---

## Social Impact

RuralGig is designed specifically for the Bangladesh and South Asian market:

- **Phone-first onboarding** — workers register with a phone number, not an email
- **Bangla language support** — all task descriptions auto-translated via Claude API
- **bKash payments** — workers receive earnings directly to mobile wallet, no bank required
- **NGO partnerships** — BRAC training graduates fed directly into the worker supply pool
- **Offline-resilient PWA** — designed for low-connectivity environments

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Follow the [Conventional Commits](https://www.conventionalcommits.org/) format
4. Open a pull request against `develop` (not `main`)
5. Fill in the PR template — the design pattern question is not optional
