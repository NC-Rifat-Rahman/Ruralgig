/**
 * packages/shared-types/src/index.ts
 *
 * Single source of truth for all domain types shared across every service
 * and the Next.js frontend. No service ever duplicates these — they import
 * from '@ruralgig/shared-types' instead.
 *
 * Rule: If a field exists in the database, it is defined here first.
 */

// ─────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────

/**
 * Every user in the system has exactly one role.
 * Role determines which guards, guards, and UI views they access.
 */
export enum UserRole {
  WORKER   = 'WORKER',
  BUSINESS = 'BUSINESS',
  ADMIN    = 'ADMIN',
}

/**
 * Task lifecycle — ordered state machine.
 *
 * Valid transitions:
 *   DRAFT      → OPEN        (business publishes)
 *   OPEN       → CLAIMED     (worker claims — distributed lock)
 *   CLAIMED    → SUBMITTED   (worker submits deliverables)
 *   SUBMITTED  → APPROVED    (business approves)
 *   SUBMITTED  → DISPUTED    (business disputes submission)
 *   APPROVED   → PAID        (payment saga completes)
 *   DISPUTED   → APPROVED    (dispute resolved in worker's favour)
 *   DISPUTED   → CANCELLED   (dispute resolved in business's favour)
 *   *          → CANCELLED   (any actor cancels within allowed window)
 */
export enum TaskStatus {
  DRAFT     = 'DRAFT',
  OPEN      = 'OPEN',
  CLAIMED   = 'CLAIMED',
  SUBMITTED = 'SUBMITTED',
  APPROVED  = 'APPROVED',
  DISPUTED  = 'DISPUTED',
  PAID      = 'PAID',
  CANCELLED = 'CANCELLED',
}

/** Supported currencies. BDT is the default for all domestic transactions. */
export enum Currency {
  BDT = 'BDT',  // Bangladeshi Taka
  USD = 'USD',  // For international businesses using Stripe
}

/** Payment gateway used to process a payout. */
export enum PaymentGateway {
  BKASH  = 'BKASH',
  STRIPE = 'STRIPE',
  WALLET = 'WALLET', // Internal platform wallet balance
}

// ─────────────────────────────────────────────────────────────
// VALUE OBJECTS  (immutable — no IDs, no dates of their own)
// ─────────────────────────────────────────────────────────────

/**
 * Money — always stored as integer smallest-unit to avoid floating-point bugs.
 * BDT: amount is in paisa (1 BDT = 100 paisa)
 * USD: amount is in cents  (1 USD = 100 cents)
 *
 * Never do arithmetic on raw floats. Use this type and convert at display time.
 *
 * @example
 * const price: Money = { amount: 50000, currency: Currency.BDT }; // 500.00 BDT
 */
export interface Money {
  /** Smallest unit of the currency (paisa for BDT, cents for USD). */
  readonly amount: number;
  readonly currency: Currency;
}

/**
 * SkillTag — a normalised, lowercase-hyphenated skill identifier.
 * Built into a Trie in worker-service for O(L) autocomplete.
 *
 * @example "data-entry" | "ms-excel" | "graphic-design"
 */
export interface SkillTag {
  /**
   * Lowercase hyphenated slug. Pattern: ^[a-z0-9]+(-[a-z0-9]+)*$
   * @example "ms-excel"
   */
  readonly tag: string;

  /**
   * Number of businesses who endorsed this skill on the worker's profile.
   * Increases match score in the matching engine.
   */
  readonly endorsements: number;
}

/**
 * Location — Bangladesh-centric. Division/district structure.
 * All location fields are optional to support remote-only tasks and workers.
 */
export interface Location {
  readonly district?: string;   // e.g. "Chattogram"
  readonly division?: string;   // e.g. "Chattogram"
  readonly upazila?: string;    // Sub-district — for hyper-local matching
  /**
   * Whether this task/worker accepts remote work.
   * If true, location is used as a soft preference, not a hard filter.
   */
  readonly remote: boolean;
}

/** Aggregate rating — computed value, never stored raw. */
export interface Rating {
  /** 0.0 – 5.0, two decimal places. */
  readonly average: number;
  /** Total number of ratings received. */
  readonly count: number;
}

// ─────────────────────────────────────────────────────────────
// CORE DOMAIN ENTITIES
// ─────────────────────────────────────────────────────────────

/**
 * Task — the central aggregate of the platform.
 *
 * Owned by task-service. Read model cached in Redis.
 * All state transitions go through TaskStateMachine — never mutate status directly.
 *
 * @see apps/task-service/src/domain/task-state-machine.ts
 */
export interface Task {
  readonly id: string;

  /** Current lifecycle state. Transitions via TaskStateMachine. */
  status: TaskStatus;

  /** AI-enhanced title (5–10 words, clear action verb). */
  title: string;

  /** AI-enhanced description (2 sentences: what to do and why). */
  description: string;

  /**
   * Skill tags required. Max 5. Matched against worker skills in the
   * bipartite matching algorithm.
   */
  requiredSkills: string[];

  /**
   * AI-generated list of concrete deliverables the worker must hand over.
   * @example ["Completed .xlsx file", "Accuracy report"]
   */
  deliverables: string[];

