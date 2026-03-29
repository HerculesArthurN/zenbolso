# STACK.md — ZenBolso Technology Stack

## Language & Runtime
- **Language:** TypeScript 5.7 (strict mode, noUnusedLocals, noUnusedParameters)
- **Module system:** ESNext (`"type": "module"`)
- **Target:** ES2020
- **JSX:** react-jsx

## Build & Dev Tools
| Tool | Version | Role |
|------|---------|------|
| Vite | ^6.0.3 | Build tool & dev server (port 3000) |
| `@vitejs/plugin-react` | ^4.3.4 | React transform |
| `vite-plugin-pwa` | ^1.2.0 | PWA / Service Worker |
| TypeScript | ^5.7.2 | Type checking |
| Vitest | ^4.0.17 | Unit test runner |
| Playwright | ^1.58.0 | E2E tests |

## Core Framework
- **React:** ^19.0.0 (concurrent features, auto-batching)
- **React DOM:** ^19.0.0
- **Routing:** `react-router-dom` v7 — `BrowserRouter` + lazy code splitting

## Styling
- **Tailwind CSS:** ^3.4.16 — Mobile-first, `max-w-[430px]` constraint
- **tailwind-merge:** ^2.5.5 — Conflict-free class merging
- **clsx:** ^2.1.1 — Conditional class composition
- **PostCSS:** ^8.4.20 + Autoprefixer

## Local-First Database (Primary Source of Truth)
- **Dexie:** ^4.0.10 — IndexedDB ORM
- **dexie-react-hooks:** ^4.2.0 — `useLiveQuery` for reactive DB reads

### Schema (`src/services/db.ts`) — DB Name: `PocketManagerDB` v4
| Table | Key | Indexes |
|-------|-----|---------|
| `transactions` | `id` | `date, type, category, accountId` |
| `accounts` | `id` | — |
| `categories` | `id` | `type, name` |
| `recurringConfigs` | `id` | `active` |
| `recurring_transactions` | `id` | `active, day_of_month` |
| `settings` | `id` | — |
| `goals` | `id` | — |
| `sync_queue` | `++id` | `type, status, entity_id` |

## State Management
| Layer | Library | Purpose |
|-------|---------|---------|
| Reactive DB | `useLiveQuery` (dexie-react-hooks) | Real-time IndexedDB reads |
| Server state | `@tanstack/react-query` v5 | Supabase API cache + retry |
| UI state | `useState` / React Context | Ephemeral UI state |
| Contexts | `DataContext`, `SessionContext`, `ThemeContext`, `ToastContext` | Global UI state |

## Encryption & Security
- **`crypto-js`:** ^4.2.0 — AES encryption for field-level data encryption on remote sync
- **Web Crypto API (native):** SHA-256 hashing for PIN storage (`src/services/securityService.ts`)
- All transaction `value` and `description` fields are encrypted before remote storage

## Data & Logic Utilities
| Library | Version | Use |
|---------|---------|-----|
| `date-fns` | ^4.1.0 | All date manipulation |
| `uuid` | ^11.0.3 | ID generation |
| `rrule` | ^2.8.1 | Recurring transaction schedules |
| `fuse.js` | ^7.0.0 | Fuzzy search |
| `zod` | ^4.3.6 | Schema validation (forms, external data) |

## Remote Sync (Optional)
- **`@supabase/supabase-js`:** ^2.97.0 — Optional cloud sync (not primary truth)
- Configured via `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` env vars
- Degrades gracefully if credentials are missing

## Charting & Export
| Library | Use |
|---------|-----|
| `recharts` ^2.15.0 | Dashboard charts |
| `@react-pdf/renderer` ^4.3.2 | PDF report generation |
| `jspdf` ^4.1.0 | Additional PDF export |
| `html2canvas` ^1.4.1 | Screenshot to canvas |
| `file-saver` ^2.0.5 | Browser file download |
| `framer-motion` ^12.38.0 | Animations & transitions |
| `lucide-react` ^0.469.0 | Icon system |

## PWA Configuration
- `registerType: 'prompt'` — User-prompted SW updates
- Theme color: `#0f172a` (dark slate)
- Display: `standalone`, orientation: `portrait`
- Icons: 192x192 and 512x512 PNG

## Environment Variables
```
VITE_SUPABASE_URL=        # Optional — remote sync
VITE_SUPABASE_ANON_KEY=   # Optional — remote sync
```

## Scripts
```bash
npm run dev       # Vite dev server on port 3000
npm run build     # tsc && vite build
npm run preview   # Preview production build
npm run test      # Vitest unit tests
npx playwright test  # E2E tests (requires dev server)
```
