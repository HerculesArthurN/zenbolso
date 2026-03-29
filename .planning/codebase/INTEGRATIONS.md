# INTEGRATIONS.md — ZenBolso External Services & APIs

## Primary Data Layer: IndexedDB (Dexie) — LOCAL ONLY
Not a remote integration. All primary data lives in the browser's IndexedDB.
- **No network required** for core functionality
- Survives offline, airplane mode, service outages
- Source of truth: `src/services/db.ts` (`PocketManagerDB`)

---

## Optional Remote Sync: Supabase

### Purpose
Optional encrypted cloud backup/sync. NOT the primary data source.

### Client
- **File:** `src/lib/supabase.ts`
- **SDK:** `@supabase/supabase-js` v2
- **Instance:** Singleton `supabase` exported from that file

### Configuration
```ts
// src/lib/supabase.ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
```

### Security Contract
- **ALL data is encrypted with `crypto-js` before upload**
- Raw plaintext never leaves the device
- Supabase only stores ciphertext

### Usage Pattern
```ts
// Services layer encrypts → uploads to Supabase
// Never direct component → Supabase calls
```

### Graceful Degradation
- If `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` are empty, `console.warn` fires
- App continues to function 100% locally

---

## Google Drive Sync

### Purpose
Alternative cloud backup via Google Drive (user's own storage).

### File
- `src/services/googleDrive.ts`
- Hook: `src/hooks/useGoogleDrive.ts`

### Security Contract
- Same as Supabase: data is encrypted with `crypto-js` before upload
- Uploads to user's personal Drive account — no shared server

### Authentication
- Uses Google OAuth / Drive API
- Credentials managed via browser OAuth flow

---

## PWA / Service Worker

### Plugin
`vite-plugin-pwa` v1.2.0

### Caching Strategy
- `CacheFirst` for static assets (JS, CSS, images)
- Prevents app shell loss on network failure

### Update Behavior
- `registerType: 'prompt'` — Shows `ReloadPrompt` component to user before activating new SW
- Component: `src/components/pwa/ReloadPrompt.tsx`
- Install prompt: `src/components/pwa/InstallPrompt.tsx`

---

## Field-Level Encryption (Internal, Not External)

### Library
`crypto-js` ^4.2.0

### Where
- `src/utils/crypto.ts` — `encrypt()` / `decrypt()` utilities
- Applied in `src/services/transactionService.ts` before writing to Dexie
- `value` (amount) and `description` fields are encrypted at rest in IndexedDB

### Key
Derived from user configuration (not hardcoded).

---

## Security / App Lock

### Web Crypto API (native browser)
- Used in `src/services/securityService.ts`
- SHA-256 hashing of user PIN
- Never stores PIN in plaintext

### Component
- `src/components/security/AppLockScreen.tsx` — Intercepts entire React tree in `App.tsx`

---

## Recurring Transactions

### Library
`rrule` ^2.8.1

### Where
- `src/services/recurrence.ts`
- `src/services/recurringService.ts`
- `src/hooks/useRecurringTransactions.ts`

---

## PDF / Export

| Integration | Purpose |
|------------|---------|
| `@react-pdf/renderer` v4 | React-based PDF rendering |
| `jspdf` v4 | Programmatic PDF |
| `html2canvas` v1 | Capture UI to image |
| `file-saver` v2 | Trigger file download |

Service: `src/services/dataExportService.ts`

---

## Charting

`recharts` v2 — Used in Dashboard and ReportsPage
- Components live in `src/components/charts`

---

## Summary: External Boundary Map

| Service | Required | Data Leaves Device? | Encrypted? |
|---------|----------|-------------------|------------|
| IndexedDB (Dexie) | Yes (primary) | No | At-rest only |
| Supabase | No (optional sync) | Yes (ciphertext only) | Yes |
| Google Drive | No (optional backup) | Yes (ciphertext only) | Yes |
| PWA/SW | Implicit | No | N/A |
| Web Crypto (PIN) | Yes (app lock) | No | Hash only |
