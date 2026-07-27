# Orphic Frontend v2

A blended Next.js 16 frontend for the Orphic AI agent. Built on `@base-ui/react` primitives, combined with curated components from the upstream `assistant-ui` registry, layered on top of the original `my-orphic-frontend` (custom landing page, chat, connectors, auth, API, custom assistant-ui components).

## Source material

This project is a blend of:
- **`my-orphic-frontend/`** — your original custom frontend (landing page, chat, connectors, auth, custom Orphic components)
- **`orphic-registry/`** — the upstream `assistant-ui` registry's components (high/medium/low value)

The old registry README content is preserved at the bottom of this file for reference.

## Project structure

```
orphic-frontend-v2/
├── app/                            ← your custom app routes
│   ├── layout.tsx                  ← root layout (Inter font, TooltipProvider)
│   ├── page.tsx                    ← custom Orphic landing page (1046 lines)
│   ├── globals.css                 ← your theme tokens
│   ├── chat/                       ← chat route (assistant.tsx, page.tsx, [threadId]/page.tsx)
│   ├── connectors/                 ← connectors route
│   └── api/                        ← API routes (auth/login, auth/callback, chat)
│
├── auth/
│   └── scalekit-client.ts          ← Scalekit auth client
│
├── lib/
│   ├── api.ts                      ← Orphic API helpers
│   ├── orphicAdapter.ts            ← assistant-ui → Orphic backend adapter
│   └── utils.ts                    ← cn() helper
│
├── public/                         ← 30 SVG icons (github, notion, slack, gemini, etc.)
│
├── components/
│   ├── ui/                         ← 16 of YOUR shadcn-style base primitives (currently in use)
│   ├── ui/base/                    ← 18 registry reference versions (base UI flavor — same primitive lib as yours, may differ in variants)
│   ├── assistant-ui/               ← 18 of YOUR custom assistant-ui components (sidebar, thread, thread-list, etc.) — currently in use
│   ├── assistant-ui-registry/      ← 50 registry assistant-ui components (incl. .radix variants) — reference, not yet imported
│   └── oauth-handler.tsx           ← OAuth flow helper
│
├── package.json                    ← deps incl. @base-ui/react, @assistant-ui/*, ai, @scalekit-sdk/node
├── tsconfig.json, next.config.ts, postcss.config.mjs, eslint.config.mjs
├── components.json                 ← shadcn config (style: base-nova, baseColor: neutral)
├── .env                            ← Scalekit env vars
├── AGENTS.md / CLAUDE.md           ← Next.js 16 breaking-change notice
└── README.md                       ← this file
```

## Folder conventions

### `components/ui/` (active, in-use)
Your existing 16 base primitives. **All current imports use this path** (`@/components/ui/button`, etc.). Don't move things out of here without updating all imports.

### `components/ui/base/` (reference library)
The 18 registry files copied from `_assistant-ui/packages/ui/src/components/ui/base/`. These are alternative implementations of the same primitives — almost always a drop-in match (both use `@base-ui/react`), but with different style/variants.

**Use this when:** you want to upgrade a primitive to the registry's canonical version, or you need a primitive you don't have (e.g., `command.tsx`, `sidebar.tsx`).

To activate a file from `ui/base/`:
1. Compare it to your current `ui/<name>.tsx`
2. If the registry's version is better, replace your `ui/<name>.tsx` with it (or copy it back to `ui/` and delete from `base/`)
3. If it adds a new primitive (e.g., `command.tsx`), copy it to `ui/` and import as `@/components/ui/command`

### `components/assistant-ui/` (registry library)
The 50 registry files. **Not currently imported by your app code** — they are available for when you want to add new features.

When you want to add a component (e.g., `model-selector.tsx`):
1. Check if there's a `.radix.tsx` variant — those are typically safer to use with your stack
2. The non-`.radix.tsx` files in this folder are Base UI flavor — your project also uses Base UI so they should drop in cleanly too
3. Copy the file to `components/assistant-ui-custom/` (your custom dir) before importing, or just import directly from `assistant-ui/`

