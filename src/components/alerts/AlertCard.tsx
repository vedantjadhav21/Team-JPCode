/**
 * AlertCard — single alert with expandable SHAP waterfall.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Alert } from '../../lib/types';
import ShapWaterfall from './ShapWaterfall';

interface Props {
  alert: Alert;
}

function scoreColor(s: number) {
  if (s <= 40) return 'var(--success)';
  if (s <= 65) return 'var(--warning)';
  return 'var(--danger)';
}

function formatTime(ts: string) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

function crisisLabel(ct: string) {
  return ct.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function AlertCard({ alert }: Props) {
  const [showShap, setShowShap] = useState(false);
  const sev = alert.severity.toLowerCase();

  const primaryDriver = alert.top_shap?.[0];
  const driverText = primaryDriver
    ? `Primary driver: ${primaryDriver.feature_name.replace(/_/g, ' ')} ${primaryDriver.direction === 'up' ? '+' : ''}${primaryDriver.shap_value.toFixed(2)}`
    : null;

  return (
    <motion.div
      className={`alert-card ${sev}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <div className="alert-card-top">
        <span className={`severity-pill ${sev}`}>{alert.severity}</span>
        <span className="crisis-badge">{crisisLabel(alert.crisis_type)}</span>
        <span className="alert-time">{formatTime(alert.triggered_at)}</span>
      </div>

      <div className="alert-score-line">
        <span style={{ color: scoreColor(alert.score) }}>
          {crisisLabel(alert.crisis_type)}: {alert.score.toFixed(1)}
        </span>
        <span className="ci">{' '}[CI: {alert.ci_lower.toFixed(1)}–{alert.ci_upper.toFixed(1)}]</span>
      </div>

      {driverText && <div className="alert-driver">📊 {driverText}</div>}

      {alert.historical_analog && (
        <div className="alert-analog">
          📜 Closest precedent: {alert.historical_analog.event_name} ({(alert.historical_analog.similarity_score * 100).toFixed(0)}% match)
        </div>
      )}

      {alert.recommended_actions?.[0] && (
        <div className="alert-action">💡 {alert.recommended_actions[0]}</div>
      )}

      <button className="shap-toggle" onClick={() => setShowShap(!showShap)}>
        {showShap ? 'Hide' : 'View'} SHAP Analysis
      </button>

      <AnimatePresence>
        {showShap && alert.top_shap && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <ShapWaterfall contributions={alert.top_shap} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
