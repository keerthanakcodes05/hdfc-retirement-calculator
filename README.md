## 🎥 Project Demo Video

Watch the working demo of the Retirement Planning Calculator here:

https://youtu.be/l7p_8_OQwMg

Team: Corpus Architects - Hackathon Team  
Project: HDFC Retirement Planning Calculator




# 🏦 HDFC Mutual Fund — Retirement Planning Calculator
### FinCal Innovation Hackathon · IIT-BHU · Co-sponsored by HDFC Mutual Fund

---

## 🚀 Quick Start

### Requirements
- **Node.js** 22.11.0  
- **NPM** 10.9.0  
- **Next.js** 15.5.9 (installed via npm)

```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Production
```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
hdfc-retirement/
├── app/
│   ├── layout.jsx                    # Root layout — metadata, skip link, fonts
│   ├── page.jsx                      # Main page (App Router)
│   └── api/calculate/route.js        # POST /api/calculate — Node.js API
├── components/
│   ├── Header.jsx                    # HDFC sticky header
│   ├── Hero.jsx                      # Hero section with feature pills
│   ├── WizardProgress.jsx            # 3-step wizard progress bar
│   ├── RetirementCalculator.jsx      # Main orchestrator (state manager)
│   ├── Step1Personal.jsx             # Age inputs + live timeline preview
│   ├── Step2Expenses.jsx             # Lifestyle picker, expenses, buckets, step-up
│   ├── ResultsPanel.jsx              # Full results view
│   ├── CorpusGauge.jsx               # ★ Animated SVG health gauge
│   ├── ProjectionChart.jsx           # Chart.js accumulation + depletion charts
│   └── Footer.jsx
├── lib/
│   └── calculator.js                 # ★ Core financial library (all 3 steps)
├── styles/globals.css                # Full HDFC design system
├── next.config.mjs
├── jsconfig.json
└── package.json
```

---

## 📐 Formula Reference (Mandatory 3-Step Framework)

### Step 1 — Inflate Annual Expenses (by bucket)
```
Retirement Expense = Current Expense × (1 + Inflation Rate)^Years to Retirement
```
Enhanced: Each expense bucket (Daily, Medical, Travel, Dependents) uses its own inflation rate:
- Daily Living: configurable (default 6%)
- Medical / Healthcare: configurable (default 10% — higher, as per spec)
- Travel & Leisure: configurable (default 7%)
- Dependents / Family: configurable (default 6%)

### Step 2 — Retirement Corpus (PV of Annuity)
```
Corpus = Annual Expense × [(1 − (1 + r)^−t) ÷ r]
where r = post-retirement annual return, t = years of retirement
```

### Step 3 — Required Monthly SIP
```
r = preRetirementReturn / 12
n = yearsToRetirement × 12
SIP = Corpus × r ÷ [((1 + r)^n − 1) × (1 + r)]
```

---

## ⭐ Unique / Hackathon-Winning Features

| Feature | Description |
|---|---|
| **Corpus Health Gauge** | Animated SVG semicircle gauge (0–100 score) with grade A+/A/B/C/D |
| **3-Step Wizard UI** | Personal → Expenses → Results — guided flow |
| **Life Timeline Preview** | Instant visual bar in Step 1 showing accumulation vs retirement phases |
| **Lifestyle Expense Buckets** | Medical/Travel/Daily/Dependents each inflate at different rates |
| **Step-Up SIP** | Calculates lower initial SIP when income grows annually |
| **Corpus Depletion Chart** | Shows exactly when corpus depletes if underfunded |
| **Corpus Health Score** | A+/A/B/C/D grade with shortfall/surplus in ₹ |
| **Print Plan** | Results are print-ready via CSS @print |
| **Dual Chart View** | Accumulation phase + Retirement withdrawal phase |
| **Year-wise Table** | Full data table with SIP, invested, returns, corpus per year |

---

## ✅ Full Compliance Checklist

### Calculator Requirements
- [x] Retirement Planning Calculator only (correct category)
- [x] 3-step AMFI/SEBI formula implemented correctly
- [x] All assumptions clearly disclosed in UI
- [x] All assumptions are user-editable (sliders + number inputs)
- [x] Inflation and return assumptions clearly distinguished (Step 2)
- [x] Mandatory HDFC disclaimer included verbatim
- [x] No guarantee/prediction language used anywhere
- [x] Illustrative framing throughout

### Technology Stack
- [x] **Next.js 15.5.9** (frontend)
- [x] **Node.js 22.11.0** (backend runtime)
- [x] **NPM 10.9.0** (package manager)
- [x] API route: `POST /api/calculate` (Node-compatible)

### Brand Guidelines
- [x] Blue `#224c87` — headers, sliders, primary buttons, badges
- [x] Red `#da3832` — step labels, disclaimer border, error states
- [x] Grey `#919090` — muted text, borders, dividers
- [x] Fonts: Montserrat (primary), Arial, Verdana (CSS fallbacks)
- [x] No growth arrows or currency imagery
- [x] No exaggerated visual metaphors

