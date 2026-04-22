const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, Footer, Header, TabStopType, TabStopPosition
} = require('docx');
const fs = require('fs');

const ACCENT = "1D4E8C";
const ACCENT_LIGHT = "E8F0FB";
const ACCENT2 = "1D9E75";
const ACCENT2_LIGHT = "E1F5EE";
const AMBER = "BA7517";
const AMBER_LIGHT = "FAEEDA";
const GRAY = "444441";
const GRAY_LIGHT = "F1EFE8";
const WHITE = "FFFFFF";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 120 },
    children: [new TextRun({ text, font: "Arial", size: 32, bold: true, color: ACCENT })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 100 },
    children: [new TextRun({ text, font: "Arial", size: 26, bold: true, color: ACCENT })]
  });
}

function h3(text) {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 22, bold: true, color: GRAY })]
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 60, after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: GRAY, ...opts })]
  });
}

function bullet(text, sub = false) {
  return new Paragraph({
    numbering: { reference: "bullets", level: sub ? 1 : 0 },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: GRAY })]
  });
}

function gap(size = 120) {
  return new Paragraph({ spacing: { before: size, after: 0 }, children: [new TextRun("")] });
}

function divider() {
  return new Paragraph({
    spacing: { before: 160, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD", space: 1 } },
    children: [new TextRun("")]
  });
}

function infoBox(title, items, color = ACCENT_LIGHT, titleColor = ACCENT) {
  const rows = [
    new TableRow({
      children: [new TableCell({
        borders,
        width: { size: 9360, type: WidthType.DXA },
        shading: { fill: color, type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 60, left: 180, right: 180 },
        children: [new Paragraph({
          spacing: { before: 0, after: 0 },
          children: [new TextRun({ text: title, font: "Arial", size: 22, bold: true, color: titleColor })]
        })]
      })]
    }),
    ...items.map(item => new TableRow({
      children: [new TableCell({
        borders,
        width: { size: 9360, type: WidthType.DXA },
        shading: { fill: WHITE, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 180, right: 180 },
        children: [new Paragraph({
          spacing: { before: 0, after: 0 },
          children: [new TextRun({ text: item, font: "Arial", size: 20, color: GRAY })]
        })]
      })]
    }))
  ];
  return new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360], rows });
}

function phaseTable(phase, weeks, goal, tasks) {
  const headerRow = new TableRow({
    children: [
      new TableCell({
        borders, width: { size: 1800, type: WidthType.DXA },
        shading: { fill: ACCENT, type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        children: [new Paragraph({ children: [new TextRun({ text: phase, font: "Arial", size: 22, bold: true, color: WHITE })] })]
      }),
      new TableCell({
        borders, width: { size: 1800, type: WidthType.DXA },
        shading: { fill: ACCENT, type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        children: [new Paragraph({ children: [new TextRun({ text: weeks, font: "Arial", size: 20, color: "BBDDFF" })] })]
      }),
      new TableCell({
        borders, width: { size: 5760, type: WidthType.DXA },
        shading: { fill: ACCENT, type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 140, right: 140 },
        children: [new Paragraph({ children: [new TextRun({ text: "Goal: " + goal, font: "Arial", size: 20, color: "BBDDFF" })] })]
      })
    ]
  });
  const taskRows = tasks.map((t, i) => new TableRow({
    children: [
      new TableCell({
        borders, width: { size: 1800, type: WidthType.DXA },
        shading: { fill: i % 2 === 0 ? ACCENT_LIGHT : WHITE, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 140, right: 140 },
        children: [new Paragraph({ children: [new TextRun({ text: t.category, font: "Arial", size: 18, bold: true, color: ACCENT })] })]
      }),
      new TableCell({
        borders, width: { size: 7560, type: WidthType.DXA },
        columnSpan: 2,
        shading: { fill: i % 2 === 0 ? ACCENT_LIGHT : WHITE, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 140, right: 140 },
        children: [new Paragraph({ children: [new TextRun({ text: t.detail, font: "Arial", size: 20, color: GRAY })] })]
      })
    ]
  }));
  return new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [1800, 1800, 5760], rows: [headerRow, ...taskRows] });
}