### `components/assistant-ui/` (your custom components, active)
Your 18 custom assistant-ui components. **Currently in use** by your chat/assistant code via imports like `@/components/assistant-ui/thread`. **No import changes needed.**

### `components/assistant-ui-registry/` (registry library, reference)
The 50 registry files. **Not currently imported by your app code** — they are available for when you want to add new features.

When you want to add a component (e.g., `model-selector.tsx`):
1. Pick the file from `assistant-ui-registry/`
2. Copy it to `components/assistant-ui/` (or directly import it from the registry folder while you test it)
3. Wire it into your chat code

## What to do next

1. **No import-path changes needed.** Your existing chat code keeps working: `@/components/assistant-ui/thread` still resolves to your custom `thread.tsx` (now in the active `assistant-ui/` folder), and `@/components/ui/button` still resolves to your `ui/button.tsx`.

2. **Pick components to activate**: From the registry inventory below, start with the top 6 high-value pieces:
   - `command.tsx` (⌘K palette) — in `ui/base/`
   - `sidebar.tsx` (shadcn sidebar primitive) — in `ui/base/`
   - `model-selector.radix.tsx` (in-chat model picker) — in `assistant-ui-registry/`
   - `context-display.radix.tsx` (token/context display) — in `assistant-ui-registry/`
   - `mcp-config.radix.tsx` (MCP server config) — in `assistant-ui-registry/`
   - `select.radix.tsx` (form select) — in `assistant-ui-registry/`

3. **Install missing deps** when you activate a component (check the imports at the top of each file).

---

# Registry inventory (preserved from `orphic-registry/README.md`)

## ⚠️ Originally: registry was thought to be Radix-flavored. ACTUALLY: both yours and the registry are **Base UI** (`@base-ui/react`) flavor. Components drop in cleanly.

## `components/ui/base/` (18 files)

| File | Status | Recommendation |
|---|---|---|
| `avatar`, `badge`, `breadcrumb`, `button`, `collapsible`, `dialog`, `dropdown-menu`, `input`, `kbd`, `label`, `popover`, `separator`, `sheet`, `skeleton`, `switch`, `tooltip` | ✅ already have in `ui/` | reference only |
| **`command.tsx`** | ❌ missing from `ui/` | **Top priority** — ⌘K palette |
| **`sidebar.tsx`** | ❌ missing from `ui/` | **Top priority** — shadcn sidebar primitive |

## `components/assistant-ui/` (50 files)

### 🟢 HIGH-VALUE
- `model-selector.tsx` + `model-selector.radix.tsx` — in-chat model picker
- `context-display.tsx` + `context-display.radix.tsx` — token/context display
- `mcp-config.tsx` + `mcp-config.radix.tsx` — MCP server config
- `threadlist-sidebar.tsx` + `threadlist-sidebar.radix.tsx` — threadlist sidebar
- `tabs.tsx` + `tabs.radix.tsx`
- `select.tsx` + `select.radix.tsx`
- `accordion.tsx` + `accordion.radix.tsx`
- `attachment.radix.tsx`, `tooltip-icon-button.radix.tsx`, `message-timing.radix.tsx`, `badge.radix.tsx`

### 🟡 MEDIUM
- `assistant-modal.tsx` + `.radix.tsx`
- `assistant-sidebar.tsx`
- `composer-trigger-popover.tsx`
- `file.tsx`, `image.tsx`, `quote.tsx`, `sources.tsx`
- `flow.tsx`, `flow-expand.tsx`, `flow-canvas.tsx`
- `voice.tsx`
- `shiki-highlighter.tsx`, `syntax-highlighter.tsx`
- `directive-text.tsx`

### 🔵 LOW
- `diff-viewer.tsx`, `mermaid-diagram.tsx`, `heat-graph.tsx`, `logos.tsx`, `number-roll.tsx`

## Source paths (in the cloned repo at `_assistant-ui/`)
- Base UI: `packages/ui/src/components/ui/base/`
- Assistant UI: `packages/ui/src/components/assistant-ui/`
