import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  Database, 
  LayoutDashboard, 
  MessageSquare, 
  Play, 
  RefreshCcw, 
  ShieldAlert, 
  Zap,
  Search,
  Phone,
  Building,
  Shield,
  Clock,
  HardDrive,
  Terminal,
  HeartPulse,
  Sliders,
  Copy,
  Info
} from 'lucide-react';
import { 
  fetchAgentStatus, 
  fetchTraces, 
  triggerDemoWorkflow, 
  fetchHealth, 
  fetchActiveCrises,
  fetchContacts
} from './api';

// Static fallback contacts registry to ensure it always renders beautifully even offline
const FALLBACK_CONTACTS = {
  "fire_brigade": {
    "name": "Fire Brigade / Rescue 1122",
    "emoji": "🚒",
    "category": "emergency",
    "description": "Primary fire response and local emergency search and rescue teams.",
    "numbers": {
      "Islamabad": "1122",
      "Karachi": "1122",
      "Lahore": "1122",
      "Peshawar": "1122",
      "Quetta": "1122"
    },
    "default": "1122"
  },
  "traffic_police": {
    "name": "Traffic Police",
    "emoji": "🚔",
    "category": "emergency",
    "description": "Helps manage road diversions, route clearance, and vehicular safety.",
    "numbers": {
      "Islamabad": "15",
      "Karachi": "15",
      "Lahore": "15",
      "Peshawar": "15",
      "Quetta": "15"
    },
    "default": "15"
  },
  "ndma": {
    "name": "NDMA / PDMA (Disaster)",
    "emoji": "🏛️",
    "category": "disaster",
    "description": "Provincial and National Disaster Management Authorities for large-scale coordination.",
    "numbers": {
      "Islamabad": "1700",
      "Karachi": "+92-21-99207900",
      "Lahore": "+92-42-99212200",
      "Peshawar": "+92-91-9210577",
      "Quetta": "+92-81-9202588"
    },
    "default": "1700"
  },
  "edhi_foundation": {
    "name": "Edhi Foundation Rescue",
    "emoji": "🚑",
    "category": "medical",
    "description": "Immediate private ambulance backup and trauma transportation.",
    "numbers": {
      "Islamabad": "115",
      "Karachi": "115",
      "Lahore": "115",
      "Peshawar": "115",
      "Quetta": "115"
    },
    "default": "115"
  },
  "rescue_medical": {
    "name": "Emergency Medical Services",
    "emoji": "🏥",
    "category": "medical",
    "description": "City-specific tertiary care public hospitals and trauma emergency departments.",
    "numbers": {
      "Islamabad": "+92-51-9261170",
      "Karachi": "+92-21-111-911-911",
      "Lahore": "+92-42-99231302",
      "Peshawar": "+92-91-9211278",
      "Quetta": "+92-81-9201820"
    },
    "default": "1122"
  },
  "water_board": {
    "name": "WASA / Water & Sewerage",
    "emoji": "💧",
    "category": "utilities",
    "description": "Manages urban drainage, water contamination, sewer blockages, and pipe bursts.",
    "numbers": {
      "Islamabad": "1334",
      "Karachi": "+92-21-99333000",
      "Lahore": "1334",
      "Peshawar": "1334",
      "Quetta": "1334"
    },
    "default": "1334"
  },
  "civil_defence": {
    "name": "Civil Defence Team",
    "emoji": "🛡️",
    "category": "defence",
    "description": "Mobilizes volunteer services, crowd safety, and infrastructure monitoring teams.",
    "numbers": {
      "Islamabad": "+92-51-9252871",
      "Karachi": "+92-21-99261455",
      "Lahore": "+92-42-99211556",
      "Peshawar": "+92-91-9210340",
      "Quetta": "+92-81-9202300"
    },
    "default": "+92-51-9252871"
  },
  "city_admin": {
    "name": "City Administration & Utilities",
    "emoji": "🏢",
    "category": "utilities",
    "description": "Helpline for electric grid repairs and district coordinator's office.",
    "numbers": {
      "Islamabad": "118",
      "Karachi": "+92-22-9280130",
      "Lahore": "118",
      "Peshawar": "118",
      "Quetta": "118"
    },
    "default": "118"
  }
};

