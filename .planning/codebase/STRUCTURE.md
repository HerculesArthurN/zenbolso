# STRUCTURE.md — ZenBolso Directory Layout

## Root Directory
```
zenbolso/
├── src/                    # Application source
├── public/                 # Static assets (icons, favicon)
├── e2e/                    # Playwright E2E tests
├── dist/                   # Production build (gitignored)
├── .agent/                 # GSD AI workflow skills
├── .planning/              # GSD planning state
├── GEMINI.md               # Living spec & AI memory (critical)
├── NUMBER_SAFETY_GUIDE.md  # NaN safety reference
├── vite.config.ts          # Vite + Vitest config
├── tailwind.config.js      # Tailwind + custom tokens
├── tsconfig.json           # TypeScript strict config
├── playwright.config.ts    # E2E test config
└── package.json            # Dependencies v1.3.0
```

## Source Tree (`src/`)
```
src/
├── App.tsx                 # Root: provider tree + routing (lazy loading)
├── vite-env.d.ts           # Vite env type shims
│
├── pages/                  # Smart components — compose hooks + UI
│   ├── Dashboard.tsx       # Main financial overview
│   ├── LandingPage.tsx     # Onboarding / marketing page (14KB)
│   ├── TransactionsPage.tsx # Transaction list (thin shell, 283B)
│   ├── ReportsPage.tsx     # Charts & financial reports (12KB)
│   ├── SettingsPage.tsx    # Settings hub (27KB — candidate for decomp)
│   ├── RecurringPage.tsx   # Recurring transactions management
│   ├── Planning.tsx        # Goals/budget planning (275B shell)
│   ├── LoginPage.tsx       # Auth UI (9KB)
│   ├── AdminPage.tsx       # Admin utilities
│   └── NotFoundPage.tsx    # 404 page
│
├── components/             # Pure UI components (dumb, no DB access)
│   ├── admin/              # Admin-only components
│   ├── auth/               # Auth form components
│   ├── charts/             # Recharts wrappers (5KB)
│   ├── common/             # Shared primitives
│   ├── dashboard/          # Dashboard-specific UI
│   ├── filters/            # Transaction filter UI
│   ├── layout/             # AppLayout, navigation shell
│   ├── onboarding/         # OnboardingWizard
│   ├── pwa/                # ReloadPrompt, InstallPrompt
│   ├── recurring/          # Recurring transaction UI
│   ├── reports/            # Report/export UI
│   ├── security/           # AppLockScreen component
│   ├── settings/           # Settings UI (multi-tab)
│   ├── transactions/       # Transaction list + modals
│   ├── ui/                 # Base UI kit (Button, Modal, etc.)
│   ├── tools.tsx           # Developer tools component (5.9KB)
│   └── tools/              # (in tools.tsx)
│
├── hooks/                  # Custom React hooks
│   ├── __tests__/          # Hook unit tests
│   ├── queries/            # React Query hooks for Supabase
│   ├── useFinanceData.ts   # Core data aggregation hook
│   ├── useTransactionForm.ts # Form state + Zod validation
│   ├── useDashboardData.ts # Dashboard-specific aggregations
│   ├── useCategories.ts    # Category list
│   ├── useRecurringTransactions.ts
│   ├── useAppLock.ts       # PIN lock state
│   ├── useGhostProtocol.ts # Emergency data wipe
│   ├── useGoogleDrive.ts   # Drive sync integration
│   ├── useLocaleFormat.ts  # Currency/date formatting
│   ├── useOnboarding.ts    # Onboarding flow
│   ├── usePinSetup.ts      # PIN configuration
│   ├── useProfileSettings.ts
│   ├── useSettingsData.ts  # Settings page state
│   ├── useSqlRunner.ts     # Raw SQL debug tool
│   ├── useSyncStatus.ts    # Sync state
│   └── useTransactionFilters.ts
│
├── services/               # Business logic + DB access (no React)
│   ├── __tests__/          # Service unit tests
│   ├── domain/             # Pure domain logic (no side effects)
│   ├── repositories/       # Data access patterns
│   ├── db.ts               # ⭐ Dexie schema (single source of truth)
│   ├── transactionService.ts
│   ├── accountService.ts
│   ├── categoryService.ts
│   ├── recurringService.ts
│   ├── recurrence.ts       # rrule calculations
│   ├── dashboard.service.ts
│   ├── dataExportService.ts
│   ├── csv.ts
│   ├── googleDrive.ts
│   ├── insights.ts         # Financial insights engine (8KB)
│   ├── gamification.ts     # Achievement system (5KB)
│   ├── securityService.ts  # PIN hash (Web Crypto API)
│   ├── seedService.ts      # Demo data seeding
│   ├── settingsService.ts
│   ├── api.ts              # clearAllData() + helpers
│   ├── categorizer.ts      # Auto-categorization
│   ├── forecast.ts         # Financial forecasting
│   ├── errors.ts           # Service error types
│   ├── persistence.ts      # Storage helpers
│   └── repositoryUtils.ts
│
├── contexts/               # React Context providers
│   ├── DataContext.tsx
│   ├── SessionContext.tsx
│   ├── ThemeContext.tsx
│   └── ToastContext.tsx
│
├── lib/
│   └── supabase.ts         # Supabase singleton client
│
├── types/                  # Global TypeScript types
├── utils/                  # Pure utility functions (no React)
├── constants/              # App-wide constants
├── routes/                 # Route definitions
└── test/
    └── setup.ts            # Vitest setup file
```

## Key File Sizes / Complexity
| File | Size | Note |
|------|------|------|
| `pages/SettingsPage.tsx` | 27KB | ⚠️ Monolith — needs decomposition |
| `pages/LandingPage.tsx` | 14KB | Marketing page |
| `services/insights.ts` | 8KB | Complex financial analysis |
| `services/db.ts` | 6.4KB | Schema + migration |
| `services/dataExportService.ts` | 6.4KB | Multi-format export |

## Naming Conventions
- Pages: `PascalCase` + `Page` suffix (e.g., `SettingsPage.tsx`)
- Components: `PascalCase` (e.g., `AppLockScreen.tsx`)
- Hooks: `camelCase` + `use` prefix (e.g., `useFinanceData.ts`)
- Services: `camelCase` + `Service` suffix (e.g., `transactionService.ts`)
- DB: `db.ts` — always referenced as `import { db } from './db'`
