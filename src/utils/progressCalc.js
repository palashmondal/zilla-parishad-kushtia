/**
 * progressCalc.js
 * Auto-calculates project progress_percentage from current_status,
 * implementation_method, fund release ratio, is_completed, and is_delayed.
 *
 * Formula:
 *   1. Look up base % from status → method map
 *   2. Blend: 75% status weight + 25% fund-release weight
 *      (fund weight only applied when allocation > 0 and released > 0)
 *   3. Override: is_completed → 100%, is_delayed caps at status base %
 */

// Status → progress % maps per implementation method
const STATUS_PROGRESS = {
    'টেন্ডার': {
        'টেন্ডার ফ্লোটিং':       5,
        'টেন্ডার মূল্যায়ন':      15,
        'কার্যাদেশ প্রদান':       25,
        'কাজ শুরু হয়নি':          30,
        'কাজ চলমান':              55,
        'আংশিক সম্পন্ন':          75,
        'চূড়ান্ত বিল প্রক্রিয়া': 90,
        'কাজ সম্পন্ন':            100,
    },
    'সিপিপিসি': {
        'সিপিপিসি অনুমোদন প্রক্রিয়া': 10,
        'কাজ শুরু হয়নি':               25,
        'কাজ চলমান':                    55,
        'আংশিক সম্পন্ন':               75,
        'চূড়ান্ত বিল প্রক্রিয়া':      90,
        'কাজ সম্পন্ন':                  100,
    },
    'আরএফকিউ': {
        'আরএফকিউ প্রক্রিয়া':     10,
        'কাজ শুরু হয়নি':          25,
        'কাজ চলমান':              55,
        'আংশিক সম্পন্ন':          75,
        'চূড়ান্ত বিল প্রক্রিয়া': 90,
        'কাজ সম্পন্ন':            100,
    }
};

// Fallback map for unknown / missing method — keyed only on generic statuses
const STATUS_PROGRESS_FALLBACK = {
    'কাজ শুরু হয়নি':          25,
    'কাজ চলমান':              55,
    'আংশিক সম্পন্ন':          75,
    'চূড়ান্ত বিল প্রক্রিয়া': 90,
    'কাজ সম্পন্ন':            100,
};

/**
 * @param {object} params
 * @param {string} params.current_status       - The new status string (Bengali)
 * @param {string} params.implementation_method - 'টেন্ডার' | 'সিপিপিসি' | 'আরএফকিউ'
 * @param {number} params.allocation_amount    - Total sanctioned amount
 * @param {number} params.released_amount      - Cumulative released amount (after this entry)
 * @param {boolean|number} params.is_completed
 * @param {boolean|number} params.is_delayed
 * @returns {number} Calculated progress percentage (0–100, integer)
 */
function calcProgress({ current_status, implementation_method, allocation_amount, released_amount, is_completed, is_delayed }) {
    // Hard override: completed = 100%
    if (is_completed) return 100;

    const methodMap = STATUS_PROGRESS[implementation_method] || STATUS_PROGRESS_FALLBACK;
    const statusPct  = methodMap[current_status] ?? STATUS_PROGRESS_FALLBACK[current_status] ?? 0;

    // Fund-release ratio (clamped 0–1)
    const alloc    = parseFloat(allocation_amount) || 0;
    const released = parseFloat(released_amount)   || 0;
    const fundRatio = (alloc > 0 && released > 0) ? Math.min(released / alloc, 1) : null;

    let blended;
    if (fundRatio !== null) {
        // 75% status weight + 25% fund weight
        blended = Math.round(statusPct * 0.75 + fundRatio * 100 * 0.25);
    } else {
        blended = statusPct;
    }

    // Delayed: cap at statusPct — no upward fund boost while delayed
    if (is_delayed) {
        blended = Math.min(blended, statusPct);
    }

    return Math.min(100, Math.max(0, blended));
}

module.exports = { calcProgress };
