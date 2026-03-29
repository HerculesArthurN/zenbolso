# CONVENTIONS.md — ZenBolso Code Conventions

## TypeScript Rules
- **Strict mode enforced:** `tsconfig.json` has `"strict": true`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
- **Forbidden:** `any` (explicit), `as unknown` casts
- **Required:** Explicit return types on all service functions
- **Preferred over `any`:** Zod schema validation + type inference

## Architecture Rules (The Golden Rules)

### Layer Boundaries — NEVER CROSS
```
Component → Hooks → Services → db
    ↑ UI only  ↑ State bridge  ↑ DB + logic
```
- **Components:** Pure UI — zero DB access, zero business logic
- **Hooks:** Bridge between DB reactivity and component state
- **Services:** All Dexie calls + business logic — NO React imports

### DB Access Pattern
```ts
// ✅ CORRECT — service in services/
export const transactionService = {
  async createTransaction(data: TransactionInput): Promise<Transaction> {
    await db.transactions.put(payload);
    return result;
  }
};

// ❌ WRONG — DB in component
const addTx = async () => {
  await db.transactions.put(data); // NEVER
};
```

### Reactive DB Pattern
```ts
// ✅ CORRECT — useLiveQuery in hook
export function useFinanceData() {
  const transactions = useLiveQuery(() => db.transactions.toArray());
  return { transactions };
}

// Component just consumes
const { transactions } = useFinanceData();
```

## Form Validation Pattern

All forms validated with Zod before service calls:
```ts
// ✅ CORRECT
const schema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1),
});

const result = schema.safeParse(formData);
if (!result.success) {
  setErrors(result.error.flatten());
  return;
}
await transactionService.createTransaction(result.data);
```

## Number Safety Rule
```ts
// ✅ Always sanitize DB values
const amount = Number(rawValue) || 0;

// ❌ NEVER use raw DB values in arithmetic
const total = tx.value + otherTx.value; // Could be NaN!
```
See `NUMBER_SAFETY_GUIDE.md` for full reference.

## Date Handling
```ts
// ✅ Always use date-fns
import { format, startOfMonth, endOfMonth } from 'date-fns';
const start = startOfMonth(new Date());

// ❌ NEVER reinvent date logic
const month = date.getMonth() + 1; // fragile custom logic
```

## File Size Limit
- **Maximum 200 lines per file**
- Extract to hooks or modules when exceeded
- Each hook/component has single responsibility

## Component Patterns

### Page Component (Smart)
```tsx
// pages/SomePage.tsx — orchestrates hooks, renders pure components
const SomePage: React.FC = () => {
  const { transactions, isLoading } = useFinanceData();
  return <SomeList transactions={transactions} />;
};
```

### UI Component (Dumb)
```tsx
// components/SomeList.tsx — pure UI, data via props only
interface Props {
  transactions: Transaction[];
}
const SomeList: React.FC<Props> = ({ transactions }) => { ... };
```

## Naming
| What | Pattern | Example |
|------|---------|---------|
| Pages | `PascalCase + Page` | `SettingsPage.tsx` |
| Components | `PascalCase` | `AppLockScreen.tsx` |
| Hooks | `use + PascalCase` | `useTransactionForm.ts` |
| Services | `camelCase + Service/service` | `transactionService.ts` |
| Utils | `camelCase` | `crypto.ts`, `formatters.ts` |
| Types | `PascalCase` | `Transaction`, `Account`, `Category` |

## Encryption Convention
```ts
// ALL remote writes go through encrypt/decrypt
import { encrypt, decrypt } from '../utils/crypto';

// Before Dexie write (if syncing remotely):
value: encrypt(transaction.amount)

// After Dexie read:
amount: Number(decrypt(tx.value)) || 0
```

## Error Handling
- Service errors typed in `src/services/errors.ts`
- All `try/catch` in services — never swallow silently
- UI errors surfaced via `ToastContext` (never raw `alert()`)
- Migration errors: `console.error()` with context (non-fatal)

## Recurring Transactions
```ts
// ✅ Always use rrule
import { RRule } from 'rrule';
const rule = new RRule({ freq: RRule.MONTHLY, ... });
const dates = rule.between(start, end);

// ❌ NEVER manual recurrence logic
const nextDate = new Date(date.getFullYear(), date.getMonth() + 1, date.getDate());
```

## Optimistic Updates
All mutations should update local state immediately:
```ts
// In hook:
setTransactions(prev => [...prev, optimisticItem]);  // immediate
await transactionService.createTransaction(data);    // async persist
```

## CSS / Styling
- **Tailwind CSS v3 only** — no inline styles, no CSS modules
- **`cn()` utility** for conditional classes:
  ```ts
  import { cn } from '../utils/cn'; // uses clsx + tailwind-merge
  ```
- **Mobile-first:** Start with base styles, add `sm:` / `md:` breakpoints
- **Touch targets:** Minimum `min-h-[44px] min-w-[44px]` on interactive elements
- **Dark mode:** Design defaults to dark (`bg-zinc-900`, `text-zinc-100`)