function twoColTable(left, right, lColor = ACCENT_LIGHT, rColor = ACCENT2_LIGHT) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [4620, 4740],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders, width: { size: 4620, type: WidthType.DXA },
            shading: { fill: lColor, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: left
          }),
          new TableCell({
            borders, width: { size: 4740, type: WidthType.DXA },
            shading: { fill: rColor, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: right
          })
        ]
      })
    ]
  });
}

const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          {
            level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 600, hanging: 300 } } }
          },
          {
            level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 960, hanging: 300 } } }
          }
        ]
      },
      {
        reference: "numbers",
        levels: [
          {
            level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 600, hanging: 300 } } }
          }
        ]
      }
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: ACCENT },
        paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: ACCENT },
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
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD", space: 1 } },
          spacing: { before: 0, after: 120 },
          children: [new TextRun({ text: "RuralGig — Platform Development Plan & SDLC", font: "Arial", size: 18, color: "888888" })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD", space: 1 } },
          spacing: { before: 120, after: 0 },
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          children: [
            new TextRun({ text: "Confidential — Internal Document", font: "Arial", size: 16, color: "AAAAAA" }),
            new TextRun({ text: "\tPage ", font: "Arial", size: 16, color: "AAAAAA" }),
            new TextRun({ text: "", font: "Arial", size: 16, color: "AAAAAA" })
          ]
        })]
      })
    },
    children: [
      // ── COVER ──
      gap(2400),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: "RuralGig", font: "Arial", size: 72, bold: true, color: ACCENT })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 40 },
        children: [new TextRun({ text: "AI-Powered Micro-Freelance Platform for Rural & Underserved Talent", font: "Arial", size: 30, color: ACCENT2 })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [new TextRun({ text: "Platform Development Plan & SDLC", font: "Arial", size: 24, color: GRAY, italics: true })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 0 },
        border: { top: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 1 }, bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 1 } },
        children: [new TextRun({ text: "Node.js / TypeScript  |  April 2026  |  4-Month Build Roadmap", font: "Arial", size: 20, color: "666666" })]
      }),
      gap(3000),

      // ── EXECUTIVE SUMMARY ──
      h1("Executive Summary"),
      body("RuralGig is an AI-powered micro-freelance marketplace that connects skilled workers in underserved and rural communities with businesses that need short-term task help. By combining intelligent matching algorithms, AI-assisted task quality control, and a frictionless mobile-first experience, the platform creates economic opportunity for workers who are currently excluded from the digital gig economy."),
      gap(80),
      body("This document outlines the complete product development plan, SDLC approach, technical architecture, and phase-by-phase build roadmap for delivering an MVP in 4 months using a Node.js / TypeScript monorepo."),
      gap(80),
      twoColTable(
        [
          new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "Platform Highlights", font: "Arial", size: 20, bold: true, color: ACCENT })] }),
          new Paragraph({ spacing: { before: 20, after: 20 }, children: [new TextRun({ text: "8 microservices in Turborepo monorepo", font: "Arial", size: 20, color: GRAY })] }),
          new Paragraph({ spacing: { before: 20, after: 20 }, children: [new TextRun({ text: "12+ GoF design patterns applied", font: "Arial", size: 20, color: GRAY })] }),
          new Paragraph({ spacing: { before: 20, after: 20 }, children: [new TextRun({ text: "7 AI integration touchpoints (Claude API)", font: "Arial", size: 20, color: GRAY })] }),
          new Paragraph({ spacing: { before: 20, after: 20 }, children: [new TextRun({ text: "Event-driven architecture with RabbitMQ", font: "Arial", size: 20, color: GRAY })] }),
          new Paragraph({ spacing: { before: 20, after: 0 }, children: [new TextRun({ text: "bKash + Stripe payment integration", font: "Arial", size: 20, color: GRAY })] }),
        ],
        [
          new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "Social & Business Impact", font: "Arial", size: 20, bold: true, color: ACCENT2 })] }),
          new Paragraph({ spacing: { before: 20, after: 20 }, children: [new TextRun({ text: "Creates income for rural workers with smartphones", font: "Arial", size: 20, color: GRAY })] }),
          new Paragraph({ spacing: { before: 20, after: 20 }, children: [new TextRun({ text: "Specifically designed for Bangladesh market", font: "Arial", size: 20, color: GRAY })] }),
          new Paragraph({ spacing: { before: 20, after: 20 }, children: [new TextRun({ text: "10% platform fee revenue model (Month 3+)", font: "Arial", size: 20, color: GRAY })] }),
          new Paragraph({ spacing: { before: 20, after: 20 }, children: [new TextRun({ text: "NGO partnership pipeline for user acquisition", font: "Arial", size: 20, color: GRAY })] }),
          new Paragraph({ spacing: { before: 20, after: 0 }, children: [new TextRun({ text: "Bangla language AI support for accessibility", font: "Arial", size: 20, color: GRAY })] }),
        ]
      ),
      divider(),

      // ── SDLC ──
      h1("SDLC: Agile + Domain-Driven Design"),
      body("The chosen SDLC is Agile with DDD (Domain-Driven Design) sprints. Waterfall is ruled out because product requirements will evolve once real workers use the platform. Pure Scrum without DDD leads to services that are not cleanly separated. DDD defines the domain model upfront; Agile provides the delivery cadence."),

      h2("Why Agile + DDD?"),
      twoColTable(
        [
          new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "Agile gives us", font: "Arial", size: 20, bold: true, color: ACCENT })] }),
          new Paragraph({ spacing: { before: 20, after: 20 }, children: [new TextRun({ text: "Iterative delivery with real user feedback", font: "Arial", size: 20, color: GRAY })] }),
          new Paragraph({ spacing: { before: 20, after: 20 }, children: [new TextRun({ text: "Ability to pivot based on early traction", font: "Arial", size: 20, color: GRAY })] }),
          new Paragraph({ spacing: { before: 20, after: 20 }, children: [new TextRun({ text: "2-week sprint cadence for disciplined delivery", font: "Arial", size: 20, color: GRAY })] }),
          new Paragraph({ spacing: { before: 20, after: 0 }, children: [new TextRun({ text: "Retrospectives to improve engineering process", font: "Arial", size: 20, color: GRAY })] }),
        ],
        [
          new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "DDD gives us", font: "Arial", size: 20, bold: true, color: ACCENT2 })] }),
          new Paragraph({ spacing: { before: 20, after: 20 }, children: [new TextRun({ text: "Clearly bounded contexts for each service", font: "Arial", size: 20, color: GRAY })] }),
          new Paragraph({ spacing: { before: 20, after: 20 }, children: [new TextRun({ text: "Ubiquitous language across team and code", font: "Arial", size: 20, color: GRAY })] }),
          new Paragraph({ spacing: { before: 20, after: 20 }, children: [new TextRun({ text: "Aggregate roots to enforce invariants", font: "Arial", size: 20, color: GRAY })] }),
          new Paragraph({ spacing: { before: 20, after: 0 }, children: [new TextRun({ text: "Domain events as the backbone of the system", font: "Arial", size: 20, color: GRAY })] }),
        ]
      ),
      gap(120),

      h2("Sprint Structure (2-Week Sprints)"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1800, 5760, 1800],
        rows: [
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 1800, type: WidthType.DXA }, shading: { fill: ACCENT, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 140, right: 140 }, children: [new Paragraph({ children: [new TextRun({ text: "Days", font: "Arial", size: 20, bold: true, color: WHITE })] })] }),
              new TableCell({ borders, width: { size: 5760, type: WidthType.DXA }, shading: { fill: ACCENT, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 140, right: 140 }, children: [new Paragraph({ children: [new TextRun({ text: "Activities", font: "Arial", size: 20, bold: true, color: WHITE })] })] }),
              new TableCell({ borders, width: { size: 1800, type: WidthType.DXA }, shading: { fill: ACCENT, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 140, right: 140 }, children: [new Paragraph({ children: [new TextRun({ text: "Output", font: "Arial", size: 20, bold: true, color: WHITE })] })] }),
            ]
          }),
          ...[
            ["Day 1–2", "Design sprint: write ADR for any new architectural decision, update domain model, write OpenAPI spec for new endpoints before touching code", "ADR doc, API spec"],
            ["Day 3–10", "Build: feature work, pattern implementation, unit and integration tests written alongside (not after) the code", "Merged feature branch"],
            ["Day 11–12", "Harden: code review, load test any new hot path, update PATTERNS.md, record Loom if the feature is demo-worthy", "Updated docs"],
            ["Day 13–14", "Retrospective and planning: what technical debt was incurred, what pattern could be applied better, plan next sprint", "Next sprint backlog"]
          ].map(([d, a, o], i) => new TableRow({
            children: [
              new TableCell({ borders, width: { size: 1800, type: WidthType.DXA }, shading: { fill: i % 2 === 0 ? ACCENT_LIGHT : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 140, right: 140 }, children: [new Paragraph({ children: [new TextRun({ text: d, font: "Arial", size: 20, bold: true, color: ACCENT })] })] }),
              new TableCell({ borders, width: { size: 5760, type: WidthType.DXA }, shading: { fill: i % 2 === 0 ? ACCENT_LIGHT : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 140, right: 140 }, children: [new Paragraph({ children: [new TextRun({ text: a, font: "Arial", size: 20, color: GRAY })] })] }),
              new TableCell({ borders, width: { size: 1800, type: WidthType.DXA }, shading: { fill: i % 2 === 0 ? ACCENT_LIGHT : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 140, right: 140 }, children: [new Paragraph({ children: [new TextRun({ text: o, font: "Arial", size: 18, color: ACCENT2, italics: true })] })] }),
            ]
          }))
        ]
      }),
      divider(),

      // ── ARCHITECTURE ──
      h1("System Architecture"),
      body("Each microservice owns its own PostgreSQL schema. No service reads another service's database directly — only via domain events (RabbitMQ) or synchronous API calls. This is the architectural principle that makes the codebase maintainable at scale."),
      gap(100),
      infoBox("Bounded Contexts (8 Microservices)", [
        "auth-service         — JWT, OTP verification, refresh token rotation",
        "task-service         — Task CRUD, state machine, CQRS read/write split",
        "worker-service       — Profiles, skill tags, ratings, earnings ledger",
        "matching-service     — Bipartite matching algorithm, priority queue ranking",
        "payment-service      — Saga orchestration, bKash/Stripe adapters, wallet",
        "notification-service — WebSocket gateway, SMS, email dispatch",
        "ai-service           — Claude API: task enhancer, skill extractor, dispute summariser",
        "admin-service        — Dashboard, fraud detection, analytics read model"
      ], ACCENT_LIGHT, ACCENT),
      gap(120),

      h2("Architecture Decision Records (ADRs)"),
      body("Five ADRs must be written before the corresponding code is written. These turn the GitHub repository from 'just code' into a portfolio demonstrating engineering judgment."),
      gap(80),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1440, 2880, 5040],
        rows: [
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 1440, type: WidthType.DXA }, shading: { fill: ACCENT, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "ADR", font: "Arial", size: 19, bold: true, color: WHITE })] })] }),
              new TableCell({ borders, width: { size: 2880, type: WidthType.DXA }, shading: { fill: ACCENT, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Decision", font: "Arial", size: 19, bold: true, color: WHITE })] })] }),
              new TableCell({ borders, width: { size: 5040, type: WidthType.DXA }, shading: { fill: ACCENT, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Trade-offs Covered", font: "Arial", size: 19, bold: true, color: WHITE })] })] }),
            ]
          }),
          ...[
            ["ADR-001", "Event-driven over synchronous REST", "Loose coupling vs eventual consistency, debugging complexity"],
            ["ADR-002", "CQRS for task feed", "Read/write ratio 100:1, Redis read model cost vs freshness"],
            ["ADR-003", "Saga over 2-phase commit", "Compensating transactions, failure scenarios, complexity"],
            ["ADR-004", "Bipartite matching over keyword search", "Algorithm complexity, match quality, cold start problem"],
            ["ADR-005", "Schema-per-business multi-tenancy", "Isolation vs migration complexity vs performance"]
          ].map(([a, d, t], i) => new TableRow({
            children: [
              new TableCell({ borders, width: { size: 1440, type: WidthType.DXA }, shading: { fill: i % 2 === 0 ? ACCENT_LIGHT : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: a, font: "Arial", size: 19, bold: true, color: ACCENT })] })] }),
              new TableCell({ borders, width: { size: 2880, type: WidthType.DXA }, shading: { fill: i % 2 === 0 ? ACCENT_LIGHT : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: d, font: "Arial", size: 19, color: GRAY })] })] }),
              new TableCell({ borders, width: { size: 5040, type: WidthType.DXA }, shading: { fill: i % 2 === 0 ? ACCENT_LIGHT : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: t, font: "Arial", size: 19, color: GRAY })] })] }),
            ]
          }))
        ]
      }),
      divider(),

      // ── 4 PHASES ──
      h1("4-Phase Build Roadmap"),

      h2("Phase 1 — Foundation & Core Architecture (Weeks 1–3)"),
      body("Goal: Running skeleton with auth + task CRUD. Focus on domain modeling, service boundaries, and API contracts before any feature code."),
      gap(80),
      phaseTable("Phase 1", "Weeks 1–3", "Auth + Task CRUD skeleton running", [
        { category: "Architecture", detail: "Define bounded contexts, design AsyncAPI event schema, set up Turborepo monorepo with shared TypeScript types, establish OpenAPI-first development, write ADR-001" },
        { category: "Patterns", detail: "Repository Pattern (abstract DB access), Unit of Work (transaction boundaries), Factory (TaskFactory / WorkerFactory), Value Objects (Money, SkillTag, Location), Aggregate Root" },
        { category: "Infrastructure", detail: "Docker Compose: PostgreSQL + Redis + RabbitMQ + pgAdmin, Node.js + Nest.js service template, JWT auth with refresh token rotation, GitHub Actions CI pipeline" },
        { category: "Deliverables", detail: "Worker registration & profile creation, task posting by businesses, basic task browsing with pagination, authenticated Swagger UI, architecture diagram in README" }
      ]),
      gap(120),

      h2("Phase 2 — Matching Engine & DSA Core (Weeks 4–7)"),
      body("Goal: Workers receive AI-ranked, personalized task feeds in real time. This phase contains the most complex algorithmic work."),
      gap(80),
      phaseTable("Phase 2", "Weeks 4–7", "Smart worker-to-task matching live", [
        { category: "DSA", detail: "Weighted bipartite matching (min-cost max-flow), Priority Queue / Min-Heap for urgency scheduling (custom TS impl), Trie for skill autocomplete (O(L) lookup), Sliding window for feed deduplication, Levenshtein distance for skill normalization" },
        { category: "Patterns", detail: "Strategy (pluggable scoring: skill-based, location-based, rating-based), Chain of Responsibility (match filter pipeline), Observer (task events trigger re-matching), Specification Pattern (composable match criteria), Decorator (add logging to any scoring strategy)" },
        { category: "Architecture", detail: "CQRS split: TaskWriteService and TaskReadService, Redis read model for high-volume task feed, Matching service as isolated microservice publishing MatchFound events, write ADR-002" },
        { category: "Deliverables", detail: "Personalized task feed per worker skill profile, skill autocomplete <5ms, PATTERNS.md documenting each algorithm with complexity analysis, unit tests ≥90% coverage on all DSA components" }
      ]),
      gap(120),

      h2("Phase 3 — Payments, Real-Time & Fraud (Weeks 8–12)"),
      body("Goal: Workers can complete tasks and receive payment. This phase handles money movement, live notifications, and trust & safety."),
      gap(80),
      phaseTable("Phase 3", "Weeks 8–12", "End-to-end task completion with payout", [
        { category: "Architecture", detail: "Saga pattern for distributed payment transactions (orchestration-based), Outbox pattern for reliable event publishing (no dual-write bugs), multi-currency wallet with double-entry bookkeeping, WebSocket gateway for real-time task updates, write ADR-003" },
        { category: "Patterns", detail: "Adapter (wrap bKash, Stripe, Nagad behind PaymentGateway interface), Template Method (validate → reserve → execute → settle), State Machine (full task lifecycle), Idempotency Key pattern, Circuit Breaker (opossum lib)" },
        { category: "DSA / Fraud", detail: "Sliding window rate limiter (Redis), anomaly scoring with z-score on task completion time distribution, graph cycle detection for collusion rings in rating network, Bloom filter for duplicate submission detection, token bucket for API rate limiting" },
        { category: "Deliverables", detail: "Full task flow: post → claim → submit → approve → payout, real-time notifications, bKash sandbox integration, fraud dashboard with anomaly alerts, chaos engineering test for saga recovery" }
      ]),
      gap(120),

      h2("Phase 4 — Scale, Polish & Launch (Weeks 13–16)"),
      body("Goal: Public beta with 50 real users onboarded. Observability, AI features, and going live."),
      gap(80),
      phaseTable("Phase 4", "Weeks 13–16", "50 real users, live revenue", [
        { category: "Architecture", detail: "Horizontal scaling with Nginx load balancer (stateless services), event sourcing for audit log (immutable task history), read replica PostgreSQL for reporting, CDN + presigned S3 URLs for file uploads, basic Kubernetes Helm chart" },
        { category: "AI Features", detail: "Claude API: auto-generate task descriptions, extract skills from worker bio, score task quality and flag scam-risk postings, AI-powered dispute resolution summary, 'Workers who completed this also liked…' recommendations, Bangla language support" },
        { category: "Observability", detail: "OpenTelemetry distributed tracing (Jaeger/Tempo), Prometheus + Grafana dashboards, structured logging with Pino and correlation IDs, automated DB migrations with Flyway, OWASP top-10 security audit via Snyk" },
        { category: "Deliverables", detail: "Live demo URL with real sample data, ADR-001 to ADR-005 published in repository, 5-minute Loom walkthrough of architecture + live demo, PATTERNS.md complete, case study blog post published" }
      ]),
      divider(),

      // ── TECH STACK ──
      h1("Technology Stack"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 3510, 3510],
        rows: [
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: ACCENT, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Layer", font: "Arial", size: 19, bold: true, color: WHITE })] })] }),
              new TableCell({ borders, width: { size: 3510, type: WidthType.DXA }, shading: { fill: ACCENT, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Technology", font: "Arial", size: 19, bold: true, color: WHITE })] })] }),
              new TableCell({ borders, width: { size: 3510, type: WidthType.DXA }, shading: { fill: ACCENT, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Why", font: "Arial", size: 19, bold: true, color: WHITE })] })] }),
            ]
          }),
          ...[
            ["Runtime", "Node.js 20 LTS + TypeScript 5.x strict", "Type safety, async performance, large ecosystem"],
            ["Framework", "Nest.js", "Enforces modular architecture, built-in DI, great for microservices"],
            ["Validation", "Zod", "Runtime type safety, composable schemas"],
            ["ORM", "Prisma + PostgreSQL 16", "Type-safe queries, migration management"],
            ["Cache / PubSub", "Redis 7", "Read model cache, distributed locks, pub/sub"],
            ["Message broker", "RabbitMQ", "Reliable event delivery, dead-letter queues"],
            ["Job queues", "BullMQ", "Retry logic, priority queues, cron scheduling"],
            ["Testing", "Vitest + Supertest + k6", "Unit, integration, and load testing"],
            ["Monorepo", "Turborepo", "Shared types, parallel builds, caching"],
            ["CI/CD", "GitHub Actions", "Lint → test → build → deploy pipeline"],
            ["AI", "Anthropic Claude API", "Task enhancement, skill extraction, dispute resolution"],
            ["Observability", "OpenTelemetry + Pino", "Distributed tracing, structured logging"]
          ].map(([l, t, w], i) => new TableRow({
            children: [
              new TableCell({ borders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: i % 2 === 0 ? ACCENT_LIGHT : WHITE, type: ShadingType.CLEAR }, margins: { top: 72, bottom: 72, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: l, font: "Arial", size: 19, bold: true, color: ACCENT })] })] }),
              new TableCell({ borders, width: { size: 3510, type: WidthType.DXA }, shading: { fill: i % 2 === 0 ? ACCENT_LIGHT : WHITE, type: ShadingType.CLEAR }, margins: { top: 72, bottom: 72, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: t, font: "Arial", size: 19, color: GRAY })] })] }),
              new TableCell({ borders, width: { size: 3510, type: WidthType.DXA }, shading: { fill: i % 2 === 0 ? ACCENT_LIGHT : WHITE, type: ShadingType.CLEAR }, margins: { top: 72, bottom: 72, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: w, font: "Arial", size: 19, color: GRAY })] })] }),
            ]
          }))
        ]
      }),
      divider(),

      // ── AI INTEGRATION ──
      h1("AI Integration: 7 Touchpoints"),
      body("The Claude API (Anthropic) powers seven distinct features. These are not cosmetic additions — each directly reduces friction, improves match quality, or builds user trust."),
      gap(100),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2700, 1440, 5220],
        rows: [
          new TableRow({
            children: [
              new TableCell({ borders, width: { size: 2700, type: WidthType.DXA }, shading: { fill: ACCENT, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Feature", font: "Arial", size: 19, bold: true, color: WHITE })] })] }),
              new TableCell({ borders, width: { size: 1440, type: WidthType.DXA }, shading: { fill: ACCENT, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Phase", font: "Arial", size: 19, bold: true, color: WHITE })] })] }),
              new TableCell({ borders, width: { size: 5220, type: WidthType.DXA }, shading: { fill: ACCENT, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Impact", font: "Arial", size: 19, bold: true, color: WHITE })] })] }),
            ]
          }),
          ...[
            ["Task description generator", "Phase 1", "Business types 2 rough sentences → AI rewrites into structured task with required skills, deliverables, and time estimate. Reduces low-quality postings by ~60%."],
            ["Skill extractor from bio", "Phase 1", "Worker writes free-text bio → AI extracts structured skill tags. Seeds the Trie automatically. Removes friction from worker onboarding."],
            ["Smart match explainer", "Phase 2", "When a task is matched, AI generates a 1-sentence explanation. Builds worker trust in the algorithm and reduces match rejection rate."],
            ["Task quality scorer", "Phase 2", "Before a task goes live, AI scores it 1–10 for clarity, fairness, and scam risk. Tasks below 5 are flagged. Protects workers from exploitative postings."],
            ["Dispute summariser", "Phase 2", "AI reads all messages + submission and writes a neutral summary for admin review. Cuts manual review time from 20 minutes to 2 minutes."],
            ["Career path advisor", "Phase 3", "After 5 completed tasks, AI analyses history and suggests skill areas to learn next. Increases worker retention and lifetime value."],
            ["Bangla language support", "Phase 3", "Task descriptions and notifications auto-translated to Bangla. Enables rural workers who struggle with English to participate fully."]
          ].map(([f, p, i], idx) => new TableRow({
            children: [
              new TableCell({ borders, width: { size: 2700, type: WidthType.DXA }, shading: { fill: idx % 2 === 0 ? ACCENT_LIGHT : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: f, font: "Arial", size: 19, bold: true, color: ACCENT })] })] }),
              new TableCell({ borders, width: { size: 1440, type: WidthType.DXA }, shading: { fill: idx % 2 === 0 ? ACCENT_LIGHT : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: p, font: "Arial", size: 19, color: ACCENT2 })] })] }),
              new TableCell({ borders, width: { size: 5220, type: WidthType.DXA }, shading: { fill: idx % 2 === 0 ? ACCENT_LIGHT : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: i, font: "Arial", size: 19, color: GRAY })] })] }),
            ]
          }))
        ]
      }),
      divider(),

      // ── REVENUE ──
      h1("Revenue Model"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1800, 2160, 5400],
        rows: [
          new TableRow({
            children: [
              new TableCell({ borders, shading: { fill: ACCENT, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Timeline", font: "Arial", size: 19, bold: true, color: WHITE })] })] }),
              new TableCell({ borders, shading: { fill: ACCENT, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Revenue Stream", font: "Arial", size: 19, bold: true, color: WHITE })] })] }),
              new TableCell({ borders, shading: { fill: ACCENT, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Details", font: "Arial", size: 19, bold: true, color: WHITE })] })] }),
            ]
          }),
          ...[
            ["Month 1–2", "Free (trust building)", "No fees. Collect testimonials and fix bugs with real usage."],
            ["Month 3+", "10% platform fee", "On every completed task payout. Workers keep 90%. Businesses pay nothing — incentivizes supply-side growth."],
            ["Month 5+", "Business SaaS subscription", "$20–50/month for bulk posting, analytics dashboard, priority matching."],
            ["Month 8+", "Premium worker profiles", "$5/month for verified badge, portfolio showcase, higher feed ranking."]
          ].map(([t, r, d], i) => new TableRow({
            children: [
              new TableCell({ borders, shading: { fill: i % 2 === 0 ? AMBER_LIGHT : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: t, font: "Arial", size: 19, bold: true, color: AMBER })] })] }),
              new TableCell({ borders, shading: { fill: i % 2 === 0 ? AMBER_LIGHT : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: r, font: "Arial", size: 19, bold: true, color: GRAY })] })] }),
              new TableCell({ borders, shading: { fill: i % 2 === 0 ? AMBER_LIGHT : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: d, font: "Arial", size: 19, color: GRAY })] })] }),
            ]
          }))
        ]
      }),
      gap(200),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
        children: [new TextRun({ text: "— End of Document —", font: "Arial", size: 18, color: "AAAAAA", italics: true })]
      }),
      gap(80),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('Platform_Development_Plan_and_SDLC.docx', buf);
  console.log('Platform Development Plan and SDLC doc done');
});