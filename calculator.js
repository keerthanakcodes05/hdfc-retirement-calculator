/**
 * HDFC Mutual Fund – Retirement Planning Calculator
 * Core Financial Calculation Library
 *
 * Formulas follow AMFI/SEBI-aligned industry-standard models.
 * All projections are ILLUSTRATIVE ONLY. Not predictive. Not guaranteed.
 *
 * Disclaimer: This tool has been designed for information purposes only.
 * Actual results may vary depending on various factors involved in capital
 * market. Past performance may or may not be sustained in future and is
 * not a guarantee of any future returns.
 */

// ─── STEP 1: INFLATE ANNUAL EXPENSES ─────────────────────────────────────────
/**
 * Retirement Annual Expense = Current Expense × (1 + InflationRate)^YearsToRetirement
 *
 * @param {number} currentAnnualExpense - Today's annual expense (₹)
 * @param {number} inflationRate        - Annual inflation rate (decimal)
 * @param {number} yearsToRetirement    - Years until retirement
 * @returns {number} Inflated annual expense at retirement
 */
export function inflateExpenses(currentAnnualExpense, inflationRate, yearsToRetirement) {
  if (yearsToRetirement <= 0) return currentAnnualExpense;
  return currentAnnualExpense * Math.pow(1 + inflationRate, yearsToRetirement);
}

// ─── LIFESTYLE EXPENSE BUCKETS ────────────────────────────────────────────────
/**
 * Enhanced: Splits retirement expense into lifestyle buckets with different
 * inflation rates (medical, travel, daily living, dependents).
 * Each bucket compounds at its own inflation rate.
 *
 * @param {object} buckets - { daily, medical, travel, dependents } as fractions summing to 1
 * @param {number} totalCurrentExpense - Total annual expense today
 * @param {object} inflationRates - { daily, medical, travel, dependents } as decimals
 * @param {number} years - Years to retirement
 * @returns {object} Inflated values per bucket + total
 */
export function inflateByBuckets(buckets, totalCurrentExpense, inflationRates, years) {
  const result = {};
  let total = 0;
  Object.keys(buckets).forEach((key) => {
    const base = totalCurrentExpense * buckets[key];
    const inflated = base * Math.pow(1 + inflationRates[key], years);
    result[key] = Math.round(inflated);
    total += inflated;
  });
  result.total = Math.round(total);
  return result;
}

// ─── STEP 2: RETIREMENT CORPUS ───────────────────────────────────────────────
/**
 * Retirement Corpus = AnnualExpense × [(1 − (1 + r)^−t) ÷ r]
 * (Present Value of Annuity formula)
 *
 * @param {number} retirementAnnualExpense - Inflated annual expense at retirement
 * @param {number} postRetirementReturn    - Annual return post-retirement (decimal)
 * @param {number} retirementDuration      - Expected years in retirement
 * @returns {number} Required retirement corpus
 */
export function calculateRetirementCorpus(
  retirementAnnualExpense,
  postRetirementReturn,
  retirementDuration
) {
  const r = postRetirementReturn; // annual rate for annuity
  if (r === 0) return retirementAnnualExpense * retirementDuration;
  const corpus =
    retirementAnnualExpense * ((1 - Math.pow(1 + r, -retirementDuration)) / r);
  return Math.max(0, corpus);
}

// ─── STEP 3: REQUIRED SIP ────────────────────────────────────────────────────
/**
 * Required Monthly SIP to accumulate retirement corpus.
 * SIP FV formula inverted:
 *   r = preRetirementReturn / 12
 *   n = yearsToRetirement * 12
 *   SIP = Corpus × r / [((1 + r)^n − 1) × (1 + r)]
 *
 * @param {number} requiredCorpus     - Total corpus needed at retirement
 * @param {number} preRetirementReturn - Annual pre-retirement return (decimal)
 * @param {number} yearsToRetirement  - Accumulation years
 * @returns {number} Required monthly SIP
 */
export function calculateRequiredSIP(requiredCorpus, preRetirementReturn, yearsToRetirement) {
  const r = preRetirementReturn / 12;
  const n = yearsToRetirement * 12;
  if (r === 0) return requiredCorpus / n;
  const sip = (requiredCorpus * r) / ((Math.pow(1 + r, n) - 1) * (1 + r));
  return Math.max(0, sip);
}

