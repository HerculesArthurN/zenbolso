# CONCERNS.md — ZenBolso Technical Debt & Known Issues

## 🔴 Critical Concerns

### 1. SettingsPage.tsx Monolith (27KB)
- **File:** `src/pages/SettingsPage.tsx`
- **Problem:** Single file handles 6+ settings tabs with all UI, handlers, and state
- **Impact:** Untestable per tab, high regression risk on any change
- **GEMINI.md Rule Violated:** Max 200 lines per file
- **Fix Pattern (GEMINI.md documented):**
  - Each tab → `components/settings/tabs/XxxTab.tsx` (pure)
  - Shared logic → `hooks/useSettingsData.ts`
  - Parent → shell navigating between tabs only

### 2. TypeScript `any` Usage in Core Services
- **Files:** `src/services/db.ts` (lines 17, 20, 26, 51, 73, 80, 82, 88, 96)
- **Problem:** `Table<any, string>` for `recurring_transactions` and `sync_queue`; type casting with `as any` in `transactionService`
- **Impact:** Loses type safety in critical financial data path
- **Fix:** Define explicit types in `src/types/` for all Dexie tables

### 3. Field Mapping Mismatch in transactionService
- **File:** `src/services/transactionService.ts`
- **Problem:** Internal Dexie schema field names differ from service API types:
  - DB stores: `value`, `category`, `accountId`
  - Service returns: `amount`, `category_id`, `account_id`
- **Impact:** Manual mapping → silent bugs if field names drift; `as any` needed to bridge
- **Fix:** Create a proper `toTransactionRecord()` / `fromTransactionRecord()` mapper

### 4. LandingPage.tsx Size (14KB)
- **File:** `src/pages/LandingPage.tsx`
- **Problem:** Large marketing page mixed with app entry logic
- **Impact:** Bundle size on critical path (though static import is intentional for onboarding)
- **Consideration:** Could lazy-load if `/about` is not the primary entry

---

## 🟡 Medium Concerns

### 5. Legacy Dexie Table: `recurring_transactions`
- **File:** `src/services/db.ts` line 17
- **Problem:** Two tables for recurring data: `recurringConfigs` AND `recurring_transactions`
- **Impact:** Ambiguity about which is canonical; `recurring_transactions` typed as `any`
- **Fix:** Clarify ownership — migrate or consolidate into single `recurringConfigs`

### 6. Hardcoded `user_id: 'local'` Pattern
- **Files:** `db.ts`, `transactionService.ts`, `accountService.ts`
- **Problem:** All local records use `user_id: 'local'` (legacy Supabase artifact)
- **Impact:** Confusion when implementing real sync — field has no local meaning
- **Fix:** Remove `user_id` from local schema or make it optional with undefined default

### 7. Optimistic Updates Not Consistently Applied
- **Problem:** GEMINI.md mandates optimistic updates (snappy UX), but not all mutations implement them
- **Impact:** Some mutations feel slow (wait for Dexie before UI update)
- **Fix:** Audit all hooks with `useTransactionForm` pattern as reference

### 8. Missing Vitest Coverage
- **Files:** Most of `src/services/`, `src/hooks/` lack unit tests
- **Problem:** GEMINI.md mandates TDD but coverage is partial
- **Impact:** Regression risk on every refactor
- **Priority files:** `transactionService.ts`, `accountService.ts`, `insights.ts`, `dashboard.service.ts`

---

## 🟢 Low / Noted Concerns

### 9. Build Log Artifacts in Root
- **Files:** `build.log`, `build_errors.log`, `tsc_errors*.log` (13+ files)
- **Problem:** Generated debug logs committed to repo root
- **Impact:** Clutter; no functional impact
- **Fix:** Add `*.log` pattern to `.gitignore` (already partially there for `npm-debug.log*`)

### 10. Planning Page is a Shell (275B)
- **File:** `src/pages/Planning.tsx`
- **Status:** Essentially empty — waiting for full Goals/Budget implementation
- **Impact:** Route exists but feature incomplete

### 11. framer-motion Bundle Size
- **Library:** `framer-motion` ^12.38.0
- **Impact:** Adds significant bundle weight (~40KB gzip)
- **Note:** Used for animations — acceptable for a PWA, but worth evaluating scope of usage

### 12. Supabase sync_queue Table Unused
- **Table:** `sync_queue` in `db.ts`
- **Problem:** Defined in schema, but no clear service consuming it
- **Impact:** Database overhead + schema complexity
- **Fix:** Either implement queue consumer in sync flow or remove table

---

## Security Considerations

### 13. PIN Not Enforced on Every Navigation
- App Lock via `AppLockScreen` intercepted at root (`App.tsx`)
- **Verify:** Ensure back-button / navigation from OS doesn't bypass lock
- **Status:** Needs E2E test coverage

### 14. Encryption Key Rotation
- `crypto-js` encryption uses a static key per GEMINI.md spec
- **Risk:** If key is compromised, all local encrypted data is exposed
- **Mitigation:** Key is not stored in plaintext per `securityService.ts`
- **Verify:** Current key derivation strategy should be documented

---

## Positive Observations

- ✅ `useLiveQuery` properly used for IndexedDB reactivity (no polling)
- ✅ Zod validation implemented in `useTransactionForm.ts`
- ✅ `date-fns` consistently used (no native Date manipulation found)
- ✅ `rrule` used for recurring date calculation
- ✅ `crypto-js` applied to transaction data before any remote write
- ✅ Lazy loading of heavy pages reduces initial bundle
- ✅ `ErrorBoundary` wraps `AppRoutes` for graceful crashes
- ✅ PWA with service worker — app works offline
- ✅ AppLockScreen intercepts at root level (correct placement)
