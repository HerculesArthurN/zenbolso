# 🛡️ Number Safety Quick Reference

## Import
```typescript
import { safeNumber, safeDivide, safePercentage } from '../utils/numberUtils';
```

## Common Patterns

### ✅ Account Balance
```typescript
// Before
const balance = account.balance;

// After
const balance = safeNumber(account.balance, 0);
```

### ✅ Transaction Aggregation
```typescript
// Before
const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

// After
const total = transactions.reduce((sum, t) => sum + safeNumber(t.amount, 0), 0);
```

### ✅ Division (Rates, Averages)
```typescript
// Before
const rate = income / hours; // ❌ Can be Infinity or NaN

// After
const rate = safeDivide(income, hours, 0); // ✅ Always safe
```

### ✅ Percentages
```typescript
// Before
const percent = (value / total) * 100; // ❌ NaN if total is 0

// After
const percent = safePercentage(value, total, 0); // ✅ Returns 0 if total is 0
```

### ✅ Display with formatCurrency
```typescript
// Before
{formatCurrency(data.amount)} // ❌ Can show "NaN"

// After
{formatCurrency(safeNumber(data.amount, 0))} // ✅ Always shows valid currency
```

### ✅ Conditional Styling
```typescript
// Before
className={balance >= 0 ? 'positive' : 'negative'} // ❌ NaN >= 0 is false

// After
className={safeNumber(balance, 0) >= 0 ? 'positive' : 'negative'} // ✅ Safe
```

## API Reference

### `safeNumber(value, fallback = 0)`
Converts any value to a safe number.
- Returns `fallback` if value is null, undefined, NaN, or Infinity
- Safely parses strings
- **Use for:** All numeric data from external sources

### `safeDivide(numerator, denominator, fallback = 0)`
Safe division with zero-protection.
- Returns `fallback` if denominator is 0
- Sanitizes both inputs
- **Use for:** Rates, averages, ratios

### `safePercentage(part, whole, fallback = 0)`
Safe percentage calculation.
- Returns `fallback` if whole is 0
- Automatically multiplies by 100
- **Use for:** Progress bars, completion rates

### `safeSum(values[])`
Safe array summation.
- Returns 0 for empty arrays
- Sanitizes each value
- **Use for:** Total calculations

### `safeAverage(values[], fallback = 0)`
Safe average calculation.
- Returns `fallback` for empty arrays
- Sanitizes each value
- **Use for:** Mean calculations

### `safeClamp(value, min, max)`
Clamps value within range.
- Ensures value is between min and max
- Sanitizes input
- **Use for:** Bounded values (0-100%, etc.)

## 🚨 When to Use

**ALWAYS use when:**
- Reading from database/API
- User input
- Calculations (division, multiplication)
- Displaying currency
- Chart data
- Percentage calculations

**Example - Component Pattern:**
```typescript
export const MyComponent = ({ data }) => {
  // ✅ Sanitize immediately
  const income = safeNumber(data.income, 0);
  const expense = safeNumber(data.expense, 0);
  
  // ✅ Safe calculations
  const net = income - expense;
  const rate = safeDivide(income, expense, 0);
  
  return (
    <div>
      <p>Net: {formatCurrency(net)}</p>
      <p>Rate: {rate.toFixed(2)}</p>
    </div>
  );
};
```

## 🎯 Golden Rule

**"Sanitize First, Format Later"**

Never pass raw data directly to display functions. Always sanitize with `safeNumber()` first.

---

*For full documentation, see: `NaN_ERADICATION_REPORT.md`*