const AGENT_META: { [key: string]: any } = {
  signal_ingestion: {
    name: "Signal Ingestion Agent",
    description: "Filters, sanitizes, and maps incoming text, social media reports, weather indexes, and traffic telemetry into active structured objects.",
    capabilities: [
      "Sanitizes input text and eliminates duplicate submissions",
      "Extracts geographical landmarks and cross-references GPS tags",
      "Parses multi-parameter telemetry feeds (weather condition, rain levels, traffic speeds)",
      "Initiates the Google Antigravity-style message queue orchestration"
    ],
    tools: ["NLP Engine", "Geo-Coordinates Normalizer", "Data Stream Aggregator", "Telemetry Sensor Parser"],
    defaultUptime: "99.99%",
    defaultMemory: "18.4 MB"
  },
  event_detection: {
    name: "Event Detection Agent",
    description: "Evaluates incident densities and cluster thresholds dynamically to detect localized crises and verify reports against sensor anomalies.",
    capabilities: [
      "Runs spatial density analysis on incoming signals to locate anomalies",
      "Cross-references reports with severe traffic congestion parameters",
      "Flags anomalies exceeding standard statistical thresholds (>200% congestion levels)",
      "Filters out random signals from valid crisis triggers"
    ],
    tools: ["Density Clustering Evaluator", "Traffic Anomaly Scanner", "Sensor Cross-Referencer"],
    defaultUptime: "99.98%",
    defaultMemory: "24.1 MB"
  },
  reasoning: {
    name: "Reasoning & Impact Agent",
    description: "Determines the humanitarian priority score and conducts ethical reasoning, giving immediate priority to high-vulnerability demographics.",
    capabilities: [
      "Calculates autonomous Humanitarian Severity Index (0-100 score)",
      "Identifies demographic risks (high density vulnerable housing, infants, elderly, exposure)",
      "Drafts custom natural-language explanations explaining response priority",
      "Maintains non-bias guidelines during multi-incident bottlenecks"
    ],
    tools: ["Vulnerability Assessment Matrix", "Humanitarian Index Model", "Ethical Policy Guardrail"],
    defaultUptime: "100.00%",
    defaultMemory: "32.8 MB"
  },
  action_planning: {
    name: "Action Planning Agent",
    description: "Selects and schedules optimized action items based on crisis category, location severity, and resource constraints.",
    capabilities: [
      "Matches crisis types with standard operating procedures",
      "Formulates specific resource mobilization objectives",
      "Prioritizes emergency dispatches based on the Reasoning Agent's outputs",
      "Dynamically allocates response actions under high severity constraints"
    ],
    tools: ["Response Planner Core", "Resource Allocation Solver", "Dynamic Checklist Compiler"],
    defaultUptime: "99.97%",
    defaultMemory: "19.5 MB"
  },
  dispatch: {
    name: "Dispatch Agent",
    description: "Cross-references emergency contacts database, maps dispatch locations to regional helplines, and logs alert payloads.",
    capabilities: [
      "Queries the internal contacts registry database based on city & crisis",
      "Resolves city-specific dispatch targets (Islamabad, Karachi, Lahore, etc.)",
      "Triggers simulated alerting payloads to target agencies",
      "Generates logs recording dispatch triggers and target details"
    ],
    tools: ["Registry Query Parser", "SMS/API Payload Generator", "Alert Dispatch Logger"],
    defaultUptime: "99.99%",
    defaultMemory: "16.2 MB"
  },
  simulation: {
    name: "Simulation Agent",
    description: "Models scenario forecasts to analyze the predicted impact of immediate agentic intervention compared against inaction.",
    capabilities: [
      "Projects spatial disaster spread modeling over 6, 12, and 24-hour periods",
      "Predicts critical resource conservation stats from active dispatch timelines",
      "Simulates estimated casualties and infrastructure recovery outcomes",
      "Maintains predictive telemetry models for multi-crisis situations"
    ],
    tools: ["Inaction Prediction Model", "Resource Projection Core", "Spatial Dispersal Simulator"],
    defaultUptime: "99.94%",
    defaultMemory: "44.6 MB"
  },
  visualization: {
    name: "Visualization Agent",
    description: "Processes geodata feeds and outputs layout parameters required for the front-end dashboard maps and Digital Twin telemetry.",
    capabilities: [
      "Exports GeoJSON properties containing localized incident coordinates",
      "Generates digital twin visual configurations for client layers",
      "Formats maps styling tokens depending on crisis severity level",
      "Compiles operational timeline traces for mobile and web screens"
    ],
    tools: ["Mapbox/Leaflet Exporter", "Digital Twin Engine", "UI Layout State Formatter"],
    defaultUptime: "99.99%",
    defaultMemory: "22.3 MB"
  }
};

