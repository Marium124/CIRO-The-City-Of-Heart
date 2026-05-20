import { ShieldAlert, LayoutDashboard, Activity, Database, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface SidebarProps {
  currentTab: 'dashboard' | 'monitor' | 'knowledge';
  setCurrentTab: (tab: 'dashboard' | 'monitor' | 'knowledge') => void;
  systemStatus: string;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const NAV_ITEMS = [
  { id: 'dashboard' as const, label: 'Dashboard',      icon: LayoutDashboard },
  { id: 'monitor'   as const, label: 'Agent Monitor',  icon: Activity },
  { id: 'knowledge' as const, label: 'Knowledge Base', icon: Database },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  systemStatus,
  collapsed,
  setCollapsed
}) => {
  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-top">
        <div className="logo" onClick={() => setCollapsed(!collapsed)} style={{ cursor: 'pointer' }}>
          <ShieldAlert size={collapsed ? 26 : 32} />
          {!collapsed && <span>CIRO System</span>}
        </div>

        {/* Collapse Toggle */}
        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="nav-links">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button 
              key={item.id}
              onClick={() => setCurrentTab(item.id)} 
              className={`nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Status Footer */}
      <div className="sidebar-footer">
        <div className={`sidebar-status ${collapsed ? 'sidebar-status-collapsed' : ''}`}>
          <div className="pulse" style={{ 
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
            backgroundColor: systemStatus === 'Operational' ? 'var(--success)' : 'var(--danger)' 
          }} />
          {!collapsed && <span>System: {systemStatus}</span>}
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