### WCAG 2.1 AA Accessibility
- [x] `<header role="banner">`, `<main>`, `<footer role="contentinfo">`, `<nav>`, `<section aria-label>`
- [x] All `<input>` and `<button>` have associated `<label>` or `aria-label`
- [x] `<fieldset>` + `<legend>` for all form groups
- [x] `role="tablist"` / `role="tab"` / `role="tabpanel"` on chart switcher
- [x] `role="radiogroup"` / `role="radio"` / `aria-checked` on lifestyle picker
- [x] `role="listitem"` / `role="list"` on expense buckets & hero pills
- [x] `aria-live="polite"` on all dynamic result regions
- [x] `aria-expanded` + `aria-controls` on all accordions
- [x] `aria-valuemin/max/now/text` on all range sliders
- [x] `aria-current="step"` on active wizard step
- [x] `aria-busy` on calculate button while computing
- [x] `aria-invalid` + `aria-describedby` on all error states
- [x] `role="progressbar"` + `aria-valuenow` on corpus coverage bar
- [x] Skip-to-main-content link for keyboard users
- [x] `:focus-visible` ring on all interactive elements
- [x] Colour contrast — all text meets 4.5:1 minimum (WCAG AA)
  - Primary text on white: 14.7:1 ✓
  - Blue text (#224c87) on white: 7.4:1 ✓  
  - White on HDFC blue: 8.5:1 ✓
  - Muted text (#5a6880) on white: 5.1:1 ✓
- [x] Chart canvas has `role="img"` + `aria-label` + `<p class="sr-only">` fallback description
- [x] Table has `<caption>` + `scope` on all `<th>`
- [x] Keyboard navigation: all buttons and inputs reachable by Tab
- [x] Logical tab order throughout wizard

### Responsiveness
- [x] Desktop (1200px+) — 2-col layout
- [x] Tablet (768–1024px) — 1-col layout
- [x] Mobile (≤480px) — stacked, touch-friendly
- [x] Range slider thumb: 22×22px touch target
- [x] No horizontal overflow at any breakpoint

---

## 🏆 Judging Criteria Mapping

| Criterion | Weight | What We Built |
|---|---|---|
| Financial Logic | 25% | Exact 3-step spec formula, bucket inflation, step-up SIP, depletion analysis |
| Compliance | 20% | Verbatim disclaimer, illustrative language, no guarantees, HDFC brand |
| Accessibility | 15% | Full WCAG 2.1 AA — ARIA, contrast, keyboard, screen reader |
| UX Clarity | 15% | 3-step wizard, lifestyle presets, health gauge, insights |
| Technical Quality | 15% | Next.js 15.5 App Router, clean lib separation, full API |
| Responsiveness | 10% | Mobile-first CSS Grid, tested breakpoints |

---

## 🔌 API Usage

```bash
# Health check
curl http://localhost:3000/api/calculate

# Calculate
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "currentAge": 30,
    "retirementAge": 60,
    "lifeExpectancy": 85,
    "currentExpense": 600000,
    "inflationRate": 6,
    "preRetirementReturn": 12,
    "postRetirementReturn": 7,
    "lifestyle": "comfortable",
    "useStepUp": false,
    "medicalInflation": 10,
    "travelInflation": 7,
    "dailyInflation": 6,
    "dependentsInflation": 6
  }'
```

---

> **Disclaimer:** This tool has been designed for information purposes only. Actual results may vary depending on various factors involved in capital market. Investor should not consider above as a recommendation for any schemes of HDFC Mutual Fund. Past performance may or may not be sustained in future and is not a guarantee of any future returns.
