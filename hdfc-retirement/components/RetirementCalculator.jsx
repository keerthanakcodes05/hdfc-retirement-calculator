'use client';

import { useState, useCallback } from 'react';
import {
  inflateExpenses, inflateByBuckets, calculateRetirementCorpus,
  calculateRequiredSIP, calculateStepUpSIP, corpusDepletionTimeline,
  accumulationTimeline, corpusHealthScore,
  validateInputs, LIFESTYLE_PROFILES, DEFAULT_INFLATION_RATES, formatINR,
} from '@/lib/calculator';

import WizardProgress from './WizardProgress';
import Step1Personal from './Step1Personal';
import Step2Expenses from './Step2Expenses';
import ResultsPanel from './ResultsPanel';

const DEFAULT = {
  // Personal
  currentAge: 30,
  retirementAge: 60,
  lifeExpectancy: 85,
  // Expenses
  currentExpense: 600000,
  inflationRate: 6,
  preRetirementReturn: 12,
  postRetirementReturn: 7,
  // Enhanced
  lifestyle: 'comfortable',
  stepUpRate: 10,
  useStepUp: false,
  // Inflation buckets (user-editable)
  medicalInflation: 10,
  travelInflation: 7,
  dailyInflation: 6,
  dependentsInflation: 6,
};

export default function RetirementCalculator() {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState(DEFAULT);
  const [errors, setErrors] = useState({});
  const [results, setResults] = useState(null);
  const [isCalc, setIsCalc] = useState(false);

  const update = useCallback((field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  }, []);

  const goToStep2 = useCallback(() => {
    const errs = {};
    const { currentAge, retirementAge, lifeExpectancy } = inputs;
    if (!currentAge || currentAge < 18 || currentAge > 70) errs.currentAge = 'Age must be between 18 and 70.';
    if (!retirementAge || retirementAge <= currentAge) errs.retirementAge = 'Retirement age must be greater than current age.';
    if (retirementAge > 80) errs.retirementAge = 'Retirement age must be 80 or below.';
    if (retirementAge - currentAge < 2) errs.retirementAge = 'Need at least 2 years to build corpus.';
    if (!lifeExpectancy || lifeExpectancy <= retirementAge) errs.lifeExpectancy = 'Life expectancy must exceed retirement age.';
    if (lifeExpectancy > 110) errs.lifeExpectancy = 'Please enter a realistic life expectancy.';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [inputs]);

  const calculate = useCallback(() => {
    const { currentAge, retirementAge, lifeExpectancy, currentExpense,
      inflationRate, preRetirementReturn, postRetirementReturn,
      lifestyle, stepUpRate, useStepUp,
      medicalInflation, travelInflation, dailyInflation, dependentsInflation } = inputs;

    const errs = {};
    if (!currentExpense || currentExpense <= 0) errs.currentExpense = 'Please enter valid annual expenses.';
    if (inflationRate < 0 || inflationRate > 20) errs.inflationRate = 'Inflation must be 0–20%.';
    if (preRetirementReturn < 1 || preRetirementReturn > 30) errs.preRetirementReturn = 'Return must be 1–30%.';
    if (postRetirementReturn < 0 || postRetirementReturn > 20) errs.postRetirementReturn = 'Return must be 0–20%.';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setIsCalc(true);

    setTimeout(() => {
      const yearsToRet = retirementAge - currentAge;
      const retDuration = lifeExpectancy - retirementAge;

      const ir = inflationRate / 100;
      const preR = preRetirementReturn / 100;
      const postR = postRetirementReturn / 100;
      const stepR = stepUpRate / 100;

      // Get lifestyle profile
      const profile = LIFESTYLE_PROFILES.find(p => p.id === lifestyle);
      const expenseMultiplier = profile ? profile.expenseMultiplier : 1;
      const adjustedExpense = currentExpense * expenseMultiplier;
      const buckets = profile ? profile.buckets : { daily: 0.55, medical: 0.25, travel: 0.12, dependents: 0.08 };

      const inflationRates = {
        daily: dailyInflation / 100,
        medical: medicalInflation / 100,
        travel: travelInflation / 100,
        dependents: dependentsInflation / 100,
      };

      // STEP 1: Inflate expenses via buckets
      const bucketResult = inflateByBuckets(buckets, adjustedExpense, inflationRates, yearsToRet);
      const retirementAnnualExpense = bucketResult.total;

      // STEP 2: Calculate corpus
      const requiredCorpus = calculateRetirementCorpus(retirementAnnualExpense, postR, retDuration);

      // STEP 3: Required SIP
      const flatSIP = calculateRequiredSIP(requiredCorpus, preR, yearsToRet);
      const stepUpSIP = useStepUp ? calculateStepUpSIP(requiredCorpus, preR, yearsToRet, stepR) : null;
      const displaySIP = useStepUp ? stepUpSIP : flatSIP;

      // Accumulation timeline
      const accTimeline = accumulationTimeline(
        displaySIP, preR, yearsToRet, useStepUp ? stepR : 0
      );
      const projectedCorpus = accTimeline[accTimeline.length - 1]?.value || 0;
      const totalInvested = accTimeline[accTimeline.length - 1]?.invested || 0;

      // Corpus health
      const health = corpusHealthScore(projectedCorpus, requiredCorpus);

      // Depletion analysis
      const depletion = corpusDepletionTimeline(
        requiredCorpus, retirementAnnualExpense, postR, retDuration, ir * 0.5
      );

      setResults({
        // Core
        retirementAnnualExpense,
        requiredCorpus,
        flatSIP,
        stepUpSIP,
        displaySIP,
        totalInvested,
        projectedCorpus,
        // Breakdown
        bucketResult,
        buckets,
        // Timeline
        accTimeline,
        depletion,
        // Health
        health,
        // Meta
        yearsToRet,
        retDuration,
        inputs: { ...inputs },
        adjustedExpense,
        expenseMultiplier,
        profile,
      });

      setIsCalc(false);
      setStep(3);
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
    }, 500);
  }, [inputs]);

  const reset = useCallback(() => {
    setStep(1); setResults(null); setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      <WizardProgress currentStep={step} />
      <section className="calc-section" aria-label="Retirement Planning Calculator">
        <div className="container">
          {step === 1 && (
            <Step1Personal
              inputs={inputs}
              errors={errors}
              onChange={update}
              onNext={goToStep2}
            />
          )}
          {step === 2 && (
            <Step2Expenses
              inputs={inputs}
              errors={errors}
              onChange={update}
              onBack={() => setStep(1)}
              onCalculate={calculate}
              isCalc={isCalc}
            />
          )}
          {step === 3 && results && (
            <ResultsPanel
              results={results}
              onReset={reset}
            />
          )}
        </div>
      </section>
    </>
  );
}