// ─── ENHANCED: STEP-UP SIP ───────────────────────────────────────────────────
/**
 * With annual step-up, users invest less initially (salary grows each year).
 * Calculates initial SIP when stepped up by stepUpRate% each year.
 * Uses iterative year-wise compounding.
 *
 * @param {number} requiredCorpus       - Target corpus
 * @param {number} preRetirementReturn  - Annual return (decimal)
 * @param {number} yearsToRetirement    - Accumulation years
 * @param {number} stepUpRate           - Annual SIP increase rate (decimal, e.g. 0.10)
 * @returns {number} Initial monthly SIP (grows each year)
 */
export function calculateStepUpSIP(
  requiredCorpus,
  preRetirementReturn,
  yearsToRetirement,
  stepUpRate
) {
  // Binary search for initial SIP that achieves the corpus with step-up
  let lo = 100, hi = requiredCorpus / 12;
  for (let iter = 0; iter < 60; iter++) {
    const mid = (lo + hi) / 2;
    const fv = computeStepUpFV(mid, preRetirementReturn, yearsToRetirement, stepUpRate);
    if (fv < requiredCorpus) lo = mid;
    else hi = mid;
  }
  return Math.round((lo + hi) / 2);
}

/**
 * Compute future value of a step-up SIP
 */
export function computeStepUpFV(initialSIP, annualReturn, years, stepUpRate) {
  const monthlyRate = annualReturn / 12;
  let totalFV = 0;
  let currentSIP = initialSIP;
  for (let y = 0; y < years; y++) {
    const monthsRemaining = (years - y) * 12;
    const yearFV =
      monthlyRate === 0
        ? currentSIP * monthsRemaining
        : currentSIP *
          ((Math.pow(1 + monthlyRate, monthsRemaining) - 1) / monthlyRate) *
          (1 + monthlyRate);
    totalFV += yearFV;
    currentSIP *= 1 + stepUpRate;
  }
  return totalFV;
}

// ─── CORPUS DEPLETION ANALYSIS ───────────────────────────────────────────────
/**
 * Given a corpus and withdrawal rate, compute year-by-year balance.
 * Returns when corpus depletes, or "sustainable" if it lasts.
 *
 * @param {number} corpus               - Starting corpus at retirement
 * @param {number} annualWithdrawal     - Annual withdrawal (expense)
 * @param {number} postRetirementReturn - Annual return on corpus (decimal)
 * @param {number} retirementDuration   - Expected years in retirement
 * @param {number} inflationRate        - Annual expense inflation post-retirement
 * @returns {Array<{year,balance,withdrawal,returns}>} Year-by-year data
 */
export function corpusDepletionTimeline(
  corpus,
  annualWithdrawal,
  postRetirementReturn,
  retirementDuration,
  inflationRate = 0
) {
  const data = [];
  let balance = corpus;
  let withdrawal = annualWithdrawal;
  let depletionYear = null;

  for (let y = 1; y <= retirementDuration; y++) {
    const returns = balance * postRetirementReturn;
    balance = balance + returns - withdrawal;
    if (balance <= 0 && depletionYear === null) {
      depletionYear = y;
      data.push({ year: y, balance: 0, withdrawal: Math.round(withdrawal), returns: Math.round(returns) });
      break;
    }
    data.push({
      year: y,
      balance: Math.round(Math.max(0, balance)),
      withdrawal: Math.round(withdrawal),
      returns: Math.round(returns),
    });
    withdrawal *= 1 + inflationRate;
  }
  return { timeline: data, depletionYear, sustainable: depletionYear === null };
}

// ─── ACCUMULATION PHASE TIMELINE ─────────────────────────────────────────────
/**
 * Year-by-year corpus build-up during accumulation (working years)
 * @param {number} monthlySIP
 * @param {number} annualReturn
 * @param {number} years
 * @param {number} stepUpRate - 0 means flat SIP
 * @returns {Array<{year,invested,value,returns}>}
 */
export function accumulationTimeline(monthlySIP, annualReturn, years, stepUpRate = 0) {
  const r = annualReturn / 12;
  const data = [];
  let totalInvested = 0;
  let currentSIP = monthlySIP;
  let runningFV = 0;

  for (let y = 1; y <= years; y++) {
    // Compound previous FV by 12 months
    runningFV = runningFV * Math.pow(1 + r, 12);
    // Add this year's SIP FV (12 months, beginning of period)
    const yearFV =
      r === 0
        ? currentSIP * 12
        : currentSIP * ((Math.pow(1 + r, 12) - 1) / r) * (1 + r);
    runningFV += yearFV;
    totalInvested += currentSIP * 12;
    data.push({
      year: y,
      invested: Math.round(totalInvested),
      value: Math.round(runningFV),
      returns: Math.round(Math.max(0, runningFV - totalInvested)),
      sip: Math.round(currentSIP),
    });
    currentSIP *= 1 + stepUpRate;
  }
  return data;
}

