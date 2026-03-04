'use client';

import { useEffect, useRef, useState } from 'react';
import { formatINR } from '@/lib/calculator';

export default function CorpusGauge({ health, projectedCorpus, requiredCorpus, shortfall, surplus }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // SVG semicircle gauge
  // Radius = 54, center = (70, 70), sweep = 180deg (top semicircle)
  const R = 54;
  const CX = 70;
  const CY = 70;
  const circumference = Math.PI * R; // half circle = πr
  const score = Math.min(100, Math.max(0, health.score));
  const offset = animated ? circumference * (1 - score / 100) : circumference;

  // Arc path: start at left (180deg), end at right (0deg)
  const startX = CX - R;
  const startY = CY;
  const endX = CX + R;
  const endY = CY;

  return (
    <div
      className="health-meter-card"
      role="region"
      aria-label={`Corpus health score: ${score} out of 100. Grade: ${health.grade}. ${health.label}`}
    >
      {/* SVG Gauge */}
      <div className="gauge-wrap" aria-hidden="true">
        <svg className="gauge-svg" viewBox="0 0 140 80" aria-hidden="true">
          {/* Track */}
          <path
            d={`M ${startX} ${startY} A ${R} ${R} 0 0 1 ${endX} ${endY}`}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Fill */}
          <path
            d={`M ${startX} ${startY} A ${R} ${R} 0 0 1 ${endX} ${endY}`}
            fill="none"
            stroke={health.color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1), stroke 0.3s' }}
          />
          {/* Score text */}
          <text x={CX} y={CY + 4} textAnchor="middle" fill="#ffffff" fontSize="20" fontWeight="900" fontFamily="Montserrat, Arial">
            {score}
          </text>
          <text x={CX} y={CY + 20} textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="10" fontWeight="700" fontFamily="Montserrat, Arial">
            {health.grade}
          </text>
          {/* Min/Max labels */}
          <text x={startX - 4} y={startY + 14} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="Montserrat">0</text>
          <text x={endX + 4} y={endY + 14} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="Montserrat">100</text>
        </svg>
      </div>

      {/* Info */}
      <div className="health-info">
        <div className="health-title">Corpus Health Score</div>
        <div
          className="health-label"
          style={{ color: health.color }}
          aria-live="polite"
        >
          {health.label}
        </div>
        <div className="health-sub">
          Your projected corpus is{' '}
          <strong style={{ color: '#fff' }}>{formatINR(projectedCorpus, true)}</strong>
          {' '}against a required{' '}
          <strong style={{ color: '#fff' }}>{formatINR(requiredCorpus, true)}</strong>
        </div>
        {shortfall > 0 && (
          <div className="health-shortfall" aria-live="polite">
            ⚠ Shortfall: {formatINR(shortfall, true)} — consider increasing your SIP or extending tenure.
          </div>
        )}
        {surplus > 0 && (
          <div style={{ marginTop: 12, fontSize: 13, color: '#6ee7b7', fontWeight: 600 }}>
            ✅ Surplus: {formatINR(surplus, true)} — you are on track or ahead! (Illustrative)
          </div>
        )}

        {/* Progress bar */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
            <span>Coverage: {score}% of required corpus</span>
            <span style={{ color: health.color }}>{health.grade}</span>
          </div>
          <div
            style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 8, overflow: 'hidden' }}
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${score}% of required retirement corpus covered`}
          >
            <div
              style={{
                height: '100%',
                width: animated ? `${score}%` : '0%',
                background: health.color,
                borderRadius: 8,
                transition: 'width 1.4s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
