import { NextResponse } from 'next/server';
import {
  inflateExpenses, inflateByBuckets, calculateRetirementCorpus,
  calculateRequiredSIP, calculateStepUpSIP, corpusDepletionTimeline,
  accumulationTimeline, corpusHealthScore, validateInputs,
  LIFESTYLE_PROFILES, DEFAULT_INFLATION_RATES, formatINR,
} from '@/lib/calculator';

/**
 * POST /api/calculate
 * Retirement Planning Calculator API
 *
 * Request body:
 * {
 *   currentAge:           number  (18–70)
 *   retirementAge:        number  (40–80)
 *   lifeExpectancy:       number  (>retirementAge, ≤110)
 *   currentExpense:       number  (annual ₹)
 *   inflationRate:        number  (%, e.g. 6)
 *   preRetirementReturn:  number  (%, e.g. 12)
 *   postRetirementReturn: number  (%, e.g. 7)
 *   lifestyle:            string  ('modest'|'comfortable'|'lavish')
 *   useStepUp:            boolean
 *   stepUpRate:           number  (%, e.g. 10)
 *   medicalInflation:     number  (%, default 10)
 *   travelInflation:      number  (%, default 7)
 *   dailyInflation:       number  (%, default 6)
 *   dependentsInflation:  number  (%, default 6)
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const {
      currentAge, retirementAge, lifeExpectancy, currentExpense,
      inflationRate = 6, preRetirementReturn = 12, postRetirementReturn = 7,
      lifestyle = 'comfortable', useStepUp = false, stepUpRate = 10,
      medicalInflation = 10, travelInflation = 7,
      dailyInflation = 6, dependentsInflation = 6,
    } = body;

    // ── Validate ──────────────────────────────────────────────────────────────
    const errors = validateInputs({
      currentAge, retirementAge, lifeExpectancy, currentExpense,
      inflationRate, preRetirementReturn, postRetirementReturn,
    });
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const yearsToRet = retirementAge - currentAge;
    const retDuration = lifeExpectancy - retirementAge;
    const ir = inflationRate / 100;
    const preR = preRetirementReturn / 100;
    const postR = postRetirementReturn / 100;
    const stepR = stepUpRate / 100;

    // ── Lifestyle profile ────────────────────────────────────────────────────
    const profile = LIFESTYLE_PROFILES.find(p => p.id === lifestyle) || LIFESTYLE_PROFILES[1];
    const adjustedExpense = currentExpense * profile.expenseMultiplier;
    const inflationRates = {
      daily: dailyInflation / 100,
      medical: medicalInflation / 100,
      travel: travelInflation / 100,
      dependents: dependentsInflation / 100,
    };

    // ── STEP 1: Inflate expenses via buckets ─────────────────────────────────
    const bucketResult = inflateByBuckets(profile.buckets, adjustedExpense, inflationRates, yearsToRet);
    const retirementAnnualExpense = bucketResult.total;

    // ── STEP 2: Retirement corpus (PV of annuity) ────────────────────────────
    const requiredCorpus = calculateRetirementCorpus(retirementAnnualExpense, postR, retDuration);

    // ── STEP 3: Required SIP ─────────────────────────────────────────────────
    const flatSIP = calculateRequiredSIP(requiredCorpus, preR, yearsToRet);
    const stepUpSIP = useStepUp ? calculateStepUpSIP(requiredCorpus, preR, yearsToRet, stepR) : null;
    const displaySIP = useStepUp ? stepUpSIP : flatSIP;

    // ── Accumulation timeline ─────────────────────────────────────────────────
    const accTimeline = accumulationTimeline(displaySIP, preR, yearsToRet, useStepUp ? stepR : 0);
    const projectedCorpus = accTimeline[accTimeline.length - 1]?.value || 0;
    const totalInvested = accTimeline[accTimeline.length - 1]?.invested || 0;

    // ── Health score ──────────────────────────────────────────────────────────
    const health = corpusHealthScore(projectedCorpus, requiredCorpus);

    // ── Depletion analysis ────────────────────────────────────────────────────
    const depletion = corpusDepletionTimeline(
      requiredCorpus, retirementAnnualExpense, postR, retDuration, ir * 0.5
    );

    return NextResponse.json({
      success: true,
      data: {
        // Core results
        retirementAnnualExpense: Math.round(retirementAnnualExpense),
        requiredCorpus: Math.round(requiredCorpus),
        flatSIP: Math.round(flatSIP),
        stepUpSIP: stepUpSIP ? Math.round(stepUpSIP) : null,
        displaySIP: Math.round(displaySIP),
        totalInvested: Math.round(totalInvested),
        projectedCorpus: Math.round(projectedCorpus),
        wealthGains: Math.round(Math.max(0, projectedCorpus - totalInvested)),
        // Breakdown
        bucketResult,
        // Timelines
        accTimeline,
        depletion: { ...depletion, timeline: depletion.timeline.slice(0, 50) },
        // Health
        health,
        // Meta
        yearsToRet,
        retDuration,
        shortfall: Math.round(Math.max(0, requiredCorpus - projectedCorpus)),
        surplus: Math.round(Math.max(0, projectedCorpus - requiredCorpus)),
        formulas: {
          step1: 'RetirementExpense = CurrentExpense × (1 + InflationRate)^YearsToRetirement [per bucket]',
          step2: 'RetirementCorpus = AnnualExpense × [(1 − (1 + r)^−t) ÷ r], r=postRetirementReturn, t=retirementDuration',
          step3: 'RequiredSIP = Corpus × r ÷ [((1 + r)^n − 1) × (1 + r)], r=monthlyReturn, n=totalMonths',
        },
        disclaimer: 'This tool has been designed for information purposes only. Actual results may vary depending on various factors involved in capital market. Investor should not consider above as a recommendation for any schemes of HDFC Mutual Fund. Past performance may or may not be sustained in future and is not a guarantee of any future returns.',
      },
    });
  } catch (err) {
    console.error('[API /calculate]', err);
    return NextResponse.json({ success: false, error: 'Internal error. Please try again.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    calculator: 'Retirement Planning Calculator',
    version: '1.0.0',
    sponsor: 'HDFC Mutual Fund',
    hackathon: 'FinCal Innovation Hackathon · IIT-BHU',
    steps: [
      'Step 1: Inflate annual expenses (bucket-wise)',
      'Step 2: Calculate required corpus (PV of annuity)',
      'Step 3: Calculate required monthly SIP',
    ],
  });
}