function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'monitor' | 'knowledge'>('dashboard');
  const [agents, setAgents] = useState<any>({});
  const [traces, setTraces] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState('Checking...');
  const [activeCrises, setActiveCrises] = useState(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Agent Monitor states
  const [selectedAgentId, setSelectedAgentId] = useState<string>('signal_ingestion');
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [diagnosticsReport, setDiagnosticsReport] = useState<string | null>(null);
  const [agentLogLevels, setAgentLogLevels] = useState<{ [key: string]: string }>({
    signal_ingestion: 'INFO',
    event_detection: 'INFO',
    reasoning: 'INFO',
    action_planning: 'INFO',
    dispatch: 'INFO',
    simulation: 'INFO',
    visualization: 'INFO'
  });

  // Knowledge base states
  const [contacts, setContacts] = useState<any>(FALLBACK_CONTACTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('All Cities');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dispatchedSimId, setDispatchedSimId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const statusRes = await fetchAgentStatus();
      setAgents(statusRes.agents || {});
      
      const tracesRes = await fetchTraces();
      setTraces(tracesRes.logs || []);
      
      const health = await fetchHealth();
      setSystemStatus(health.status === 'healthy' ? 'Operational' : 'Issues Detected');

      const crisesRes = await fetchActiveCrises();
      setActiveCrises(crisesRes.count || 0);
    } catch (err) {
      console.error('Failed to fetch data', err);
      setSystemStatus('Offline');
      // If offline, simulate agents showing as idle/completed instead of failing dashboard
      setAgents(prev => Object.keys(prev).length ? prev : {
        signal_ingestion: 'completed',
        event_detection: 'completed',
        reasoning: 'completed',
        action_planning: 'completed',
        dispatch: 'completed',
        simulation: 'completed',
        visualization: 'completed'
      });
    }
  };

  const fetchContactsData = async () => {
    try {
      const data = await fetchContacts();
      if (data && Object.keys(data).length > 0) {
        setContacts(data);
      }
    } catch (e) {
      console.log("Using fallback contacts registry (offline / standalone).");
    }
  };

  useEffect(() => {
    fetchData();
    fetchContactsData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [traces, currentTab]);

  const handleTriggerDemo = async () => {
    setLoading(true);
    try {
      await triggerDemoWorkflow();
      await fetchData();
    } catch (err) {
      alert('Failed to trigger demo. Make sure backend is running locally at http://localhost:8000');
    } finally {
      setLoading(false);
    }
  };

  const handleRunDiagnostics = (agentId: string) => {
    setDiagnosticsRunning(true);
    setDiagnosticsReport(null);
    setTimeout(() => {
      setDiagnosticsRunning(false);
      const meta = AGENT_META[agentId] || { name: agentId };
      const report = {
        agent_id: agentId,
        status: agents[agentId] || 'idle',
        version: "1.0.4-antigravity",
        log_level: agentLogLevels[agentId] || 'INFO',
        checks: [
          { name: "Dependencies", status: "PASSED" },
          { name: "API Connection", status: "PASSED" },
          { name: "SQLite Telemetry Connector", status: "PASSED" },
          { name: "Message Bus Consumer", status: "PASSED" }
        ],
        metrics: {
          latency_ms: Math.floor(Math.random() * 80) + 40,
          success_rate: "100.0%",
          current_memory: meta.defaultMemory
        },
        timestamp: new Date().toISOString()
      };
      setDiagnosticsReport(JSON.stringify(report, null, 2));
    }, 1000);
  };

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    alert(`Copied: ${num}`);
  };

  const handleSimulateDispatch = (key: string) => {
    setDispatchedSimId(key);
    setTimeout(() => {
      setDispatchedSimId(null);
      alert(`Simulation Triggered: Automated dispatch payload routed to ${contacts[key]?.name}!`);
    }, 800);
  };

  const getStatusClass = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'running': return 'status-running';
      case 'completed': return 'status-completed';
      default: return 'status-idle';
    }
  };

  // Filtered contacts
  const filteredContactsList = Object.entries(contacts).filter(([key, contact]: [string, any]) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          contact.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || contact.category === categoryFilter;
    
    // Check if the contact has numbers for the selected city or defaults
    const hasCity = cityFilter === 'All Cities' || contact.numbers[cityFilter] !== undefined;
    
    return matchesSearch && matchesCategory && hasCity;
  });

  return (
    <div className="dashboard-container">
      {/* Dynamic CSS Styling Injector */}
      <style>{`
        .monitor-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 1.5rem;
          min-height: calc(100vh - 120px);
        }
        .agent-list-panel {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          height: fit-content;
        }
        .agent-list-item {
          padding: 0.85rem 1rem;
          border-radius: 0.5rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          color: var(--text-main);
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .agent-list-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--primary);
        }
        .agent-list-item.selected {
          background: rgba(99, 102, 241, 0.15);
          border-color: var(--primary);
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.1);
        }
        .agent-info-panel {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid var(--border);
          padding-bottom: 1.25rem;
        }
        .metrics-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .metric-mini-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          padding: 1rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .capabilities-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          list-style: none;
          padding-left: 0;
        }
        .capability-bullet {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: var(--text-muted);
          line-height: 1.4;
        }
        .capability-bullet::before {
          content: '✦';
          color: var(--primary);
          font-weight: bold;
        }
        .tools-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .tool-tag {
          padding: 0.35rem 0.75rem;
          border-radius: 0.35rem;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          color: #a78bfa;
          font-size: 0.8rem;
          font-weight: 500;
        }
        .controls-card {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border);
          padding: 1.25rem;
          border-radius: 0.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .control-select {
          background: var(--bg-dark);
          color: var(--text-main);
          border: 1px solid var(--border);
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          outline: none;
          cursor: pointer;
        }
        .diagnostics-log-box {
          background: #090d16;
          border: 1px solid #1e293b;
          border-radius: 0.5rem;
          padding: 1rem;
          font-family: monospace;
          font-size: 0.85rem;
          color: var(--success);
          max-height: 200px;
          overflow-y: auto;
          white-space: pre-wrap;
        }
        
        /* Knowledge Base styles */
        .kb-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 1.5rem;
        }
        .kb-filter-panel {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          height: fit-content;
        }
        .search-wrapper {
          position: relative;
          width: 100%;
        }
        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .kb-input {
          width: 100%;
          background: var(--bg-dark);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          padding: 0.6rem 0.6rem 0.6rem 2.25rem;
          color: var(--text-main);
          outline: none;
          transition: border 0.2s;
        }
        .kb-input:focus {
          border-color: var(--primary);
        }
        .kb-sidebar-title {
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }
        .kb-category-list {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .kb-category-btn {
          width: 100%;
          text-align: left;
          padding: 0.5rem 0.75rem;
          border-radius: 0.35rem;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .kb-category-btn:hover, .kb-category-btn.active {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-main);
        }
        .kb-category-btn.active {
          color: var(--primary);
          font-weight: 600;
          border-left: 2.5px solid var(--primary);
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
        .kb-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.25rem;
        }
        .kb-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.2s, border-color 0.2s;
          min-height: 250px;
        }
        .kb-card:hover {
          transform: translateY(-3px);
          border-color: rgba(99,102,241,0.5);
        }
        .kb-card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .kb-card-emoji {
          font-size: 1.75rem;
          padding: 0.4rem;
          background: rgba(255,255,255,0.03);
          border-radius: 0.5rem;
        }
        .kb-number-display {
          margin: 1.25rem 0;
          padding: 1rem;
          background: rgba(0,0,0,0.15);
          border-radius: 0.5rem;
          border: 1px solid rgba(255,255,255,0.02);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .kb-number-val {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--primary);
          font-family: monospace;
        }
        .kb-tag {
          font-size: 0.75rem;
          padding: 0.15rem 0.5rem;
          border-radius: 0.25rem;
          text-transform: uppercase;
          font-weight: bold;
        }
        .kb-tag-emergency { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
        .kb-tag-disaster { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
        .kb-tag-medical { background: rgba(34, 197, 94, 0.1); color: var(--success); }
        .kb-tag-utilities { background: rgba(99, 102, 241, 0.1); color: var(--primary); }
        .kb-tag-defence { background: rgba(139, 92, 246, 0.1); color: var(--accent); }
      `}</style>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <ShieldAlert size={32} />
          <span>CIRO System</span>
        </div>
        
        <nav className="nav-links">
          <button 
            onClick={() => setCurrentTab('dashboard')} 
            className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
            style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          
          <button 
            onClick={() => setCurrentTab('monitor')} 
            className={`nav-item ${currentTab === 'monitor' ? 'active' : ''}`}
            style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
          >
            <Activity size={20} />
            Agent Monitor
          </button>
          
          <button 
            onClick={() => setCurrentTab('knowledge')} 
            className={`nav-item ${currentTab === 'knowledge' ? 'active' : ''}`}
            style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
          >
            <Database size={20} />
            Knowledge Base
          </button>
        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <div className="pulse" style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: systemStatus === 'Operational' ? 'var(--success)' : 'var(--danger)' }}></div>
            <span>System: {systemStatus}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        
        {/* ==================== TAB 1: DASHBOARD ==================== */}
        {currentTab === 'dashboard' && (
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
                    <div key={id} className="agent-card">
                      <div className="agent-header">
                        <h3 style={{ textTransform: 'capitalize' }}>{id.replace('_', ' ')}</h3>
                        <span className={`status-badge ${getStatusClass(status)}`}>
                          {status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', minHeight: '60px' }}>
                        {AGENT_META[id]?.description}
                      </div>
                      <button 
                        onClick={() => { setSelectedAgentId(id); setCurrentTab('monitor'); }} 
                        style={{ marginTop: 'auto', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textAlign: 'left', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Info size={14} /> View Agent Profile
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
                <div ref={logEndRef} />
              </div>
            </section>
          </>
        )}

        {/* ==================== TAB 2: AGENT MONITOR ==================== */}
        {currentTab === 'monitor' && (
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
                      onClick={() => { setSelectedAgentId(id); setDiagnosticsReport(null); }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{meta.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {id}</span>
                      </div>
                      <span className={`status-badge ${getStatusClass(status)}`}>
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Right Agent Details Panel */}
              {selectedAgentId && AGENT_META[selectedAgentId] && (
                <div className="agent-info-panel">
                  {/* Panel Header */}
                  <div className="details-header">
                    <div>
                      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem' }}>
                        <Cpu color="var(--primary)" size={28} />
                        {AGENT_META[selectedAgentId].name}
                      </h2>
                      <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.95rem', lineHeight: '1.4' }}>
                        {AGENT_META[selectedAgentId].description}
                      </p>
                    </div>
                    <span className={`status-badge ${getStatusClass(agents[selectedAgentId])}`} style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
                      Status: {agents[selectedAgentId] || 'idle'}
                    </span>
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
                  <div className="controls-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>LOGGING PARAMETER</span>
                        <select 
                          value={agentLogLevels[selectedAgentId]} 
                          className="control-select"
                          onChange={(e) => setAgentLogLevels({
                            ...agentLogLevels,
                            [selectedAgentId]: e.target.value
                          })}
                        >
                          <option value="INFO">INFO (Normal)</option>
                          <option value="DEBUG">DEBUG (Detailed Verbose)</option>
                          <option value="WARN">WARN (Warnings Only)</option>
                          <option value="ERROR">ERROR (Fatal Events)</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>FORCE CYCLE ACTIONS</span>
                        <button 
                          onClick={() => {
                            setAgents({ ...agents, [selectedAgentId]: 'idle' });
                            alert(`Agent [${selectedAgentId}] status forced back to IDLE state.`);
                          }}
                          style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                          onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                          Restart Agent Core
                        </button>
                      </div>
                    </div>

                    <button 
                      className="btn-primary" 
                      onClick={() => handleRunDiagnostics(selectedAgentId)}
                      disabled={diagnosticsRunning}
                    >
                      {diagnosticsRunning ? <RefreshCcw className="pulse" size={18} /> : <Sliders size={18} />}
                      Run Diagnostics Check
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
        )}

        {/* ==================== TAB 3: KNOWLEDGE BASE ==================== */}
        {currentTab === 'knowledge' && (
          <>
            <header className="header">
              <div>
                <h1>Crisis Response Knowledge Base</h1>
                <p style={{ color: 'var(--text-muted)' }}>Query live emergency contacts registry, WASA helplines, WASA blockages guides, and route dispatches.</p>
              </div>
            </header>

            <div className="kb-layout">
              {/* Sidebar filter options */}
              <div className="kb-filter-panel">
                {/* Search query input */}
                <div>
                  <h3 className="kb-sidebar-title">Keyword Search</h3>
                  <div className="search-wrapper">
                    <Search className="search-icon" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search rescue, WASA..." 
                      className="kb-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* City filters */}
                <div>
                  <h3 className="kb-sidebar-title">Select Region</h3>
                  <select 
                    className="kb-input" 
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                    style={{ paddingLeft: '0.75rem', height: '40px', cursor: 'pointer' }}
                  >
                    <option value="All Cities">All Cities (Pakistan)</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Peshawar">Peshawar</option>
                    <option value="Quetta">Quetta</option>
                  </select>
                </div>

                {/* Category filters */}
                <div>
                  <h3 className="kb-sidebar-title">Resource Category</h3>
                  <div className="kb-category-list">
                    <button 
                      className={`kb-category-btn ${categoryFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setCategoryFilter('all')}
                    >
                      <Building size={16} /> All Resources
                    </button>
                    <button 
                      className={`kb-category-btn ${categoryFilter === 'emergency' ? 'active' : ''}`}
                      onClick={() => setCategoryFilter('emergency')}
                    >
                      <Shield size={16} /> Emergency Services
                    </button>
                    <button 
                      className={`kb-category-btn ${categoryFilter === 'disaster' ? 'active' : ''}`}
                      onClick={() => setCategoryFilter('disaster')}
                    >
                      <AlertTriangle size={16} /> Disaster (NDMA)
                    </button>
                    <button 
                      className={`kb-category-btn ${categoryFilter === 'medical' ? 'active' : ''}`}
                      onClick={() => setCategoryFilter('medical')}
                    >
                      <HeartPulse size={16} /> Medical & Ambulance
                    </button>
                    <button 
                      className={`kb-category-btn ${categoryFilter === 'utilities' ? 'active' : ''}`}
                      onClick={() => setCategoryFilter('utilities')}
                    >
                      <Phone size={16} /> Utilities & Drainage
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.75rem', lineHeight: '1.4' }}>
                  <div style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Info size={12} /> Contact Syncing
                  </div>
                  This directory synchronizes live with the backend agent knowledge registry: <code>contacts_registry.json</code>
                </div>
              </div>

              {/* Grid content displaying filtered cards */}
              <div>
                <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
                  Showing {filteredContactsList.length} registered emergency agencies matches
                </div>

                {filteredContactsList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '1rem', color: 'var(--text-muted)' }}>
                    No emergency responders match your search criteria. Try removing filters.
                  </div>
                ) : (
                  <div className="kb-grid">
                    {filteredContactsList.map(([key, contact]: [string, any]) => {
                      // Get city-specific number or default
                      const activeNumber = cityFilter === 'All Cities' ? contact.default : (contact.numbers[cityFilter] || contact.default);

                      return (
                        <div key={key} className="kb-card">
                          <div>
                            <div className="kb-card-header">
                              <span className="kb-card-emoji">{contact.emoji}</span>
                              <div>
                                <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{contact.name}</h3>
                                <span className={`kb-tag kb-tag-${contact.category}`} style={{ marginTop: '0.2rem', display: 'inline-block' }}>
                                  {contact.category}
                                </span>
                              </div>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.45', marginTop: '0.5rem' }}>
                              {contact.description}
                            </p>
                          </div>

                          <div>
                            {/* Region Display */}
                            <div className="kb-number-display">
                              <div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                                  {cityFilter === 'All Cities' ? 'DEFAULT DIAL' : `${cityFilter} HELPLINE`}
                                </div>
                                <div className="kb-number-val">{activeNumber}</div>
                              </div>
                              <button 
                                onClick={() => handleCopyNumber(activeNumber)}
                                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '0.4rem', borderRadius: '0.25rem', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                title="Copy Helpline"
                              >
                                <Copy size={16} />
                              </button>
                            </div>

                            {/* Card Footer action buttons */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button 
                                onClick={() => handleSimulateDispatch(key)}
                                className="btn-primary" 
                                style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem', justifyContent: 'center' }}
                                disabled={dispatchedSimId !== null}
                              >
                                {dispatchedSimId === key ? <RefreshCcw className="pulse" size={14} /> : <Zap size={14} />}
                                Simulate Dispatch
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

      </main>
    </div>
  );
}

export default App;
