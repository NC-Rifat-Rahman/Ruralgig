const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
    LevelFormat, Footer, Header, TabStopType, TabStopPosition
} = require('docx');
const fs = require('fs');

// ── Palette ──────────────────────────────────────────────────────────────────
const NAVY = "1D4E8C";
const NAVY_L = "E8F0FB";
const GREEN = "1D9E75";
const GREEN_L = "E1F5EE";
const AMBER = "BA7517";
const AMBER_L = "FAEEDA";
const CORAL = "993C1D";
const CORAL_L = "FAECE7";
const PURPLE = "5B3FA6";
const PURPLE_L = "EEEBF9";
const GRAY = "333331";
const LGRAY = "666663";
const WHITE = "FFFFFF";
const BG = "F7F7F5";

// ── Borders ───────────────────────────────────────────────────────────────────
const bd = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const bds = { top: bd, bottom: bd, left: bd, right: bd };
const nb = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const nbs = { top: nb, bottom: nb, left: nb, right: nb };

// ── Helpers ───────────────────────────────────────────────────────────────────
const gap = (n = 120) => new Paragraph({ spacing: { before: n, after: 0 }, children: [new TextRun("")] });
const divider = () => new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD", space: 1 } },
    children: [new TextRun("")]
});
const h1 = t => new Paragraph({
    heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 120 },
    children: [new TextRun({ text: t, font: "Arial", size: 34, bold: true, color: NAVY })]
});
const h2 = t => new Paragraph({
    heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 100 },
    children: [new TextRun({ text: t, font: "Arial", size: 26, bold: true, color: NAVY })]
});
const h3 = t => new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text: t, font: "Arial", size: 22, bold: true, color: GREEN })]
});
const body = (t, opts = {}) => new Paragraph({
    spacing: { before: 60, after: 80 },
    children: [new TextRun({ text: t, font: "Arial", size: 21, color: GRAY, ...opts })]
});
const mono = t => new Paragraph({
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text: t, font: "Courier New", size: 19, color: NAVY })]
});
const bul = (t, lv = 0) => new Paragraph({
    numbering: { reference: "bullets", level: lv },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text: t, font: "Arial", size: 21, color: GRAY })]
});
const num = (t, lv = 0) => new Paragraph({
    numbering: { reference: "numbers", level: lv },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text: t, font: "Arial", size: 21, color: GRAY })]
});

// ── Reusable block components ─────────────────────────────────────────────────

// Highlighted callout box (full-width single-cell table)
function callout(title, lines, fill = NAVY_L, tc = NAVY) {
    return new Table({
        width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360],
        rows: [new TableRow({
            children: [new TableCell({
                borders: bds, shading: { fill, type: ShadingType.CLEAR },
                margins: { top: 140, bottom: 140, left: 200, right: 200 },
                children: [
                    new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: title, font: "Arial", size: 21, bold: true, color: tc })] }),
                    ...lines.map(l => new Paragraph({ spacing: { before: 0, after: 20 }, children: [new TextRun({ text: l, font: "Arial", size: 20, color: GRAY })] }))
                ]
            })]
        })
        ]
    });
}

// Code block (dark background, monospaced)
function codeBlock(lines) {
    return new Table({
        width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360],
        rows: [new TableRow({
            children: [new TableCell({
                borders: { top: { style: BorderStyle.SINGLE, size: 1, color: "555555" }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "555555" }, left: { style: BorderStyle.SINGLE, size: 4, color: GREEN }, right: { style: BorderStyle.SINGLE, size: 1, color: "555555" } },
                shading: { fill: "1E1E1E", type: ShadingType.CLEAR },
                margins: { top: 120, bottom: 120, left: 200, right: 200 },
                children: lines.map(l => new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: l, font: "Courier New", size: 18, color: "D4D4D4" })] }))
            })]
        })
        ]
    });
}

// Two-column table (equal halves)
function twoCols(leftTitle, leftLines, rightTitle, rightLines, lFill = NAVY_L, rFill = GREEN_L, ltc = NAVY, rtc = GREEN) {
    return new Table({
        width: { size: 9360, type: WidthType.DXA }, columnWidths: [4620, 4740],
        rows: [new TableRow({
            children: [
                new TableCell({
                    borders: bds, shading: { fill: lFill, type: ShadingType.CLEAR },
                    margins: { top: 140, bottom: 140, left: 180, right: 180 },
                    children: [
                        new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: leftTitle, font: "Arial", size: 21, bold: true, color: ltc })] }),
                        ...leftLines.map(l => new Paragraph({ spacing: { before: 0, after: 24 }, children: [new TextRun({ text: l, font: "Arial", size: 20, color: GRAY })] }))
                    ]
                }),
                new TableCell({
                    borders: bds, shading: { fill: rFill, type: ShadingType.CLEAR },
                    margins: { top: 140, bottom: 140, left: 180, right: 180 },
                    children: [
                        new Paragraph({ spacing: { before: 0, after: 80 }, children: [new TextRun({ text: rightTitle, font: "Arial", size: 21, bold: true, color: rtc })] }),
                        ...rightLines.map(l => new Paragraph({ spacing: { before: 0, after: 24 }, children: [new TextRun({ text: l, font: "Arial", size: 20, color: GRAY })] }))
                    ]
                })
            ]
        })]
    });
}

// Generic multi-column data table with header row
function dataTable(cols, colWidths, rows, headerFill = NAVY, rowFill = NAVY_L) {
    const headerRow = new TableRow({
        children: cols.map((c, i) =>
            new TableCell({
                borders: bds, width: { size: colWidths[i], type: WidthType.DXA },
                shading: { fill: headerFill, type: ShadingType.CLEAR },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [new Paragraph({ children: [new TextRun({ text: c, font: "Arial", size: 19, bold: true, color: WHITE })] })]
            })
        )
    });
    const dataRows = rows.map((row, ri) =>
        new TableRow({
            children: row.map((cell, ci) =>
                new TableCell({
                    borders: bds, width: { size: colWidths[ci], type: WidthType.DXA },
                    shading: { fill: ri % 2 === 0 ? rowFill : WHITE, type: ShadingType.CLEAR },
                    margins: { top: 72, bottom: 72, left: 120, right: 120 },
                    children: [new Paragraph({ children: [new TextRun({ text: cell, font: "Arial", size: 19, color: ci === 0 ? NAVY : GRAY, bold: ci === 0 })] })]
                })
            )
        })
    );
    return new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: colWidths, rows: [headerRow, ...dataRows] });
}

