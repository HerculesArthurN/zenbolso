# ARCHITECTURE.md — ZenBolso System Design

## Pattern
**Local-First SPA (Single Page Application)**

The core architectural philosophy is "offline-first, privacy-first":
- IndexedDB (via Dexie) is the primary source of truth
- The UI is a React SPA inside a mobile-constrained shell
- Remote sync (Supabase, Google Drive) is optional and encrypted end-to-end
- Zero server dependency for core functionality

---

## Layer Architecture

```
┌──────────────────────────────────────────────┐
│  UI Layer (Components + Pages)               │
│  Pure UI — no DB access, no business logic   │
├──────────────────────────────────────────────┤
│  Hook Layer (src/hooks/)                     │
│  State bridging — DB reactivity + UI state   │
├──────────────────────────────────────────────┤
│  Service Layer (src/services/)               │
│  Business logic + direct Dexie access        │
├──────────────────────────────────────────────┤
│  Database Layer (Dexie / IndexedDB)          │
│  PocketManagerDB — persistent local store    │
├──────────────────────────────────────────────┤
│  (Optional) Remote Layer                     │
│  Supabase / Google Drive — encrypted backup  │
└──────────────────────────────────────────────┘
```

---

## Data Flow (Read — Reactive)

```
IndexedDB → useLiveQuery (dexie-react-hooks)
         → Custom Hook (e.g. useFinanceData)
         → Page Component (smart)
         → UI Component (dumb/pure)
```

## Data Flow (Write)

```
User Action (Form) → Custom Hook (useTransactionForm)
                   → Zod validation
                   → Service (transactionService.createTransaction)
                   → Encrypt fields
                   → db.transactions.put()
                   → Optimistic UI update
```

---

## Application Entry Points

| File | Purpose |
|------|---------|
| `index.html` | HTML shell |
| `index.tsx` | React root mount |
| `src/App.tsx` | Provider tree + router |

### Provider Nesting (App.tsx)
```tsx
<SessionProvider>
  <ThemeProvider>
    <ToastProvider>
      <DataProvider>
        <BrowserRouter>
          <AppLockScreen />        // Security interceptor
          <OnboardingWizard />     // First-run flow
          <AppRoutes />            // Main routing
          <ReloadPrompt />         // PWA update prompt
          <InstallPrompt />        // PWA install
        </BrowserRouter>
      </DataProvider>
    </ToastProvider>
  </ThemeProvider>
</SessionProvider>
```

---

## Routing Architecture

- **Router:** React Router v7, `BrowserRouter`
- **Critical path (static):** `LandingPage`, `Dashboard`
- **Lazy loaded:** `TransactionsPage`, `Planning`, `SettingsPage`, `RecurringPage`, `ReportsPage`
- **Onboarding gate:** `SessionContext.hasSeenOnboarding` → redirect to `/dashboard` or show `LandingPage`

### Routes
| Path | Component | Loading |
|------|-----------|---------|
| `/` | LandingPage or redirect | Static |
| `/about` | LandingPage | Static |
| `/dashboard` | Dashboard | Static |
| `/transactions` | TransactionsPage | Lazy |
| `/planning` | Planning | Lazy |
| `/recurring` | RecurringPage | Lazy |
| `/reports` | ReportsPage | Lazy |
| `/settings` | SettingsPage | Lazy |

---

## Security Architecture

### App Lock
- `AppLockScreen` renders **above** the entire app tree at the `App.tsx` level
- Prevents DOM fingerprinting/data leakage when locked
- PIN verified via SHA-256 hash (Web Crypto API)
- Emergency hard-reset available from lock screen (deletes Dexie DB)

### Field Encryption
- Transaction `value` and `description` are AES-encrypted by `transactionService` before writing to IndexedDB
- Decrypt happens on read in `fetchTransactions`

---

## Context Architecture

| Context | What it Manages |
|---------|----------------|
| `SessionContext` | `hasSeenOnboarding`, PIN lock state, session persistence |
| `DataContext` | Shared access to `useFinanceData` hook results |
| `ThemeContext` | Dark/light theme toggle |
| `ToastContext` | Global toast notification queue |

---

## State Management Decision Tree

```
Is data in IndexedDB and needs reactivity?
  → useLiveQuery inside a custom hook in src/hooks/

Is data fetched from Supabase?
  → useQuery/useMutation from @tanstack/react-query

Is it ephemeral UI state (modal open, form step)?
  → useState inside component or hook

Is it global UI state (theme, toast, session)?
  → React Context (src/contexts/)
```

---

## Recurring Transaction Architecture

- `src/services/recurrence.ts` — `rrule`-based date calculation
- `src/services/recurringService.ts` — CRUD for recurring configs
- `src/hooks/useRecurringTransactions.ts` — UI binding
- Two Dexie tables: `recurringConfigs` (config record) + `recurring_transactions` (legacy)

---

## Export Architecture

- `src/services/dataExportService.ts` — orchestrates CSV, PDF, JSON exports
- `src/services/csv.ts` — CSV generation
- PDF via `@react-pdf/renderer` for structured reports
- `html2canvas` + `jspdf` for screenshot-based exports

---

## Desktop Wrapper

App is designed as `max-w-[430px]` mobile shell centered on desktop:
```tsx
<div className="fixed inset-0 ... bg-zinc-950 flex items-center justify-center">
  {/* Ambient background blobs */}
  <div className="w-full max-w-[430px] h-full sm:h-[92vh] sm:max-h-[900px] bg-zinc-900 sm:rounded-[40px] ...">
    {/* App content */}
  </div>
</div>
```
