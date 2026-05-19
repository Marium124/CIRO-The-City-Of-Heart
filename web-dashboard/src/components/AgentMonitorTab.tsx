import React from 'react';
import { Clock, HardDrive, Terminal, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { AGENT_META, AGENT_EMOJIS } from '../constants';

interface AgentMonitorTabProps {
  agents: Record<string, string>;
  traces: any[];
  selectedAgentId: string;
  setSelectedAgentId: (id: string) => void;
  diagnosticsRunning: boolean;
  diagnosticsReport: string | null;
  agentLogLevels: Record<string, string>;
  setAgentLogLevels: (levels: Record<string, string>) => void;
  setAgents: React.Dispatch<React.SetStateAction<any>>;
  handleRunDiagnostics: (agentId: string) => void;
}

export const AgentMonitorTab: React.FC<AgentMonitorTabProps> = ({
  agents,
  traces,
  selectedAgentId,
  setSelectedAgentId,
  diagnosticsRunning,
  diagnosticsReport,
  agentLogLevels,
  setAgentLogLevels,
  setAgents,
  handleRunDiagnostics
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
          <h1>Autonomous Agent Monitor</h1>
          <p style={{ color: 'var(--text-muted)' }}>Inspect capabilities, trace diagnostic loops, and manage logging configurations.</p>
        </div>
      </header>

      <div className="monitor-layout">
        {/* Left Agent List */}
        <div className="agent-list-panel">
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>MONITORED AGENTS</h3>
          {Object.entries(AGENT_META).map(([id, meta]: [string, any]) => {
            const status = agents[id] || 'idle';
            return (
              <div 
                key={id} 
                className={`agent-list-item ${selectedAgentId === id ? 'selected' : ''}`}
                onClick={() => { setSelectedAgentId(id); }}
                style={{ padding: '0.75rem', gap: '0.5rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.75rem' }}>{AGENT_EMOJIS[id] || '⚙️'}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{meta.name}</span>
                    <span className={`status-badge ${getStatusClass(status)}`} style={{ alignSelf: 'flex-start', fontSize: '0.65rem', padding: '0.15rem 0.4rem', marginTop: '0.2rem' }}>
                      {status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Agent Details Panel */}
        {selectedAgentId && AGENT_META[selectedAgentId] && (
          <div className="agent-info-panel">
            {/* Panel Header */}
            <div className="details-header" style={{ alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: '3rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '1rem' }}>
                  {AGENT_EMOJIS[selectedAgentId] || '⚙️'}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>
                    {AGENT_META[selectedAgentId].name}
                  </h2>
                  <span className={`status-badge ${getStatusClass(agents[selectedAgentId])}`} style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem', display: 'inline-block', marginTop: '0.5rem' }}>
                    {agents[selectedAgentId] || 'idle'}
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="metrics-grid-3">
              <div className="metric-mini-card">
                <Clock size={20} color="var(--success)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>UPTIME PRESERVED</div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{AGENT_META[selectedAgentId].defaultUptime}</div>
                </div>
              </div>
              <div className="metric-mini-card">
                <HardDrive size={20} color="var(--primary)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MEMORY FOOTPRINT</div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{AGENT_META[selectedAgentId].defaultMemory}</div>
                </div>
              </div>
              <div className="metric-mini-card">
                <Terminal size={20} color="var(--accent)" />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>LATEST ACTIVITY</div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                    {traces.filter(t => t.agent_id === selectedAgentId).length} Traces
                  </div>
                </div>
              </div>
            </div>

            {/* Capabilities List */}
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                Core Agent Capabilities
              </h3>
              <ul className="capabilities-list">
                {AGENT_META[selectedAgentId].capabilities.map((cap: string, index: number) => (
                  <li key={index} className="capability-bullet">
                    {cap}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tool Belt */}
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
                Agentic Tool Belt Loaded
              </h3>
              <div className="tools-wrap">
                {AGENT_META[selectedAgentId].tools.map((tool: string, index: number) => (
                  <span key={index} className="tool-tag">
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Controls card */}
            <div className="controls-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'flex-end', background: 'var(--bg-dark)', padding: '1.5rem', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', flex: 1, gap: '2rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>LOGGING VERBOSITY</span>
                  <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.03)', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {['INFO', 'DEBUG', 'WARN', 'ERROR'].map(level => (
                      <button
                        key={level}
                        onClick={() => setAgentLogLevels({...agentLogLevels, [selectedAgentId]: level})}
                        style={{
                          padding: '0.4rem 0.8rem',
                          borderRadius: '0.35rem',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          backgroundColor: agentLogLevels[selectedAgentId] === level || (!agentLogLevels[selectedAgentId] && level === 'INFO') ? 'var(--primary)' : 'transparent',
                          color: agentLogLevels[selectedAgentId] === level || (!agentLogLevels[selectedAgentId] && level === 'INFO') ? 'white' : 'var(--text-muted)',
                          transition: 'all 0.2s'
                        }}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>SYSTEM OVERRIDE</span>
                  <button 
                    onClick={() => {
                      setAgents((prev: any) => ({ ...prev, [selectedAgentId]: 'idle' }));
                      alert(`Agent [${selectedAgentId}] status forced back to IDLE state.`);
                    }}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger)', padding: '0.55rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.85rem' }}
                  >
                    <RefreshCcw size={16} /> REBOOT CORE
                  </button>
                </div>
              </div>

              <button 
                className="btn-primary" 
                onClick={() => handleRunDiagnostics(selectedAgentId)}
                disabled={diagnosticsRunning}
                style={{ padding: '0.8rem 1.5rem', fontSize: '0.95rem' }}
              >
                {diagnosticsRunning ? <RefreshCcw className="pulse" size={18} /> : <Terminal size={18} />}
                RUN DIAGNOSTICS
              </button>
            </div>

            {/* Diagnostics output */}
            {diagnosticsRunning && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <RefreshCcw className="pulse" size={16} color="var(--primary)" />
                Simulating Antigravity diagnostics loop on <code>{selectedAgentId}</code>...
              </div>
            )}

            {diagnosticsReport && (
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--success)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={16} /> Diagnostics Verified: Operational
                </h4>
                <pre className="diagnostics-log-box">
                  {diagnosticsReport}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
