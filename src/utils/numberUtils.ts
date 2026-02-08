/**
 * Number Safety Utilities
 * 
 * MISSION: Eradicate NaN, Infinity, and undefined from the entire UI.
 * Every numeric value MUST pass through these utilities before rendering.
 */

/**
 * Safely converts any value to a number, defaulting to 0 for invalid inputs.
 * 
 * @param value - Any value that should be a number
 * @param fallback - Optional fallback value (default: 0)
 * @returns A safe number, never NaN or Infinity
 * 
 * @example
 * safeNumber(undefined) // 0
 * safeNumber(null) // 0
 * safeNumber(NaN) // 0
 * safeNumber("123") // 123
 * safeNumber("abc") // 0
 * safeNumber(Infinity) // 0
 * safeNumber(42) // 42
 */
export function safeNumber(value: any, fallback: number = 0): number {
    // Handle null/undefined
    if (value === null || value === undefined) {
        return fallback;
    }

    // Handle already-number types
    if (typeof value === 'number') {
        // Reject NaN and Infinity
        if (!Number.isFinite(value)) {
            return fallback;
        }
        return value;
    }

    // Handle string conversion
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        if (!Number.isFinite(parsed)) {
            return fallback;
        }
        return parsed;
    }

    // Handle boolean (edge case)
    if (typeof value === 'boolean') {
        return value ? 1 : 0;
    }

    // Fallback for any other type
    return fallback;
}

/**
 * Safely performs division, preventing division by zero.
 * 
 * @param numerator - The dividend
 * @param denominator - The divisor
 * @param fallback - Value to return if division is invalid (default: 0)
 * @returns Result of division or fallback
 * 
 * @example
 * safeDivide(10, 2) // 5
 * safeDivide(10, 0) // 0
 * safeDivide(10, null) // 0
 */
export function safeDivide(numerator: any, denominator: any, fallback: number = 0): number {
    const safeNum = safeNumber(numerator, 0);
    const safeDenom = safeNumber(denominator, 0);

    if (safeDenom === 0) {
        return fallback;
    }

    const result = safeNum / safeDenom;
    return Number.isFinite(result) ? result : fallback;
}

/**
 * Safely performs percentage calculation.
 * 
 * @param part - The part value
 * @param whole - The whole value
 * @param fallback - Value to return if calculation is invalid (default: 0)
 * @returns Percentage (0-100) or fallback
 * 
 * @example
 * safePercentage(25, 100) // 25
 * safePercentage(50, 0) // 0
 */
export function safePercentage(part: any, whole: any, fallback: number = 0): number {
    return safeDivide(safeNumber(part, 0) * 100, safeNumber(whole, 0), fallback);
}

/**
 * Safely sums an array of values.
 * 
 * @param values - Array of values to sum
 * @returns Safe sum, never NaN
 * 
 * @example
 * safeSum([1, 2, 3]) // 6
 * safeSum([1, null, 3]) // 4
 * safeSum([]) // 0
 */
export function safeSum(values: any[]): number {
    if (!Array.isArray(values) || values.length === 0) {
        return 0;
    }

    return values.reduce((acc, val) => acc + safeNumber(val, 0), 0);
}

/**
 * Safely calculates the average of an array of values.
 * 
 * @param values - Array of values
 * @param fallback - Value to return if array is empty (default: 0)
 * @returns Average or fallback
 */
export function safeAverage(values: any[], fallback: number = 0): number {
    if (!Array.isArray(values) || values.length === 0) {
        return fallback;
    }

    const sum = safeSum(values);
    return safeDivide(sum, values.length, fallback);
}

/**
 * Ensures a value is within a safe range.
 * 
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function safeClamp(value: any, min: number, max: number): number {
    const safe = safeNumber(value, min);
    return Math.max(min, Math.min(max, safe));
}