// ─── CORPUS HEALTH SCORE ─────────────────────────────────────────────────────
/**
 * Score 0–100 indicating how well the user's plan covers retirement.
 * Based on: corpus adequacy ratio and sustainability.
 *
 * @param {number} projectedCorpus - What user will accumulate
 * @param {number} requiredCorpus  - What is needed
 * @returns {{ score: number, grade: string, label: string, color: string }}
 */
export function corpusHealthScore(projectedCorpus, requiredCorpus) {
  if (!requiredCorpus || requiredCorpus === 0) return { score: 0, grade: 'N/A', label: 'N/A', color: '#919090' };
  const ratio = projectedCorpus / requiredCorpus;
  const score = Math.min(100, Math.round(ratio * 100));
  let grade, label, color;
  if (score >= 100) { grade = 'A+'; label = 'Excellent — Fully Funded'; color = '#1a7a4a'; }
  else if (score >= 85) { grade = 'A'; label = 'Very Good — Nearly There'; color = '#2d9c5e'; }
  else if (score >= 70) { grade = 'B'; label = 'Good — Minor Gap'; color = '#f59e0b'; }
  else if (score >= 50) { grade = 'C'; label = 'Fair — Needs Attention'; color = '#f97316'; }
  else { grade = 'D'; label = 'Critical — Large Shortfall'; color = '#da3832'; }
  return { score, grade, label, color };
}

// ─── FORMATTING ───────────────────────────────────────────────────────────────
export function formatINR(value, compact = false) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  const abs = Math.abs(value);
  if (compact) {
    if (abs >= 1e7) return `₹${(value / 1e7).toFixed(2)} Cr`;
    if (abs >= 1e5) return `₹${(value / 1e5).toFixed(2)} L`;
    if (abs >= 1e3) return `₹${(value / 1e3).toFixed(1)} K`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(value);
}

// ─── VALIDATION ───────────────────────────────────────────────────────────────
export function validateInputs(inputs) {
  const errors = {};
  const { currentAge, retirementAge, lifeExpectancy, currentExpense,
    inflationRate, preRetirementReturn, postRetirementReturn } = inputs;

  if (!currentAge || currentAge < 18 || currentAge > 70)
    errors.currentAge = 'Current age must be between 18 and 70.';
  if (!retirementAge || retirementAge < 40 || retirementAge > 80)
    errors.retirementAge = 'Retirement age must be between 40 and 80.';
  if (retirementAge <= currentAge)
    errors.retirementAge = 'Retirement age must be greater than current age.';
  if (retirementAge - currentAge < 2)
    errors.retirementAge = 'You need at least 2 years to accumulate a corpus.';
  if (!lifeExpectancy || lifeExpectancy <= retirementAge)
    errors.lifeExpectancy = 'Life expectancy must be greater than retirement age.';
  if (lifeExpectancy > 110)
    errors.lifeExpectancy = 'Please enter a realistic life expectancy (≤ 110).';
  if (!currentExpense || currentExpense <= 0)
    errors.currentExpense = 'Please enter your current annual expenses.';
  if (inflationRate < 0 || inflationRate > 20)
    errors.inflationRate = 'Inflation rate must be between 0% and 20%.';
  if (preRetirementReturn < 1 || preRetirementReturn > 30)
    errors.preRetirementReturn = 'Pre-retirement return must be between 1% and 30%.';
  if (postRetirementReturn < 0 || postRetirementReturn > 20)
    errors.postRetirementReturn = 'Post-retirement return must be between 0% and 20%.';

  return errors;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
export const LIFESTYLE_PROFILES = [
  {
    id: 'modest',
    label: 'Modest',
    icon: '🏡',
    description: 'Simple, frugal retirement',
    expenseMultiplier: 0.7,
    buckets: { daily: 0.65, medical: 0.25, travel: 0.05, dependents: 0.05 },
  },
  {
    id: 'comfortable',
    label: 'Comfortable',
    icon: '🌿',
    description: 'Balanced, comfortable life',
    expenseMultiplier: 1.0,
    buckets: { daily: 0.55, medical: 0.25, travel: 0.12, dependents: 0.08 },
  },
  {
    id: 'lavish',
    label: 'Lavish',
    icon: '✈️',
    description: 'Travel, leisure & luxury',
    expenseMultiplier: 1.5,
    buckets: { daily: 0.40, medical: 0.20, travel: 0.30, dependents: 0.10 },
  },
];

export const DEFAULT_INFLATION_RATES = {
  daily: 0.06,
  medical: 0.10,  // Medical inflation is higher
  travel: 0.07,
  dependents: 0.06,
};