  /**
   * AI-estimated hours for a part-time worker to complete this task.
   * Used in the fairness score and matching engine's urgency calculation.
   */
  estimatedHours: number;

  /**
   * Task budget. Stored as Money (smallest unit).
   * Platform fee (10%) is deducted at payout — not from this amount.
   */
  budget: Money;

  /** Hard deadline. Tasks past this date are auto-cancelled if still OPEN. */
  deadline: Date;

  /** Optional location preference. Remote flag overrides district matching. */
  location?: Location;

  /** ID of the BUSINESS user who posted this task. */
  readonly businessId: string;

  /**
   * ID of the WORKER who claimed the task.
   * Null until status transitions to CLAIMED.
   */
  claimedByWorkerId: string | null;

  /**
   * Timestamp of when the task was claimed.
   * Used to detect stale claims and enforce SLA timeouts.
   */
  claimedAt: Date | null;

  readonly createdAt: Date;
  updatedAt: Date;
}

/**
 * Worker — the supply side of the marketplace.
 *
 * Owned by worker-service. Public profile exposed via GET /workers/:id.
 * Skills array feeds the Trie in skill-service for autocomplete.
 *
 * @see apps/worker-service/src/domain/worker.aggregate.ts
 */
export interface Worker {
  readonly id: string;

  /** Display name — not used for authentication. */
  name: string;

  /**
   * Free-text bio. AI extracts skill tags from this on profile creation.
   * Max 500 characters.
   */
  bio: string | null;

  /** CDN URL for profile photo. Null if not uploaded. */
  avatarUrl: string | null;

  /**
   * Structured skills with endorsement counts.
   * Populated initially by AI skill extractor, then endorsed by businesses.
   */
  skills: SkillTag[];

  /** Location used for proximity scoring in the matching engine. */
  location?: Location;

  /**
   * Aggregate rating computed from all completed task reviews.
   * Stored on the read model — not the write model.
   */
  rating: Rating;

  /** Total completed (PAID) tasks. Displayed on profile for trust signals. */
  completedTaskCount: number;

  /**
   * Availability toggle. Workers who are busy can set this to false
   * to stop appearing in matching results.
   */
  isAvailable: boolean;

  readonly joinedAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────────

/** Standard pagination metadata attached to all list responses. */
export interface PaginationMeta {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
}

/** Generic paginated response wrapper. Used by all list endpoints. */
export interface Paginated<T> {
  readonly data: T[];
  readonly meta: PaginationMeta;
}

// ─────────────────────────────────────────────────────────────
// API CONTRACTS  (request/response DTOs shared with frontend)
// ─────────────────────────────────────────────────────────────

/** Request body for POST /auth/register */
export interface RegisterRequest {
  role: UserRole;
  name: string;
  /** Required when role === WORKER. E.164 format: +8801XXXXXXXXX */
  phone?: string;
  /** Required when role === BUSINESS. */
  email?: string;
  /** Required when role === BUSINESS. Min 8 chars. */
  password?: string;
  /** Required when role === BUSINESS. */
  companyName?: string;
  location?: Location;
}

/** Response body for POST /auth/register */
export interface RegisterResponse {
  readonly userId: string;
  readonly role: UserRole;
  /** True for workers — they must verify OTP before receiving tokens. */
  readonly otpSent: boolean;
  readonly message?: string;
  /** Issued immediately for businesses. Null for workers until OTP verified. */
  readonly accessToken?: string;
  readonly refreshToken?: string;
}

/** Request body for POST /tasks */
export interface CreateTaskRequest {
  /** Rough input — will be AI-enhanced before the task is saved. */
  title: string;
  description: string;
  budget: Money;
  /** Max 5 lowercase hyphenated tags. */
  requiredSkills: string[];
  deadline: Date;
  location?: Location;
}

/** Task feed query parameters for GET /tasks */
export interface TaskFeedQuery {
  /** Comma-separated skill tags */
  skills?: string;
  district?: string;
  remote?: boolean;
  minBudget?: number;
  maxBudget?: number;
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────────────────────────
// DOMAIN EVENTS  (published to RabbitMQ — consumed by all services)
// ─────────────────────────────────────────────────────────────

/**
 * Base shape for all domain events.
 * Every event published to RabbitMQ must extend this.
 */
export interface DomainEvent {
  /** Unique event ID (ULID). Used for deduplication in consumers. */
  readonly eventId: string;
  /** ISO 8601 timestamp of when the event occurred. */
  readonly occurredAt: string;
}

export interface TaskCreatedEvent extends DomainEvent {
  readonly type: 'task.created';
  readonly taskId: string;
  readonly businessId: string;
}

export interface TaskClaimedEvent extends DomainEvent {
  readonly type: 'task.claimed';
  readonly taskId: string;
  readonly workerId: string;
}

export interface TaskApprovedEvent extends DomainEvent {
  readonly type: 'task.approved';
  readonly taskId: string;
  readonly workerId: string;
  readonly payout: Money;
}

export interface WorkerRegisteredEvent extends DomainEvent {
  readonly type: 'worker.registered';
  readonly workerId: string;
  /** Raw bio text — ai-service listens to this and extracts skill tags. */
  readonly bio: string | null;
}