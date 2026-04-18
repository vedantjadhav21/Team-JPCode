/**
 * HomePage — summary stats + prediction chart + insights panel.
 */
import { useRiskStore } from '../store/useRiskStore';
import { MOCK_SCORES } from '../lib/mockData';
import PredictionChart from '../components/chart/PredictionChart';
import InsightsPanel from '../components/InsightsPanel';

function scoreColor(s: number) {
  if (s <= 40) return 'green';
  if (s <= 65) return 'amber';
  return 'red';
}

export default function HomePage() {
  const storeScores = useRiskStore((s) => s.scores);
  const alerts = useRiskStore((s) => s.alerts);

  const scores = storeScores.length > 0 ? storeScores : MOCK_SCORES;
  const globalScore = scores.length > 0
    ? +(scores.reduce((a, s) => a + s.score, 0) / scores.length).toFixed(1)
    : 0;
  const ciLow = scores.length > 0 ? +(scores.reduce((a, s) => a + s.ci_lower, 0) / scores.length).toFixed(1) : 0;
  const ciHigh = scores.length > 0 ? +(scores.reduce((a, s) => a + s.ci_upper, 0) / scores.length).toFixed(1) : 0;
  const alertCount = alerts.length || 4;

  // Model confidence = 100 - avg CI width (simplistic proxy)
  const avgCIWidth = scores.length > 0
    ? scores.reduce((a, s) => a + (s.ci_upper - s.ci_lower), 0) / scores.length
    : 12;
  const modelConf = Math.max(0, Math.min(100, 100 - avgCIWidth * 2.5)).toFixed(0);

  return (
    <>
      {/* ── Stats Row ─────────────────────────────────────── */}
      <div className="stats-row">
        <div className="card stat-card">
          <div className="stat-label">Global Risk Score</div>
          <div className={`stat-value ${scoreColor(globalScore)}`}>{globalScore}</div>
          <div className="stat-sub">[{ciLow} – {ciHigh}]</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Active Alerts</div>
          <div className={`stat-value ${alertCount > 0 ? 'red' : 'green'}`}>{alertCount}</div>
          <div className="stat-sub">{alertCount > 2 ? 'Elevated' : 'Normal'} activity</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Signals Monitored</div>
          <div className="stat-value purple">42</div>
          <div className="stat-sub">6 categories</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Model Confidence</div>
          <div className={`stat-value ${+modelConf > 70 ? 'green' : +modelConf > 50 ? 'amber' : 'red'}`}>{modelConf}%</div>
          <div className="stat-sub">Ensemble health</div>
        </div>
      </div>

      {/* ── Chart + Insights ──────────────────────────────── */}
      <div className="chart-section">
        <PredictionChart />
        <InsightsPanel />
      </div>

      {/* ── Per-Category Scores ───────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {scores.map((s) => (
          <div className="card" key={s.crisis_type} style={{ textAlign: 'center' }}>
            <div className="card-title" style={{ marginBottom: 8 }}>
              {s.crisis_type.replace(/_/g, ' ')}
            </div>
            <div style={{ fontSize: 36, fontWeight: 900, fontFamily: 'var(--mono)', color: s.score > 65 ? 'var(--danger)' : s.score > 40 ? 'var(--warning)' : 'var(--success)' }}>
              {s.score.toFixed(1)}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--mono)', marginTop: 4 }}>
              [{s.ci_lower.toFixed(1)} – {s.ci_upper.toFixed(1)}]
            </div>
            {/* Score bar */}
            <div style={{ marginTop: 12, height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 2,
                width: `${s.score}%`,
                background: s.score > 65 ? 'var(--danger)' : s.score > 40 ? 'var(--warning)' : 'var(--success)',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
