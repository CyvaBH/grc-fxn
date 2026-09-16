# [Product] — Virtual GRC Function Awareness Officer

> Know what compliance applies to your business. Get your personalized action plan, policies, and deadline reminders in 15 minutes.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Language:** TypeScript
- **Deployment:** Vercel

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Auth pages (login, signup)
│   ├── (dashboard)/      # App shell (dashboard, profile, policies, etc.)
│   ├── onboarding/       # Profiler questionnaire
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # Reusable UI components
│   └── layout/           # Sidebar, TopBar, MobileNav
├── lib/
│   └── utils.ts          # cn() helper
content/
└── regulations/          # Regulation library (Markdown)
```

## Design System

See `DESIGN_SYSTEM.md` in the project root for tokens, components, and patterns.

## Companion Docs

- `BUILD_PLAN.md` — Architecture, phased plan, metrics
- `PRD.md` — Requirements, personas, user journeys
- `BRAND.md` — Voice, messaging, visual identity
- `DESIGN_SYSTEM.md` — Tokens, components, layouts
- `SELF_IMPROVING_AGENT.md` — AI agent spec
- `DECISIONS.md` — Cross-cutting decisions log

## Deployment

Push to GitHub → connect to Vercel → auto-deploy on main.

```bash
git add .
git commit -m "Initial commit: MVP scaffold"
git push origin main
```
