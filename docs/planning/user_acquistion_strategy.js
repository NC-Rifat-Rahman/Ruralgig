const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
    LevelFormat, Footer, Header, TabStopType, TabStopPosition
} = require('docx');
const fs = require('fs');

const ACCENT = "1D9E75";
const ACCENT_L = "E1F5EE";
const BLUE = "1D4E8C";
const BLUE_L = "E8F0FB";
const AMBER = "BA7517";
const AMBER_L = "FAEEDA";
const CORAL = "993C1D";
const CORAL_L = "FAECE7";
const GRAY = "444441";
const WHITE = "FFFFFF";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

const h1 = (text) => new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 120 },
    children: [new TextRun({ text, font: "Arial", size: 32, bold: true, color: BLUE })]
});
const h2 = (text) => new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 100 },
    children: [new TextRun({ text, font: "Arial", size: 26, bold: true, color: BLUE })]
});
const h3 = (text) => new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 22, bold: true, color: ACCENT })]
});
const body = (text) => new Paragraph({
    spacing: { before: 60, after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: GRAY })]
});
const bullet = (text, level = 0) => new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: GRAY })]
});
const gap = (n = 120) => new Paragraph({ spacing: { before: n, after: 0 }, children: [new TextRun("")] });
const divider = () => new Paragraph({
    spacing: { before: 160, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD", space: 1 } },
    children: [new TextRun("")]
});

function colorBox(title, content, fill, titleColor) {
    return new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [
            new TableRow({
                children: [new TableCell({
                    borders,
                    shading: { fill, type: ShadingType.CLEAR },
                    margins: { top: 120, bottom: 120, left: 200, right: 200 },
                    children: [
                        new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: title, font: "Arial", size: 22, bold: true, color: titleColor })] }),
                        new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: content, font: "Arial", size: 20, color: GRAY })] })
                    ]
                })]
            })
        ]
    });
}

function channelTable(rows) {
    return new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2160, 2160, 5040],
        rows: [
            new TableRow({
                children: [
                    new TableCell({ borders, shading: { fill: BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Channel", font: "Arial", size: 19, bold: true, color: WHITE })] })] }),
                    new TableCell({ borders, shading: { fill: BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Targets", font: "Arial", size: 19, bold: true, color: WHITE })] })] }),
                    new TableCell({ borders, shading: { fill: BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Tactics", font: "Arial", size: 19, bold: true, color: WHITE })] })] }),
                ]
            }),
            ...rows.map(([c, t, d], i) => new TableRow({
                children: [
                    new TableCell({ borders, shading: { fill: i % 2 === 0 ? BLUE_L : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: c, font: "Arial", size: 19, bold: true, color: BLUE })] })] }),
                    new TableCell({ borders, shading: { fill: i % 2 === 0 ? BLUE_L : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: t, font: "Arial", size: 19, color: ACCENT, bold: true })] })] }),
                    new TableCell({ borders, shading: { fill: i % 2 === 0 ? BLUE_L : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: d, font: "Arial", size: 19, color: GRAY })] })] }),
                ]
            }))
        ]
    });
}

