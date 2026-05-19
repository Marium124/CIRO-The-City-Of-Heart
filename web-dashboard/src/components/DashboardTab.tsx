import React from 'react';
import { Cpu, Play, RefreshCcw, MessageSquare, Settings } from 'lucide-react';
import { AGENT_META, AGENT_EMOJIS } from '../constants';

interface DashboardTabProps {
  agents: Record<string, string>;
  traces: any[];
  loading: boolean;
  activeCrises: number;
  handleTriggerDemo: () => void;
  setSelectedAgentId: (id: string) => void;
  setCurrentTab: (tab: 'dashboard' | 'monitor' | 'knowledge') => void;
  logEndRef: React.RefObject<HTMLDivElement | null>;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  agents,
  traces,
  loading,
  activeCrises,
  handleTriggerDemo,
  setSelectedAgentId,
  setCurrentTab,
  logEndRef
}) => {
  const getStatusClass = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'running': return 'status-running';
      case 'completed': return 'status-completed';
      default: return 'status-idle';
    }
  };

  return (
    <>
      <header className="header">
        <div>
          <h1>Crisis Intelligence Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Multi-agent orchestration monitor (Antigravity-style)</p>
        </div>
        
        <button 
          className="btn-primary" 
          onClick={handleTriggerDemo}
          disabled={loading}
        >
          {loading ? <RefreshCcw className="pulse" size={20} /> : <Play size={20} />}
          Trigger Demo Scenario
        </button>
      </header>

      {/* Stats Grid */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Active Crises</div>
          <div className="stat-value" style={{ color: activeCrises > 0 ? 'var(--danger)' : 'var(--text-main)' }}>
            {activeCrises} Detected
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Agents</div>
          <div className="stat-value">{Object.keys(agents).length} Units</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Workflow Status</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>
            {loading ? 'Executing...' : 'Ready'}
          </div>
        </div>
      </section>

      {/* Agent Grid */}
      <section>
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={24} color="var(--primary)" />
          Active Agents
        </h2>
        <div className="agent-grid">
          {Object.keys(AGENT_META).map((id) => {
            const status = agents[id] || 'idle';
            return (
              <div key={id} className="agent-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="agent-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '2rem' }}>{AGENT_EMOJIS[id] || '⚙️'}</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{AGENT_META[id]?.name || id.replace('_', ' ')}</h3>
                  </div>
                  <span className={`status-badge ${getStatusClass(status)}`}>
                    {status}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', flex: 1, alignContent: 'flex-start' }}>
                  {AGENT_META[id]?.tools?.map((t: string) => (
                    <span key={t} style={{ background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {t}
                    </span>
                  ))}
                </div>

                <button 
                  onClick={() => { setSelectedAgentId(id); setCurrentTab('monitor'); }} 
                  style={{ marginTop: 'auto', background: 'rgba(99, 102, 241, 0.1)', border: 'none', color: 'var(--primary)', padding: '0.6rem', borderRadius: '0.5rem', cursor: 'pointer', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Settings size={16} /> CONFIGURE
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Activity Feed */}
      <section className="activity-container">
        <div className="activity-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={20} />
            <span>Real-time Agent Traces</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Live stream from AgentManager
          </div>
        </div>
        <div className="log-viewer">
          {traces.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No activity detected. Trigger a demo to see agent traces.
            </div>
          ) : (
            traces.map((trace, i) => (
              <div key={i} className="log-entry">
                <span className="log-time">[{new Date(trace.timestamp).toLocaleTimeString()}]</span>
                <span className="log-agent">{trace.agent_id}:</span>
                <span className="log-message">
                  {trace.action} 
                  {trace.details && Object.keys(trace.details).length > 0 && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {' '}({JSON.stringify(trace.details)})
                    </span>
                  )}
                </span>
              </div>
            ))
          )}
          <div ref={logEndRef as any} />
        </div>
      </section>
    </>
  );
};
