/**
 * Dashboard Layout — fixed navbar + sidebar + main content area.
 */
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  Home, Activity, Globe, Bell, GitMerge, MessageSquare,
} from 'lucide-react';
import { useRiskStore } from '../store/useRiskStore';
import { useRiskStream } from '../hooks/useRiskStream';
import { MOCK_SCORES } from '../lib/mockData';
import ChatPanel from '../components/chat/ChatPanel';

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Overview' },
  { to: '/risk', icon: Activity, label: 'Risk Monitor' },
  { to: '/map', icon: Globe, label: 'World Map' },
  { to: '/alerts', icon: Bell, label: 'Alert Inbox', showBadge: true },
  { to: '/cross-market', icon: GitMerge, label: 'Cross-Market' },
  { to: '#', icon: MessageSquare, label: 'AI Analyst', isChatToggle: true },
];

function scoreColor(s: number) {
  if (s <= 40) return 'green';
  if (s <= 65) return 'amber';
  return 'red';
}

function marketStatus(s: number) {
  if (s <= 30) return { label: 'Safe', cls: 'safe' };
  if (s <= 55) return { label: 'Warning', cls: 'warning' };
  if (s <= 80) return { label: 'High Risk', cls: 'high' };
  return { label: 'Critical', cls: 'critical' };
}

export default function DashboardLayout() {
  const { status } = useRiskStream();
  const storeScores = useRiskStore((s) => s.scores);
  const alerts = useRiskStore((s) => s.alerts);
  const location = useLocation();

  const scores = storeScores.length > 0 ? storeScores : MOCK_SCORES;
  const globalScore = scores.length > 0
    ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length)
    : 0;
  const ciLow = scores.length > 0 ? Math.round(scores.reduce((a, s) => a + s.ci_lower, 0) / scores.length) : 0;
  const ciHigh = scores.length > 0 ? Math.round(scores.reduce((a, s) => a + s.ci_upper, 0) / scores.length) : 0;
  const ms = marketStatus(globalScore);
  const alertCount = alerts.length || 4;

  const liveClass = status === 'live' ? 'on' : status === 'reconnecting' ? 'reconnecting' : 'off';
  const liveText = status === 'live' ? 'LIVE' : status === 'reconnecting' ? 'RECONNECTING' : 'OFFLINE';

  return (
    <>
      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav className="navbar">
        <div className="navbar-left">
          <span className="navbar-brand">
            <span className="w">Crisis</span><span className="p">Lens</span>
          </span>
        </div>

        <div className="navbar-center">
          <div className="gauge-mini">
            {/* Mini arc rendered via SVG */}
            <svg width="40" height="24" viewBox="0 0 40 24">
              <path d="M4 22 A16 16 0 0 1 36 22" fill="none" stroke="var(--border)" strokeWidth="3" strokeLinecap="round" />
              <path
                d="M4 22 A16 16 0 0 1 36 22"
                fill="none"
                stroke={globalScore <= 40 ? 'var(--success)' : globalScore <= 65 ? 'var(--warning)' : 'var(--danger)'}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(globalScore / 100) * 50} 50`}
              />
            </svg>
            <div>
              <div className={`gauge-mini-score`} style={{ color: globalScore <= 40 ? 'var(--success)' : globalScore <= 65 ? 'var(--warning)' : 'var(--danger)' }}>
                {globalScore}
              </div>
              <div className="gauge-mini-ci">[{ciLow}–{ciHigh}]</div>
            </div>
            <div className="gauge-mini-label">Global<br/>Risk</div>
          </div>
        </div>

        <div className="navbar-right">
          <span className={`market-pill ${ms.cls}`}>{ms.label}</span>
          <NavLink to="/alerts" className="alert-badge-wrap" style={{color:'var(--text-2)'}}>
            <Bell size={18} />
            {alertCount > 0 && <span className="alert-badge">{alertCount}</span>}
          </NavLink>
          <span className="live-label">
            <span className={`live-dot ${liveClass}`} />
            {liveText}
          </span>
        </div>
      </nav>

      {/* ── Shell ───────────────────────────────────────────── */}
      <div className="app-shell">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <div className="sidebar-section-label">Navigation</div>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.disabled ? '#' : item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `sidebar-link${isActive && !item.disabled ? ' active' : ''}${item.disabled ? ' disabled' : ''}`
                }
                onClick={item.disabled ? (e) => e.preventDefault() : undefined}
              >
                <item.icon className="icon" size={18} />
                <span>{item.label}</span>
                {item.disabled && <span style={{ fontSize: 9, color: 'var(--text-3)', marginLeft: 'auto' }}>Soon</span>}
                {item.showBadge && alertCount > 0 && <span className="badge">{alertCount}</span>}
              </NavLink>
            ))}

            <div className="sidebar-section-label" style={{ marginTop: 24 }}>System</div>
            <div className="sidebar-link" style={{ cursor: 'default' }}>
              <div style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className={`live-dot ${liveClass}`} />
              </div>
              <span>{liveText}</span>
            </div>
          </nav>
        </aside>

        <main className="main-content">
          <Outlet />
        </main>
      </div>

      {/* Chat panel (renders globally) */}
      <ChatPanel />
    </>
  );
}