function roadmapTable(rows) {
    return new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1440, 2880, 2520, 2520],
        rows: [
            new TableRow({
                children: [
                    new TableCell({ borders, shading: { fill: BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Week", font: "Arial", size: 18, bold: true, color: WHITE })] })] }),
                    new TableCell({ borders, shading: { fill: BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Action", font: "Arial", size: 18, bold: true, color: WHITE })] })] }),
                    new TableCell({ borders, shading: { fill: BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Worker target", font: "Arial", size: 18, bold: true, color: WHITE })] })] }),
                    new TableCell({ borders, shading: { fill: BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: "Business target", font: "Arial", size: 18, bold: true, color: WHITE })] })] }),
                ]
            }),
            ...rows.map(([w, a, wt, bt], i) => new TableRow({
                children: [
                    new TableCell({ borders, shading: { fill: i % 2 === 0 ? BLUE_L : WHITE, type: ShadingType.CLEAR }, margins: { top: 72, bottom: 72, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: w, font: "Arial", size: 18, bold: true, color: BLUE })] })] }),
                    new TableCell({ borders, shading: { fill: i % 2 === 0 ? BLUE_L : WHITE, type: ShadingType.CLEAR }, margins: { top: 72, bottom: 72, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: a, font: "Arial", size: 18, color: GRAY })] })] }),
                    new TableCell({ borders, shading: { fill: i % 2 === 0 ? BLUE_L : WHITE, type: ShadingType.CLEAR }, margins: { top: 72, bottom: 72, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: wt, font: "Arial", size: 18, color: ACCENT })] })] }),
                    new TableCell({ borders, shading: { fill: i % 2 === 0 ? BLUE_L : WHITE, type: ShadingType.CLEAR }, margins: { top: 72, bottom: 72, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: bt, font: "Arial", size: 18, color: CORAL })] })] }),
                ]
            }))
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
            }
        ]
    },
    styles: {
        default: { document: { run: { font: "Arial", size: 22 } } },
        paragraphStyles: [
            {
                id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 32, bold: true, font: "Arial", color: BLUE },
                paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 }
            },
            {
                id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 26, bold: true, font: "Arial", color: BLUE },
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
                    children: [new TextRun({ text: "RuralGig — User Acquisition Strategy", font: "Arial", size: 18, color: "888888" })]
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
                        new TextRun({ text: "\tRuralGig Growth Playbook", font: "Arial", size: 16, color: "AAAAAA" })
                    ]
                })]
            })
        },
        children: [
            // COVER
            gap(2400),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "RuralGig", font: "Arial", size: 72, bold: true, color: ACCENT })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 }, children: [new TextRun({ text: "User Acquisition Strategy", font: "Arial", size: 36, bold: true, color: BLUE })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "Zero-Budget Growth Playbook for a Two-Sided Marketplace", font: "Arial", size: 24, color: GRAY, italics: true })] }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 80, after: 0 },
                border: { top: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 1 }, bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 1 } },
                children: [new TextRun({ text: "Workers + Businesses  |  Chattogram, Bangladesh  |  April 2026", font: "Arial", size: 20, color: "666666" })]
            }),
            gap(3000),

            // OVERVIEW
            h1("Overview"),
            body("RuralGig is a two-sided marketplace: workers supply task skills, businesses supply task demand. Growing both sides simultaneously with zero budget is the classic chicken-and-egg challenge. This playbook outlines the proven strategies to solve it, specifically tailored to the Chattogram, Bangladesh market."),
            gap(80),
            new Table({
                width: { size: 9360, type: WidthType.DXA },
                columnWidths: [4620, 4740],
                rows: [new TableRow({
                    children: [
                        new TableCell({
                            borders, shading: { fill: ACCENT_L, type: ShadingType.CLEAR }, margins: { top: 120, bottom: 120, left: 180, right: 180 }, children: [
                                new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "The Core Problem", font: "Arial", size: 20, bold: true, color: BLUE })] }),
                                new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: "No workers = businesses won't join. No businesses = workers won't join. The strategy is to constrain geography first — launch in one neighborhood of Chattogram. Density beats spread at zero budget.", font: "Arial", size: 20, color: GRAY })] })
                            ]
                        }),
                        new TableCell({
                            borders, shading: { fill: BLUE_L, type: ShadingType.CLEAR }, margins: { top: 120, bottom: 120, left: 180, right: 180 }, children: [
                                new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "The Core Metric", font: "Arial", size: 20, bold: true, color: ACCENT })] }),
                                new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: "Measure one metric obsessively in the first 90 days: Time from signup to first completed task and payment received. Under 72 hours = you will grow. Over one week = no marketing can save you.", font: "Arial", size: 20, color: GRAY })] })
                            ]
                        }),
                    ]
                })]
            }),
            divider(),

            // STRATEGY 1
            h1("Strategy 1: The 'Fake Demand' Launch"),
            body("Before the platform is ready, you become the first business client. Go to 10 small local businesses near you and offer to find them a task worker for free. You manually match them yourself using WhatsApp. You are the platform."),
            gap(80),
            body("This does three things: it gives you real tasks to show workers; it teaches you what businesses actually need (not what you assumed); and it gives you your first 10 success stories before launch."),
            gap(100),
            colorBox(
                "Script for approaching businesses",
                "\"I am building a platform to connect businesses with skilled part-time workers. I want to test it with you for free — you post a task, I find you someone in 24 hours. No cost, no commitment.\" Nobody says no to free.",
                AMBER_L, AMBER
            ),
            gap(100),
            body("Target businesses: pharmacy, print shop, tutoring centre, small e-commerce seller, photography studio, translation office, accounting firm, clothing boutique, IT repair shop, food delivery operation."),
            divider(),

            // STRATEGY 2
            h1("Strategy 2: Worker Acquisition"),
            body("Workers in underserved communities are not on LinkedIn. Go to where they already are. Your value proposition is simple: 'Get paid for skills you already have.'"),
            gap(100),
            channelTable([
                ["University campuses", "CS, BBA, Arts students", "Visit CUET, Premier University, BGC Trust. Poster with QR code. Offer ৳200 signup bonus for first 20 workers (costs ৳4,000 — worth every taka as seed supply)."],
                ["Facebook Groups", "Local freelancers", "Search 'Chittagong Freelancers', 'BD Online Income', 'চট্টগ্রাম চাকরি ও ব্যবসা'. Post a genuine story, not an ad. Reference specific skills and waiting tasks."],
                ["Vocational institutes", "Skilled graduates", "Partner with one institute = 50 workers overnight. Students have skills (bookkeeping, Bangla typing, calligraphy) but zero gig economy access."],
                ["Offline micro-events", "Community members", "Rent a community room for ৳500, run a 1-hour 'How to earn online' workshop. Sign everyone up on the spot. Teach the platform. Creates loyalty no ad can buy."],
                ["Madrasa networks", "Rural skilled workers", "Arabic typing, data entry, calligraphy skills are in demand. Untapped by every other platform. Partner with madrasa admin for instant community trust."]
            ]),
            divider(),

            // STRATEGY 3
            h1("Strategy 3: Business Acquisition"),
            body("Businesses care about one thing: reliable workers, fast. Your pitch is not 'join our platform.' It is 'I will find you a data entry person by tomorrow.'"),
            gap(100),
            h2("Primary Channels"),
            channelTable([
                ["Cold walk-ins", "Small business owners", "5 businesses per day. Dress well, ask for the owner (not the manager). Offer the first three tasks completely free. Walk-ins convert better than emails in Chattogram."],
                ["Facebook e-commerce sellers", "BD Facebook shop owners", "Thousands of small FB-based sellers need photo editing, order management, and customer replies but cannot afford full-time staff. DM them personally referencing their specific store."],
                ["Freelance agencies", "Outsourcing firms", "One agency sends 20 tasks at once. Find on LinkedIn and BdJobs. Offer to be their overflow capacity at a discounted rate during beta."],
                ["B2B referrals", "Business networks", "When a task completes successfully, send: 'Do you know another business who struggles to find reliable help? Refer them and get ৳500 credit.' Business owners talk to each other constantly."]
            ]),
            gap(120),
            colorBox(
                "Cold walk-in pitch (30 seconds)",
                "\"We help small businesses find skilled task workers in under 24 hours, with zero upfront cost. The first three tasks are completely free — no registration fee, no subscription. Can I show you how it works?\"",
                CORAL_L, CORAL
            ),
            divider(),

            // STRATEGY 4
            h1("Strategy 4: Built-in Referral Loop"),
            body("Build referral into the product from day one, not as an afterthought. This is your most powerful zero-budget acquisition channel because referrals carry trust you cannot manufacture."),
            gap(100),
            new Table({
                width: { size: 9360, type: WidthType.DXA },
                columnWidths: [4620, 4740],
                rows: [new TableRow({
                    children: [
                        new TableCell({
                            borders, shading: { fill: ACCENT_L, type: ShadingType.CLEAR }, margins: { top: 120, bottom: 120, left: 180, right: 180 }, children: [
                                new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "Worker referral", font: "Arial", size: 20, bold: true, color: ACCENT })] }),
                                new Paragraph({ spacing: { before: 0, after: 20 }, children: [new TextRun({ text: "Every worker gets a personal invite link.", font: "Arial", size: 20, color: GRAY })] }),
                                new Paragraph({ spacing: { before: 0, after: 20 }, children: [new TextRun({ text: "For each friend who completes their first task, the referrer earns ৳100 platform credit.", font: "Arial", size: 20, color: GRAY })] }),
                                new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: "Workers are motivated because it feels like helping a friend, not selling a product.", font: "Arial", size: 20, color: GRAY })] })
                            ]
                        }),
                        new TableCell({
                            borders, shading: { fill: AMBER_L, type: ShadingType.CLEAR }, margins: { top: 120, bottom: 120, left: 180, right: 180 }, children: [
                                new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "Business referral", font: "Arial", size: 20, bold: true, color: AMBER })] }),
                                new Paragraph({ spacing: { before: 0, after: 20 }, children: [new TextRun({ text: "After a successful task, send: 'Do you know another business who struggles to find reliable help?'", font: "Arial", size: 20, color: GRAY })] }),
                                new Paragraph({ spacing: { before: 0, after: 20 }, children: [new TextRun({ text: "If they refer someone who posts their first task, they receive ৳500 credit.", font: "Arial", size: 20, color: GRAY })] }),
                                new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: "Target: each completed task generates 1.2 new users. The 0.2 excess drives exponential growth.", font: "Arial", size: 20, color: GRAY })] })
                            ]
                        }),
                    ]
                })]
            }),
            divider(),

            // STRATEGY 5
            h1("Strategy 5: Content for Organic Growth"),
            body("Create content that each side of the platform wants to share. The goal is not reach — it is word-of-mouth amplification from people who already trust your platform."),
            gap(100),
            h2("For workers — aspirational content"),
            body("Post on Facebook and TikTok (both are massive in Bangladesh). Format: real person, real earnings, real story."),
            gap(60),
            colorBox(
                "Content formula (Facebook/TikTok post)",
                "\"Meet Rafi — he earns ৳8,000 per month doing data entry from his phone between university classes. He started 6 weeks ago with zero experience in freelancing. Here is exactly how he did it...\" [Link to worker profile on platform]",
                ACCENT_L, ACCENT
            ),
            gap(100),
            h2("For businesses — practical value content"),
            body("Short posts that make business owners look smart in front of their peers. They share these because the content saves face, not because they are promoting your platform."),
            gap(60),
            colorBox(
                "Example business content post",
                "\"5 tasks you can outsource for under ৳500 that will save you 10 hours this week: product photography editing, customer message replies, order tracking updates, social media scheduling, invoice creation. Here is where to find reliable people for each...\"",
                BLUE_L, BLUE
            ),
            gap(100),
            h2("For recruiters and press — problem awareness content"),
            body("A Medium or LinkedIn article about the problem itself (not your platform) gets shared by NGOs, journalists, and development organizations. These then introduce you to businesses and worker communities you would never reach otherwise."),
            gap(60),
            colorBox(
                "Article title example",
                "\"Why 40% of skilled young people in Chattogram cannot find work despite having 3 years of experience\" — This kind of piece gets shared by BRAC, The Daily Star, and development organizations. It positions you as someone who understands the problem, not just someone selling a product.",
                CORAL_L, CORAL
            ),
            divider(),

            // STRATEGY 6
            h1("Strategy 6: NGO & Development Organization Partnerships"),
            body("This is the highest-leverage zero-budget channel and most founders miss it completely. Organizations like BRAC, Grameenphone, UNDP Bangladesh, and local chambers of commerce are actively looking for platforms that create economic opportunity."),
            gap(100),
            new Table({
                width: { size: 9360, type: WidthType.DXA },
                columnWidths: [3120, 3120, 3120],
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({ borders, shading: { fill: BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Organization", font: "Arial", size: 19, bold: true, color: WHITE })] })] }),
                            new TableCell({ borders, shading: { fill: BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "What they want", font: "Arial", size: 19, bold: true, color: WHITE })] })] }),
                            new TableCell({ borders, shading: { fill: BLUE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "What you get", font: "Arial", size: 19, bold: true, color: WHITE })] })] }),
                        ]
                    }),
                    ...[
                        ["BRAC", "Economic inclusion metrics for annual reports and donor presentations", "Access to training graduates — potentially 500+ workers from existing programmes"],
                        ["Grameenphone (GP)", "Digital economic inclusion stories for CSR reporting", "Possible co-marketing + SMS credits for worker notifications"],
                        ["UNDP Bangladesh", "Evidence-based impact data for SDG reporting (Goal 8)", "International credibility, possible grant funding for platform expansion"],
                        ["Local Chamber of Commerce", "Tools that help member businesses reduce costs", "Direct access to 200+ local businesses as potential task posters"],
                        ["CUET / Premier University", "Employment outcomes for their graduates", "Campus ambassador programme, student worker pipeline, office space for events"]
                    ].map(([o, w, y], i) => new TableRow({
                        children: [
                            new TableCell({ borders, shading: { fill: i % 2 === 0 ? BLUE_L : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: o, font: "Arial", size: 18, bold: true, color: BLUE })] })] }),
                            new TableCell({ borders, shading: { fill: i % 2 === 0 ? BLUE_L : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: w, font: "Arial", size: 18, color: GRAY })] })] }),
                            new TableCell({ borders, shading: { fill: i % 2 === 0 ? BLUE_L : WHITE, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: y, font: "Arial", size: 18, color: ACCENT })] })] }),
                        ]
                    }))
                ]
            }),
            gap(120),
            colorBox(
                "NGO pitch formula (email to programme officer — not the general inbox)",
                "\"We are a platform that converts your training graduates into earners. You train them, we give them the marketplace. For every graduate who earns their first ৳1,000 on RuralGig, we send you a data point for your impact report. Would you have 20 minutes to explore a pilot?\" — Attach a 1-page impact brief. NGO people respond to impact language, not startup language.",
                AMBER_L, AMBER
            ),
            divider(),

            // 90-DAY ROADMAP
            h1("90-Day Traction Roadmap"),
            body("A week-by-week plan with specific targets. These are not aspirational — they are the minimum numbers needed to establish product-market fit before introducing any paid features."),
            gap(100),
            roadmapTable([
                ["Week 1–2", "Manual matching (be the platform), campus posters at CUET and Premier University, 10 cold walk-in business visits", "20 workers signed", "5 businesses signed"],
                ["Week 3–4", "Platform beta launch, Facebook group posts in 5 local groups, first referral campaign activated", "50 workers", "15 businesses, 10 tasks completed"],
                ["Week 5–6", "First NGO partnership pitch (BRAC programme officer), first worker success story post with real person and real numbers", "+100 workers from NGO pipeline", "20 businesses"],
                ["Week 7–8", "Offline 'Earn online' workshop event #1 (৳500 room rental), e-commerce seller DM campaign on Facebook", "200 workers total", "40 businesses"],
                ["Week 9–10", "Press outreach: Prothom Alo tech desk, The Daily Star startup page, Tech Shah Alam blog", "250 workers", "First media coverage"],
                ["Week 11–12", "Introduce 10% platform fee to paying users, measure churn carefully, double down on what worked best", "300 workers", "First ৳ revenue"],
            ]),
            divider(),

            // KEY INSIGHT
            h1("The Single Most Important Insight"),
            gap(80),
            new Table({
                width: { size: 9360, type: WidthType.DXA },
                columnWidths: [9360],
                rows: [new TableRow({
                    children: [new TableCell({
                        borders: { top: { style: BorderStyle.SINGLE, size: 8, color: ACCENT, space: 0 }, bottom: border, left: border, right: border },
                        shading: { fill: ACCENT_L, type: ShadingType.CLEAR },
                        margins: { top: 200, bottom: 200, left: 240, right: 240 },
                        children: [
                            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "The platform does not grow when you add features.", font: "Arial", size: 28, bold: true, color: BLUE })] }),
                            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: "It grows when one person successfully earns money and tells three friends.", font: "Arial", size: 26, color: GRAY })] }),
                            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: "Everything - your tech, your matching algorithm, your UI - is in service of that first successful transaction happening as fast as possible.", font: "Arial", size: 22, color: GRAY, italics: true })] })
                        ]
                    })]
                })],
            }),
            gap(120),
            h2("Your North Star Metric"),
            body("Time from signup to first completed task and payment received."),
            gap(60),
            new Table({
                width: { size: 9360, type: WidthType.DXA },
                columnWidths: [4680, 4680],
                rows: [new TableRow({
                    children: [
                        new TableCell({
                            borders, shading: { fill: ACCENT_L, type: ShadingType.CLEAR }, margins: { top: 120, bottom: 120, left: 180, right: 180 }, children: [
                                new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "Under 72 hours", font: "Arial", size: 22, bold: true, color: ACCENT })] }),
                                new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: "You will grow. Workers tell their friends. Businesses post more tasks. The referral loop activates naturally.", font: "Arial", size: 20, color: GRAY })] })
                            ]
                        }),
                        new TableCell({
                            borders, shading: { fill: CORAL_L, type: ShadingType.CLEAR }, margins: { top: 120, bottom: 120, left: 180, right: 180 }, children: [
                                new Paragraph({ spacing: { before: 0, after: 60 }, children: [new TextRun({ text: "Over one week", font: "Arial", size: 22, bold: true, color: CORAL })] }),
                                new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: "No marketing strategy in this document will save you. Fix the product flow first, then acquire users.", font: "Arial", size: 20, color: GRAY })] })
                            ]
                        }),
                    ]
                })]
            }),
            gap(200),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [new TextRun({ text: "— End of Document —", font: "Arial", size: 18, color: "AAAAAA", italics: true })] }),
            gap(80),
        ]
    }]
});

Packer.toBuffer(doc).then(buf => {
    fs.writeFileSync('RuralGig_User_Acquisition_Strategy.docx', buf);
    console.log('RuralGig User Acquisition Strategy doc done');
});