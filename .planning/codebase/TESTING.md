# TESTING.md — ZenBolso Test Structure & Practices

## Frameworks
| Layer | Tool | Version |
|-------|------|---------|
| Unit Tests | Vitest | ^4.0.17 |
| Component Tests | @testing-library/react | ^16.3.1 |
| DOM Assertions | @testing-library/jest-dom | ^6.9.1 |
| User Interaction | @testing-library/user-event | ^14.6.1 |
| E2E Tests | Playwright | ^1.58.0 |

## Test Configuration

### Vitest (`vite.config.ts`)
```ts
test: {
  globals: true,
  environment: 'jsdom',           // Browser-like DOM
  setupFiles: './src/test/setup.ts',
}
```

### Setup File (`src/test/setup.ts`)
Imports `@testing-library/jest-dom` matchers.

### Playwright (`playwright.config.ts`)
- Requires dev server running (`npm run dev`)
- E2E test files in `e2e/`

## Test File Locations
```
src/
  hooks/__tests__/          # Hook unit tests
  services/__tests__/       # Service unit tests
e2e/                        # Playwright E2E tests
```

## TDD Workflow (Mandatory per GEMINI.md)
1. **Red:** Write failing test first
2. **Green:** Minimum code to pass
3. **Refactor:** Clean up while tests stay green

**Rule:** No feature ships without corresponding unit tests.

## Mocking Patterns

### Dexie (IndexedDB)
```ts
// Mock the entire db module
vi.mock('../../services/db', () => ({
  db: {
    transactions: {
      put: vi.fn(),
      delete: vi.fn(),
      toArray: vi.fn().mockResolvedValue([]),
    },
    delete: vi.fn().mockResolvedValue(undefined),
    open: vi.fn().mockResolvedValue(undefined),
  }
}));
```

### Service Functions
```ts
vi.mock('../../services/transactionService', () => ({
  transactionService: {
    createTransaction: vi.fn().mockResolvedValue({ id: 'test-id', ... }),
  }
}));
```

### Call Order Verification (Critical for Golden Rules)
```ts
// Verify db.delete() happens BEFORE db.open() in reset flow
expect(db.delete.mock.invocationCallOrder[0])
  .toBeLessThan(db.open.mock.invocationCallOrder[0]);
```

## What to Test

### Services (Pure TS — highest priority)
- CRUD operations with mocked Dexie
- Encryption/decryption correctness
- Business calculations (balances, categorization)
- Error handling paths

### Hooks
- State transitions (loading → success → error)
- Optimistic update behavior
- Form validation (Zod schema correct rules)
- Side effect ordering (see db.delete order above)

### Components (Smoke tests)
- Renders without crash
- Key user interactions (button clicks, form submit)
- Error state display

### E2E (Playwright)
- Full user flows (add transaction → see in list)
- Onboarding flow
- App lock / PIN flow

## Test Style
```ts
describe('transactionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('encrypts amount before writing to db', async () => {
    await transactionService.createTransaction({ amount: 100, ... });
    const written = (db.transactions.put as Mock).mock.calls[0][0];
    expect(typeof written.value).toBe('string'); // encrypted, not number
    expect(written.value).not.toBe('100');
  });
});
```

## Running Tests
```bash
# Unit tests (watch mode)
npm run test

# Unit tests (single run)
npx vitest run

# With coverage
npx vitest run --coverage

# E2E (requires npm run dev in separate terminal)
npx playwright test

# E2E with UI
npx playwright test --ui
```

## Known Test Gaps / Tech Debt
- `SettingsPage.tsx` (27KB) is difficult to test as a unit due to monolithic structure
- `services/insights.ts` (8KB) has complex financial logic needing full coverage
- Dexie live queries (`useLiveQuery`) cannot be trivially tested in jsdom — use mock patterns above
