import React from 'react';
import { ShieldAlert, LayoutDashboard, Activity, Database } from 'lucide-react';

interface SidebarProps {
  currentTab: 'dashboard' | 'monitor' | 'knowledge';
  setCurrentTab: (tab: 'dashboard' | 'monitor' | 'knowledge') => void;
  systemStatus: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  systemStatus
}) => {
  return (
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
  );
};
export default Sidebar;