// Phase header banner (full-width accent bar + content)
function phaseBanner(label, subtitle, fill = NAVY) {
    return new Table({
        width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360],
        rows: [new TableRow({
            children: [new TableCell({
                borders: bds, shading: { fill, type: ShadingType.CLEAR },
                margins: { top: 120, bottom: 120, left: 200, right: 200 },
                children: [
                    new Paragraph({ spacing: { before: 0, after: 20 }, children: [new TextRun({ text: label, font: "Arial", size: 26, bold: true, color: WHITE })] }),
                    new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: subtitle, font: "Arial", size: 20, color: "CCDDFF" })] })
                ]
            })]
        })
        ]
    });
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENT
// ═══════════════════════════════════════════════════════════════════════════════
const doc = new Document({
    numbering: {
        config: [
            {
                reference: "bullets", levels: [
                    { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 600, hanging: 300 } } } },
                    { level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 960, hanging: 300 } } } }
                ]
            },
            {
                reference: "numbers", levels: [
                    { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 600, hanging: 300 } } } },
                    { level: 1, format: LevelFormat.DECIMAL, text: "%1.%2.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 960, hanging: 300 } } } }
                ]
            }
        ]
    },
    styles: {
        default: { document: { run: { font: "Arial", size: 21 } } },
        paragraphStyles: [
            {
                id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 34, bold: true, font: "Arial", color: NAVY },
                paragraph: { spacing: { before: 400, after: 120 }, outlineLevel: 0 }
            },
            {
                id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 26, bold: true, font: "Arial", color: NAVY },
                paragraph: { spacing: { before: 280, after: 100 }, outlineLevel: 1 }
            }
        ]
    },
    sections: [{
        properties: {
            page: {
                size: { width: 12240, height: 15840 },
                margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
            }
        },
        headers: {
            default: new Header({
                children: [
                    new Paragraph({
                        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD", space: 1 } },
                        spacing: { before: 0, after: 120 },
                        children: [new TextRun({ text: "RuralGig — Initial Setup, Features, Git Strategy & AI Integration", font: "Arial", size: 18, color: "888888" })]
                    })
                ]
            })
        },
        footers: {
            default: new Footer({
                children: [
                    new Paragraph({
                        border: { top: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD", space: 1 } },
                        spacing: { before: 120, after: 0 },
                        tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                        children: [
                            new TextRun({ text: "RuralGig Developer Guide", font: "Arial", size: 16, color: "AAAAAA" }),
                            new TextRun({ text: "\tApril 2026", font: "Arial", size: 16, color: "AAAAAA" })
                        ]
                    })
                ]
            })
        },

        children: [

            // ══════════════════════════════════════════════════════════════════════
            // COVER
            // ══════════════════════════════════════════════════════════════════════
            gap(2000),
            new Paragraph({
                alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 },
                children: [new TextRun({ text: "RuralGig", font: "Arial", size: 80, bold: true, color: NAVY })]
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 },
                children: [new TextRun({ text: "Developer Setup Guide", font: "Arial", size: 36, bold: true, color: GREEN })]
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 },
                children: [new TextRun({ text: "Initial Setup  |  MVP Features  |  Git Strategy  |  AI Integration  |  Frontend Choice", font: "Arial", size: 22, color: LGRAY, italics: true })]
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                border: { top: { style: BorderStyle.SINGLE, size: 6, color: GREEN, space: 1 }, bottom: { style: BorderStyle.SINGLE, size: 6, color: GREEN, space: 1 } },
                spacing: { before: 80, after: 0 },
                children: [new TextRun({ text: "NestJS  |  Next.js  |  PostgreSQL  |  Redis  |  RabbitMQ  |  Claude API", font: "Arial", size: 20, color: "555555" })]
            }),
            gap(2800),

            // ══════════════════════════════════════════════════════════════════════
            // SECTION 1: FRONTEND DECISION
            // ══════════════════════════════════════════════════════════════════════
            h1("1. Frontend Decision: Next.js over React"),
            body("As a beginner to frontend, Next.js is the correct choice. React is a UI library — it renders components but gives you nothing else. You would need to separately learn and configure routing, data fetching, folder structure, build tooling, and deployment. Next.js bundles all of that into one framework built on top of React."),
            gap(80),

            twoCols(
                "React (library only)",
                [
                    "You choose and configure your own router (React Router)",
                    "You set up your own data fetching strategy (SWR, React Query, etc.)",
                    "No opinions on folder structure — you decide everything",
                    "Requires Webpack/Vite setup from scratch",
                    "Deployment requires extra configuration",
                    "Good choice once you already know React well"
                ],
                "Next.js (recommended for you)",
                [
                    "File-based routing built in — create a file, get a route",
                    "Server-side rendering (SSR) out of the box — critical for task listing SEO",
                    "API routes built in — early prototyping without a separate backend",
                    "Deploys to Vercel in one click, free tier included",
                    "Every React skill (components, hooks, state) transfers directly",
                    "Industry standard — all Next.js jobs also accept React knowledge"
                ],
                CORAL_L, GREEN_L, CORAL, GREEN
            ),
            gap(120),
            callout("Key reason for RuralGig specifically",
                [
                    "Task listings (browsable by workers) need to be indexed by Google. Next.js SSR makes task pages",
                    "crawlable without any extra work. A pure React SPA would require significant extra setup to achieve",
                    "the same SEO outcome. This matters for organic discovery when workers search 'data entry jobs Chattogram'."
                ], NAVY_L, NAVY),
            gap(120),

            h2("Frontend tech stack"),
            dataTable(
                ["Package", "Purpose", "Why this one"],
                [2800, 2000, 4560],
                [
                    ["Next.js 14+", "Framework", "App Router, SSR/SSG, API routes, image optimization"],
                    ["TypeScript", "Language", "Shared types with backend — no type mismatches on API responses"],
                    ["Tailwind CSS", "Styling", "Utility-first, fast to learn, no CSS files to manage"],
                    ["shadcn/ui", "Components", "Pre-built, accessible components (buttons, forms, modals, tables)"],
                    ["React Hook Form", "Forms", "Worker registration, task posting — validation built in"],
                    ["Zod", "Validation", "Same schemas as backend — one source of truth"],
                    ["TanStack Query", "Data fetching", "Cache management, loading states, background refresh"],
                    ["Socket.io-client", "Real-time", "Live task feed updates, payment notifications"],
                    ["Axios", "HTTP client", "API calls to NestJS services with interceptors for auth"]
                ]
            ),
            divider(),

            // ══════════════════════════════════════════════════════════════════════
            // SECTION 2: PROJECT SETUP
            // ══════════════════════════════════════════════════════════════════════
            h1("2. Project Setup"),

            h2("2.1 Monorepo structure (Turborepo)"),
            body("The entire project lives in one repository managed by Turborepo. This allows shared TypeScript types between the frontend and all backend services, parallel builds, and unified CI/CD."),
            gap(80),
            codeBlock([
                "ruralgig/",
                "├── apps/",
                "│   ├── web/                    # Next.js frontend (worker + business UI)",
                "│   ├── api-gateway/            # NestJS — public entrypoint, rate limiting",
                "│   ├── auth-service/           # NestJS — JWT, OTP, refresh tokens",
                "│   ├── task-service/           # NestJS — CQRS, task state machine",
                "│   ├── worker-service/         # NestJS — profiles, skills, ratings",
                "│   ├── matching-service/       # NestJS — bipartite matching, priority queue",
                "│   ├── payment-service/        # NestJS — Saga, bKash/Stripe adapters",
                "│   ├── notification-service/   # NestJS — WebSocket, SMS, email",
                "│   └── ai-service/             # NestJS — Claude API integration",
                "├── packages/",
                "│   ├── shared-types/           # TypeScript interfaces shared by all apps",
                "│   ├── shared-events/          # Domain event schemas (RabbitMQ payloads)",
                "│   ├── shared-utils/           # Money, Pagination, DateRange value objects",
                "│   └── shared-db/             # Prisma base config and common mixins",
                "├── infra/",
                "│   ├── docker-compose.yml      # Local dev: Postgres, Redis, RabbitMQ",
                "│   ├── docker-compose.test.yml # Isolated test containers",
                "│   ├── nginx/                  # API Gateway reverse proxy config",
                "│   └── k8s/                    # Kubernetes Helm charts (Phase 4)",
                "├── docs/",
                "│   ├── adr/                    # Architecture Decision Records",
                "│   ├── PATTERNS.md             # Design patterns catalogue",
                "│   └── openapi.yaml            # API-first contract spec",
                "└── turbo.json                  # Turborepo pipeline config",
            ]),
            gap(120),

            h2("2.2 Bootstrap commands (run once)"),
            codeBlock([
                "# Step 1 — Create Turborepo monorepo",
                "npx create-turbo@latest ruralgig",
                "cd ruralgig",
                "",
                "# Step 2 — Create each NestJS service",
                "cd apps && npx @nestjs/cli new auth-service --package-manager npm",
                "npx @nestjs/cli new task-service --package-manager npm",
                "npx @nestjs/cli new worker-service --package-manager npm",
                "npx @nestjs/cli new matching-service --package-manager npm",
                "npx @nestjs/cli new payment-service --package-manager npm",
                "npx @nestjs/cli new notification-service --package-manager npm",
                "npx @nestjs/cli new ai-service --package-manager npm",
                "",
                "# Step 3 — Create Next.js frontend",
                "npx create-next-app@latest web --typescript --tailwind --app",
                "",
                "# Step 4 — Shared packages",
                "mkdir -p packages/shared-types/src",
                "mkdir -p packages/shared-events/src",
                "mkdir -p packages/shared-utils/src",
                "",
                "# Step 5 — Spin up all infrastructure",
                "cd ../infra && docker compose up -d",
                "# Postgres :5432  Redis :6379  RabbitMQ :5672  pgAdmin :8080",
                "",
                "# Step 6 — Run everything in parallel",
                "cd .. && npx turbo dev",
            ]),
            gap(120),

            h2("2.3 Core NestJS dependencies (per service)"),
            codeBlock([
                "# Core NestJS + transport",
                "npm install @nestjs/common @nestjs/core @nestjs/platform-express",
                "npm install @nestjs/microservices @nestjs/websockets @nestjs/platform-socket.io",
                "",
                "# Database",
                "npm install @nestjs/config @prisma/client prisma",
                "npm install @nestjs/typeorm typeorm   # optional — if using TypeORM instead of Prisma",
                "",
                "# Auth",
                "npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcryptjs",
                "npm install @nestjs/throttler          # built-in rate limiting",
                "",
                "# Messaging",
                "npm install @nestjs/bull bull           # job queues (wraps BullMQ)",
                "npm install amqplib @nestjs/microservices  # RabbitMQ transport",
                "",
                "# Validation",
                "npm install class-validator class-transformer zod",
                "",
                "# CQRS (built into NestJS)",
                "npm install @nestjs/cqrs",
                "",
                "# Testing",
                "npm install --save-dev @nestjs/testing jest @types/jest supertest",
            ]),
            gap(120),

            h2("2.4 Docker Compose (local dev)"),
            codeBlock([
                "# infra/docker-compose.yml",
                "version: '3.9'",
                "services:",
                "  postgres:",
                "    image: postgres:16-alpine",
                "    ports: ['5432:5432']",
                "    environment:",
                "      POSTGRES_PASSWORD: ruralgig",
                "      POSTGRES_DB: ruralgig",
                "    volumes: [pg_data:/var/lib/postgresql/data]",
                "",
                "  redis:",
                "    image: redis:7-alpine",
                "    ports: ['6379:6379']",
                "",
                "  rabbitmq:",
                "    image: rabbitmq:3-management-alpine",
                "    ports: ['5672:5672', '15672:15672']  # 15672 = management UI",
                "    environment:",
                "      RABBITMQ_DEFAULT_USER: guest",
                "      RABBITMQ_DEFAULT_PASS: guest",
                "",
                "  pgadmin:",
                "    image: dpage/pgadmin4",
                "    ports: ['8080:80']",
                "    environment:",
                "      PGADMIN_DEFAULT_EMAIL: admin@ruralgig.com",
                "      PGADMIN_DEFAULT_PASSWORD: admin",
                "",
                "volumes:",
                "  pg_data:",
            ]),
            divider(),

            // ══════════════════════════════════════════════════════════════════════
            // SECTION 3: MVP FEATURES
            // ══════════════════════════════════════════════════════════════════════
            h1("3. MVP Features"),
            body("Features are split into Phase 1 (build first — must ship for any user to get value) and Phase 2 (ship after first 20 real users). Every feature entry includes the NestJS module responsible, the design pattern applied, and the DSA used where relevant."),
            gap(100),

            phaseBanner("Phase 1 — Must Ship First", "Core auth, task lifecycle, worker profiles, basic matching", NAVY),
            gap(100),

            h2("3.1 Authentication & Identity  (auth-service)"),
            dataTable(
                ["Feature", "NestJS module", "Pattern / DSA"],
                [3200, 2880, 3280],
                [
                    ["Worker registration via phone + OTP (SMS)", "AuthModule, PassportModule", "Factory Pattern — WorkerFactory creates aggregate"],
                    ["Business registration via email + password", "AuthModule, LocalStrategy", "Strategy Pattern — email vs phone auth strategies"],
                    ["JWT access token (15min expiry)", "JwtModule, JwtStrategy", "Value Object — JwtPayload (immutable DTO)"],
                    ["Redis-backed refresh token rotation", "CacheModule (Redis)", "Repository Pattern — RefreshTokenRepository"],
                    ["Role-based guards (WORKER | BUSINESS | ADMIN)", "AuthGuard, RolesGuard", "Decorator Pattern — @Roles() metadata decorator"],
                    ["OTP rate limiting (max 5 per hour)", "ThrottlerModule", "Token Bucket Algorithm — NestJS Throttler"],
                ]
            ),
            gap(120),
            h3("Key NestJS code pattern — Auth module"),
            codeBlock([
                "// auth-service/src/auth/auth.module.ts",
                "@Module({",
                "  imports: [",
                "    JwtModule.registerAsync({",
                "      useFactory: (config: ConfigService) => ({",
                "        secret: config.get('JWT_SECRET'),",
                "        signOptions: { expiresIn: '15m' },",
                "      }),",
                "      inject: [ConfigService],",
                "    }),",
                "    PassportModule.register({ defaultStrategy: 'jwt' }),",
                "    CacheModule.register({ store: redisStore, ttl: 60 * 60 * 24 * 7 }),",
                "  ],",
                "  providers: [AuthService, JwtStrategy, LocalStrategy, OtpService],",
                "  exports: [AuthService, JwtModule],",
                "})",
                "export class AuthModule {}",
            ]),
            gap(120),

            h2("3.2 Task Management  (task-service)"),
            dataTable(
                ["Feature", "NestJS module", "Pattern / DSA"],
                [3200, 2880, 3280],
                [
                    ["Business posts a task (title, budget, skills, deadline)", "TasksModule, CQRS", "Builder Pattern — TaskBuilder fluent API"],
                    ["Task state machine (Draft/Open/Claimed/Submitted/Approved/Paid)", "TasksModule, CQRS", "State Pattern — TaskStateMachine class"],
                    ["Task lifecycle events published to RabbitMQ", "RmqModule, EventBus", "Observer Pattern — domain events on state change"],
                    ["Worker browses task feed (paginated, filtered by skill)", "TaskReadModule (CQRS)", "CQRS — separate QueryHandler + Redis read model"],
                    ["Worker claims a task (distributed lock)", "TasksModule, CacheModule", "Redlock Algorithm — Redis distributed mutex"],
                    ["Business approves submitted work", "TasksModule, CQRS", "Command Pattern — ApproveTaskCommand"],
                ]
            ),
            gap(120),
            h3("Key NestJS code pattern — CQRS with Command + Event"),
            codeBlock([
                "// task-service/src/tasks/commands/create-task.command.ts",
                "export class CreateTaskCommand {",
                "  constructor(",
                "    public readonly businessId: string,",
                "    public readonly dto: CreateTaskDto,",
                "  ) {}",
                "}",
                "",
                "// task-service/src/tasks/handlers/create-task.handler.ts",
                "@CommandHandler(CreateTaskCommand)",
                "export class CreateTaskHandler implements ICommandHandler<CreateTaskCommand> {",
                "  constructor(",
                "    private readonly tasks: TaskRepository,",
                "    private readonly events: EventBus,",
                "  ) {}",
                "",
                "  async execute(cmd: CreateTaskCommand) {",
                "    const task = TaskFactory.create(cmd.dto);   // Factory Pattern",
                "    await this.tasks.save(task);                // Repository Pattern",
                "    this.events.publish(new TaskCreatedEvent(task.id));  // Observer",
                "    return task;",
                "  }",
                "}",
            ]),
            gap(120),

            h2("3.3 Worker Profile  (worker-service)"),
            dataTable(
                ["Feature", "NestJS module", "Pattern / DSA"],
                [3200, 2880, 3280],
                [
                    ["Profile creation with bio, photo, location", "WorkersModule", "Aggregate Root — Worker entity owns all profile data"],
                    ["Skill tags with autocomplete (Trie)", "SkillsModule", "Trie DSA — O(L) prefix lookup, built in TypeScript"],
                    ["AI-assisted skill extraction from bio", "SkillsModule, AI client", "Strategy Pattern — ManualSkillStrategy vs AISkillStrategy"],
                    ["Rating and review after task completion", "RatingsModule", "Event Sourcing — immutable rating ledger via events"],
                    ["Earnings history display", "EarningsModule", "Repository Pattern — EarningsReadRepository (Redis)"],
                    ["Worker availability toggle (on/off)", "WorkersModule", "Value Object — AvailabilityStatus (immutable)"],
                ]
            ),
            gap(120),

            h2("3.4 Matching Engine  (matching-service)"),
            dataTable(
                ["Feature", "NestJS module", "Pattern / DSA"],
                [3200, 2880, 3280],
                [
                    ["Skill-weighted worker scoring per task", "MatchingModule", "Strategy Pattern — SkillScoringStrategy"],
                    ["Location-based proximity scoring", "MatchingModule", "Strategy Pattern — LocationScoringStrategy (Haversine)"],
                    ["Rating-weighted final score", "MatchingModule", "Strategy Pattern — RatingScoringStrategy"],
                    ["Composite match pipeline", "MatchingModule", "Chain of Responsibility — filter then rank"],
                    ["Priority queue for urgent tasks", "MatchingModule", "Min-Heap DSA — custom TypeScript implementation"],
                    ["Specification-based filtering", "MatchingModule", "Specification Pattern — SkillSpec AND LocationSpec"],
                ]
            ),
            gap(80),
            codeBlock([
                "// matching-service/src/matching/strategies/skill-scoring.strategy.ts",
                "export interface ScoringStrategy {",
                "  score(worker: WorkerProfile, task: Task): number;",
                "}",
                "",
                "export class SkillScoringStrategy implements ScoringStrategy {",
                "  score(worker: WorkerProfile, task: Task): number {",
                "    const matched = task.requiredSkills.filter(s => worker.skills.includes(s));",
                "    return matched.length / task.requiredSkills.length;  // 0.0 – 1.0",
                "  }",
                "}",
                "",
                "// Composite scorer — Decorator pattern wraps strategies",
                "export class CompositeScorer {",
                "  constructor(private readonly strategies: ScoringStrategy[]) {}",
                "  score(worker: WorkerProfile, task: Task): number {",
                "    return this.strategies.reduce((sum, s) => sum + s.score(worker, task), 0)",
                "           / this.strategies.length;",
                "  }",
                "}",
            ]),
            divider(),

            phaseBanner("Phase 2 — After First 20 Real Users", "Payments, real-time updates, fraud detection, referrals"),
            gap(100),

            h2("3.5 Payments  (payment-service)"),
            dataTable(
                ["Feature", "NestJS module", "Pattern / DSA"],
                [3200, 2880, 3280],
                [
                    ["bKash sandbox integration", "PaymentModule", "Adapter Pattern — BkashAdapter implements PaymentGateway"],
                    ["Stripe integration (international businesses)", "PaymentModule", "Adapter Pattern — StripeAdapter implements PaymentGateway"],
                    ["Distributed Saga for payout flow", "SagaModule (CQRS)", "Saga Pattern — compensating transactions on failure"],
                    ["Outbox pattern (no dual-write bugs)", "OutboxModule", "Outbox Pattern — events stored with transaction, published after"],
                    ["Wallet with double-entry bookkeeping", "WalletModule", "Repository Pattern — LedgerRepository (append-only)"],
                    ["Idempotent payment processing", "PaymentModule", "Idempotency Key Pattern — Redis dedup on payment ID"],
                    ["Circuit breaker on gateway calls", "PaymentModule", "Circuit Breaker — @nestjs/axios + opossum library"],
                ]
            ),
            gap(120),

            h2("3.6 Notifications  (notification-service)"),
            dataTable(
                ["Feature", "NestJS module", "Pattern / DSA"],
                [3200, 2880, 3280],
                [
                    ["Real-time task feed updates (WebSocket)", "EventsGateway (Socket.io)", "Observer Pattern — gateway subscribes to RabbitMQ events"],
                    ["SMS notifications (task claimed, payment sent)", "SmsModule", "Template Method — BaseSmsNotification abstract class"],
                    ["Email notifications (business confirmation)", "EmailModule", "Template Method — BaseEmailNotification abstract class"],
                    ["Notification preferences per user", "PreferencesModule", "Strategy Pattern — pluggable channel selector"],
                    ["Digest scheduling (hourly summaries)", "BullModule (queue)", "Command Pattern — SendDigestCommand + scheduler"],
                ]
            ),
            gap(120),

            h2("3.7 Fraud Detection  (admin-service)"),
            dataTable(
                ["Feature", "NestJS module", "Pattern / DSA"],
                [3200, 2880, 3280],
                [
                    ["Sliding window rate limiter per user/IP", "ThrottlerModule + Redis", "Sliding Window Algorithm — Redis ZADD/ZCOUNT"],
                    ["Anomaly scoring on completion times", "FraudModule", "Z-Score Algorithm — flag outlier completion speeds"],
                    ["Duplicate submission detection", "FraudModule", "Bloom Filter DSA — memory-efficient dedup"],
                    ["Collusion ring detection in ratings", "FraudModule", "Graph Cycle Detection — DFS on rating graph"],
                    ["Admin dashboard with fraud flags", "AdminModule (CQRS)", "CQRS — separate AdminReadModel with materialized view"],
                ]
            ),
            divider(),

            // ══════════════════════════════════════════════════════════════════════
            // SECTION 4: GIT STRATEGY
            // ══════════════════════════════════════════════════════════════════════
            h1("4. Git Repository Strategy"),
            body("A clean Git workflow is as important as clean code when showing your repository to recruiters. Every commit, branch name, and PR description is part of your public portfolio."),
            gap(100),

            h2("4.1 Branch strategy"),
            dataTable(
                ["Branch", "Purpose", "Rules"],
                [2400, 3360, 3600],
                [
                    ["main", "Always deployable to production", "Protected. No direct pushes ever. Every merge auto-deploys via GitHub Actions."],
                    ["develop", "Integration branch — staging environment", "All feature branches merge here first. CI must pass before merge."],
                    ["feature/*", "One branch per feature or service module", "Branch from develop. PR back to develop. Delete after merge. Max 2 days old."],
                    ["fix/*", "Bug fixes in any environment", "Same flow as features. Keep short-lived. Reference the issue number."],
                    ["release/v*", "Cut from develop when MVP milestone is ready", "Only hotfixes go in. Merges to both main and develop simultaneously."],
                    ["hotfix/*", "Emergency production fixes only", "Branch from main. Merge back to both main and develop. Use rarely."],
                    ["docs/*", "ADR and documentation updates", "Can merge directly to develop without CI check if code-free."],
                ]
            ),
            gap(120),

            h2("4.2 Commit message convention (Conventional Commits)"),
            body("All commits must follow the Conventional Commits specification. This enables automatic changelog generation and makes your git log readable as a project diary."),
            gap(80),
            codeBlock([
                "# Format",
                "<type>(<scope>): <short description>",
                "",
                "# Types",
                "feat      — a new feature",
                "fix       — a bug fix",
                "refactor  — code change that is not a feature or bug fix",
                "docs      — documentation only (ADRs, PATTERNS.md, README)",
                "test      — adding or updating tests",
                "perf      — performance improvement",
                "chore     — build process or tooling change",
                "feat!     — breaking change (adds ! after type)",
                "",
                "# Scope = the service or package affected",
                "feat(task-service): add state machine for task lifecycle",
                "fix(payment-service): handle bKash timeout in saga compensator",
                "feat!(matching-service): replace keyword search with bipartite matching",
                "docs(adr): add ADR-003 for saga vs 2PC decision",
                "refactor(worker-service): extract skill normalizer into Strategy pattern",
                "test(matching-service): add unit tests for priority queue edge cases",
                "perf(task-service): add Redis read model — p99 latency 400ms to 8ms",
                "feat(ai-service): add Claude API task description enhancer",
                "docs(patterns): document Chain of Responsibility in matching pipeline",
            ]),
            gap(120),

            h2("4.3 Pull request template"),
            body("Create .github/PULL_REQUEST_TEMPLATE.md. Every PR must answer these questions. This forces reflection on every change and creates a searchable record of engineering decisions."),
            gap(80),
            codeBlock([
                "## What does this PR do?",
                "<!-- 1-2 sentences. What is the change and why is it needed? -->",
                "",
                "## Which design pattern or algorithm does this apply?",
                "<!-- e.g. 'Implements Strategy pattern for pluggable payment gateways' -->",
                "<!-- e.g. 'Adds Trie data structure for O(L) skill tag autocomplete' -->",
                "",
                "## How is it tested?",
                "<!-- Unit tests: yes/no, coverage% -->",
                "<!-- Integration test: yes/no -->",
                "<!-- Manual test steps (if needed) -->",
                "",
                "## Does this require an ADR update?",
                "<!-- If a new architectural decision was made, link the ADR -->",
                "",
                "## Does this require PATTERNS.md update?",
                "<!-- If a new pattern was introduced, it must be documented -->",
                "",
                "## Checklist",
                "- [ ] Tests pass locally (npm test)",
                "- [ ] No TypeScript errors (npx tsc --noEmit)",
                "- [ ] ESLint passes (npm run lint)",
                "- [ ] Swagger updated if new endpoints added",
                "- [ ] Environment variables documented in .env.example",
            ]),
            gap(120),

            h2("4.4 GitHub Actions CI pipeline"),
            codeBlock([
                "# .github/workflows/ci.yml",
                "name: CI",
                "on:",
                "  pull_request:",
                "    branches: [main, develop]",
                "",
                "jobs:",
                "  ci:",
                "    runs-on: ubuntu-latest",
                "    services:",
                "      postgres:",
                "        image: postgres:16",
                "        env: { POSTGRES_PASSWORD: test }",
                "        ports: ['5432:5432']",
                "      redis:",
                "        image: redis:7",
                "        ports: ['6379:6379']",
                "",
                "    steps:",
                "      - uses: actions/checkout@v4",
                "      - uses: actions/setup-node@v4",
                "        with: { node-version: '20', cache: 'npm' }",
                "      - run: npm ci",
                "      - run: npx turbo lint          # ESLint all services",
                "      - run: npx tsc --noEmit        # TypeScript check",
                "      - run: npx turbo test          # Vitest all services",
                "      - run: npx turbo build         # Ensure build succeeds",
            ]),
            gap(120),

            h2("4.5 Branch protection rules (GitHub settings)"),
            dataTable(
                ["Branch", "Rules to enable"],
                [2400, 6960],
                [
                    ["main", "Require 1 reviewer approval. Require CI to pass. No force pushes. No direct pushes (including admin). Require linear history."],
                    ["develop", "Require CI to pass. No force pushes. Allow squash merges only (keeps history clean)."],
                ]
            ),
            gap(120),

            h2("4.6 First 3 files to create (before any code)"),
            body("These three files, committed before any service code, establish your engineering discipline and are the first things a recruiter looks at after the README."),
            gap(80),
            dataTable(
                ["File", "What to write", "Why it matters"],
                [2880, 3240, 3240],
                [
                    ["docs/adr/ADR-001.md", "Why event-driven architecture over direct REST calls between services. Cover: loose coupling, independent deployability, the tradeoff of eventual consistency.", "Proves you think about architecture before you build. Dated ADRs are immutable records of your reasoning."],
                    ["docs/openapi.yaml", "Define your first 5 endpoints: POST /auth/register, POST /tasks, GET /tasks, POST /tasks/:id/claim, GET /workers/:id. Include request/response schemas.", "API-first discipline. Forces you to design the contract before the implementation, catching design mistakes early."],
                    ["packages/shared-types/src/index.ts", "Define Task, Worker, SkillTag, Money, TaskStatus as TypeScript interfaces. Every service and the frontend imports from here — never duplicated.", "Single source of truth for types. Eliminates type mismatch bugs between frontend and backend completely."],
                ]
            ),
            divider(),

            // ══════════════════════════════════════════════════════════════════════
            // SECTION 5: AI INTEGRATION
            // ══════════════════════════════════════════════════════════════════════
            h1("5. AI Integration (Claude API)"),
            body("The ai-service is a standalone NestJS microservice that wraps the Anthropic Claude API. All other services call ai-service via RabbitMQ (async) or HTTP (sync) — never calling the Claude API directly. This centralises API key management, logging, rate limiting, and cost tracking in one place."),
            gap(100),

            h2("5.1 Architecture of ai-service"),
            codeBlock([
                "apps/ai-service/",
                "├── src/",
                "│   ├── ai.module.ts              # Root module",
                "│   ├── anthropic.client.ts       # Singleton Claude API client",
                "│   ├── task-enhancer/",
                "│   │   ├── task-enhancer.service.ts   # POST /enhance-task",
                "│   │   └── task-enhancer.dto.ts",
                "│   ├── skill-extractor/",
                "│   │   ├── skill-extractor.service.ts # POST /extract-skills",
                "│   │   └── skill-extractor.dto.ts",
                "│   ├── task-scorer/",
                "│   │   └── task-scorer.service.ts     # POST /score-task",
                "│   ├── dispute-summariser/",
                "│   │   └── dispute-summariser.service.ts",
                "│   ├── career-advisor/",
                "│   │   └── career-advisor.service.ts",
                "│   └── translator/",
                "│       └── translator.service.ts      # Bangla translation",
                "└── test/",
            ]),
            gap(120),

            h2("5.2 NestJS Claude client setup"),
            codeBlock([
                "// ai-service/src/anthropic.client.ts",
                "import Anthropic from '@anthropic-ai/sdk';",
                "import { Injectable } from '@nestjs/common';",
                "import { ConfigService } from '@nestjs/config';",
                "",
                "@Injectable()",
                "export class AnthropicClient {",
                "  private readonly client: Anthropic;",
                "",
                "  constructor(private config: ConfigService) {",
                "    this.client = new Anthropic({",
                "      apiKey: this.config.get<string>('ANTHROPIC_API_KEY'),",
                "    });",
                "  }",
                "",
                "  async complete(system: string, userPrompt: string, maxTokens = 500) {",
                "    const response = await this.client.messages.create({",
                "      model: 'claude-sonnet-4-5',",
                "      max_tokens: maxTokens,",
                "      system,",
                "      messages: [{ role: 'user', content: userPrompt }],",
                "    });",
                "    return (response.content[0] as { text: string }).text;",
                "  }",
                "}",
            ]),
            gap(120),

            h2("5.3 The 7 AI features — implementation detail"),
            dataTable(
                ["Feature", "Phase", "Prompt strategy", "Returns"],
                [2200, 1000, 3960, 2200],
                [
                    ["Task description enhancer", "1", "System: 'Rewrite rough task into structured JSON with title, description, requiredSkills[], deliverables[], estimatedHours. Respond only in JSON, no markdown.'", "EnhancedTaskDto (JSON)"],
                    ["Skill extractor from bio", "1", "System: 'Extract skill tags from worker bio. Return JSON array of lowercase hyphenated strings, max 8 items. E.g. [\"data-entry\",\"ms-excel\"]. No markdown.'", "string[] (skill tags)"],
                    ["Task quality scorer", "2", "System: 'Score this task 1-10 for: clarity (is it clear what to do?), fairness (is budget fair for scope?), scam risk (is this suspicious?). Return JSON: {clarity, fairness, scamRisk, overall, flags[]}.'", "TaskScoreDto (JSON)"],
                    ["Match explainer", "2", "System: 'In exactly one sentence, explain why this worker was matched to this task. Be specific about which skills matched. Tone: friendly and encouraging.'", "string (1 sentence)"],
                    ["Dispute summariser", "2", "System: 'You are a neutral mediator. Summarise this task dispute in 3 bullet points: what worker claims, what business claims, what the evidence suggests. Be factual and neutral.'", "string (3 bullets)"],
                    ["Career path advisor", "3", "System: 'Based on this worker task history, suggest 3 higher-paying skill areas to learn next. For each: skill name, why it fits their current skills, average pay uplift. Return JSON array.'", "CareerAdviceDto[] (JSON)"],
                    ["Bangla translator", "3", "System: 'Translate the following task description to natural, friendly Bangla. Keep skill tags in English. Return only the translated text, no explanation.'", "string (Bangla text)"],
                ],
                NAVY, NAVY_L
            ),
            gap(120),

            h2("5.4 Full example — Task enhancer service"),
            codeBlock([
                "// ai-service/src/task-enhancer/task-enhancer.service.ts",
                "import { Injectable } from '@nestjs/common';",
                "import { AnthropicClient } from '../anthropic.client';",
                "",
                "@Injectable()",
                "export class TaskEnhancerService {",
                "  constructor(private readonly ai: AnthropicClient) {}",
                "",
                "  async enhance(roughInput: string): Promise<EnhancedTaskDto> {",
                "    const system = `",
                "      You are a task writing assistant for a micro-freelance platform in Bangladesh.",
                "      Rewrite the user's rough input into a structured task posting.",
                "      Respond ONLY with valid JSON matching this shape:",
                "      {",
                "        title: string,          // 5-10 words, clear action verb",
                "        description: string,    // 2 sentences, what to do and why",
                "        requiredSkills: string[], // max 5 lowercase hyphenated tags",
                "        deliverables: string[], // bullet list of what to hand over",
                "        estimatedHours: number  // realistic for a part-time worker",
                "      }",
                "      No markdown, no explanation, only the JSON object.`,",
                "",
                "    const raw = await this.ai.complete(system, roughInput, 400);",
                "",
                "    try {",
                "      return JSON.parse(raw) as EnhancedTaskDto;",
                "    } catch {",
                "      throw new Error(`AI returned invalid JSON: ${raw}`);",
                "    }",
                "  }",
                "}",
            ]),
            gap(120),

            h2("5.5 How other services call ai-service"),
            codeBlock([
                "// task-service calls ai-service over HTTP before saving task",
                "// task-service/src/tasks/tasks.service.ts",
                "",
                "@Injectable()",
                "export class TasksService {",
                "  constructor(",
                "    private readonly tasksRepo: TaskRepository,",
                "    private readonly aiClient: HttpService,  // Axios HttpService",
                "  ) {}",
                "",
                "  async createTask(dto: CreateTaskDto, businessId: string) {",
                "    // 1. Enhance the task description via AI",
                "    const enhanced = await this.aiClient",
                "      .post('http://ai-service:3007/enhance-task', { roughInput: dto.description })",
                "      .toPromise();",
                "",
                "    // 2. Score it — reject if scam risk is high",
                "    const score = await this.aiClient",
                "      .post('http://ai-service:3007/score-task', { task: enhanced.data })",
                "      .toPromise();",
                "",
                "    if (score.data.scamRisk > 7) {",
                "      throw new BadRequestException('Task flagged for review. Please rewrite.');",
                "    }",
                "",
                "    // 3. Save the enhanced task",
                "    const task = TaskFactory.create({ ...dto, ...enhanced.data, businessId });",
                "    return this.tasksRepo.save(task);",
                "  }",
                "}",
            ]),
            gap(120),

            h2("5.6 Environment variables needed"),
            codeBlock([
                "# apps/ai-service/.env",
                "ANTHROPIC_API_KEY=sk-ant-api03-xxxxx   # Get from console.anthropic.com",
                "PORT=3007",
                "NODE_ENV=development",
                "",
                "# Cost guard — never spend more than $5 in one day (set in Anthropic console)",
                "# Log every Claude call for cost tracking",
                "AI_LOG_REQUESTS=true",
                "AI_MAX_TOKENS_PER_REQUEST=1000",
            ]),
            divider(),

            // ══════════════════════════════════════════════════════════════════════
            // SECTION 6: PATTERNS.md TEMPLATE
            // ══════════════════════════════════════════════════════════════════════
            h1("6. PATTERNS.md — Recruiter Portfolio File"),
            body("This file lives at the repo root and is the single most impactful file for recruiters after the README. It documents every design pattern used, why it was chosen, and where in the code it lives. Update it with every PR that introduces a new pattern."),
            gap(80),
            codeBlock([
                "# Design Patterns Catalogue — RuralGig",
                "",
                "## Behavioural Patterns",
                "",
                "### Strategy Pattern",
                "**Location:** `apps/matching-service/src/strategies/`",
                "**Where used:** Matching engine uses pluggable scoring strategies:",
                "  - SkillScoringStrategy — scores workers by skill overlap with task",
                "  - LocationScoringStrategy — scores workers by proximity (Haversine formula)",
                "  - RatingScoringStrategy — weights workers by past performance rating",
                "**Why chosen:** Allows adding a new scoring dimension without modifying the",
                "  matching engine. Open/Closed Principle in practice.",
                "**Trade-off:** Requires CompositeScorer to aggregate scores — adds indirection.",
                "",
                "### Chain of Responsibility",
                "**Location:** `apps/matching-service/src/pipeline/`",
                "**Where used:** Match filter pipeline — each handler decides pass/reject:",
                "  AvailabilityFilter -> SkillFilter -> LocationFilter -> BudgetFilter -> Scorer",
                "**Why chosen:** Clean separation of filter concerns. Easy to add/remove filters.",
                "",
                "### Observer / Domain Events",
                "**Location:** `packages/shared-events/` + all services",
                "**Where used:** Task lifecycle changes publish events to RabbitMQ.",
                "  All other services react without tight coupling to task-service.",
                "**Why chosen:** Enables independent deployability of each microservice.",
                "",
                "## Creational Patterns",
                "",
                "### Factory Pattern",
                "**Location:** `apps/task-service/src/domain/task.factory.ts`",
                "**Where used:** TaskFactory.create() enforces invariants (budget > 0,",
                "  deadline in future, at least one skill required) before saving.",
                "",
                "### Builder Pattern",
                "**Location:** `apps/task-service/src/domain/task.builder.ts`",
                "**Where used:** Complex task construction in tests and seeding.",
                "",
                "## Structural Patterns",
                "",
                "### Adapter Pattern",
                "**Location:** `apps/payment-service/src/gateways/`",
                "**Where used:** BkashAdapter, StripeAdapter — both implement PaymentGateway",
                "  interface. Swap providers without touching business logic.",
                "",
                "### Decorator Pattern",
                "**Location:** `apps/matching-service/src/decorators/`",
                "**Where used:** LoggedScorer wraps any ScoringStrategy and logs",
                "  input/output without modifying the strategy itself.",
                "",
                "## Architectural Patterns",
                "",
                "### CQRS",
                "### Saga",
                "### Outbox",
                "### Repository",
                "### Specification",
                "### Event Sourcing",
                "<!-- Document each as you implement it — same format as above -->",
            ]),
            divider(),

            // ══════════════════════════════════════════════════════════════════════
            // SECTION 7: FIRST WEEK CHECKLIST
            // ══════════════════════════════════════════════════════════════════════
            h1("7. Week 1 Action Checklist"),
            body("Complete these tasks in order on Day 1 before writing any feature code. They establish the foundation that everything else builds on."),
            gap(80),
            dataTable(
                ["Day", "Tasks", "Output"],
                [1200, 5760, 2400],
                [
                    ["Day 1", "Install Node 20, Docker Desktop, VS Code. Run npx create-turbo@latest ruralgig. Commit the empty monorepo to GitHub with a descriptive README.", "GitHub repo live, README explains the project"],
                    ["Day 1", "Write docs/adr/ADR-001.md — why event-driven architecture. Do not write any code until this is done. Commit it as the second commit.", "ADR-001 committed"],
                    ["Day 2", "Write docs/openapi.yaml — define the first 5 API endpoints with request/response schemas. Use Swagger editor (editor.swagger.io) to validate.", "API contract committed"],
                    ["Day 2", "Write packages/shared-types/src/index.ts — Task, Worker, SkillTag, Money, TaskStatus interfaces. These are your domain model in TypeScript.", "Shared types committed"],
                    ["Day 3", "Create infra/docker-compose.yml. Run docker compose up -d and confirm Postgres, Redis, RabbitMQ all start. Screenshot the running containers.", "Infrastructure running locally"],
                    ["Day 3", "Scaffold auth-service with NestJS CLI. Install dependencies. Create AuthModule with a single POST /auth/register endpoint that returns a hardcoded response.", "First endpoint returning 200 OK"],
                    ["Day 4", "Set up GitHub Actions CI (.github/workflows/ci.yml). Push to a feature branch. Open a PR. Watch the CI pipeline run green.", "Green CI pipeline on first PR"],
                    ["Day 4", "Add .github/PULL_REQUEST_TEMPLATE.md and .github/CODEOWNERS. Enable branch protection on main and develop.", "Branch protection active"],
                    ["Day 5", "Create apps/ai-service. Install @anthropic-ai/sdk. Get API key from console.anthropic.com. Implement the task enhancer endpoint. Test with Postman.", "AI service returning enhanced task JSON"],
                    ["Day 5", "Write the first entry in docs/PATTERNS.md — document the Strategy pattern from matching-service even if matching-service does not exist yet. ADR before code.", "PATTERNS.md started"],
                ],
                NAVY, NAVY_L
            ),
            gap(200),
            new Paragraph({
                alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 },
                children: [new TextRun({ text: "— End of Document —", font: "Arial", size: 18, color: "AAAAAA", italics: true })]
            }),
            gap(80),
        ]
    }]
});

Packer.toBuffer(doc).then(buf => {
    fs.writeFileSync('developer_setup_guide.docx', buf);
    console.log('Developer Setup Guide doc done');
});