import { useState, useRef, useEffect } from 'react';
import { Search, Building, Shield, AlertTriangle, HeartPulse, Phone, Info, Copy, RefreshCcw, X, MapPin, Filter, CheckCircle2 } from 'lucide-react';
import { CITY_ICONS, FALLBACK_CONTACTS } from '../constants';

interface KnowledgeBaseTabProps {
  contacts: Record<string, any>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cityFilter: string;
  setCityFilter: (city: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  dispatchedSimId: string | null;
  handleCopyNumber: (num: string) => void;
  handleSimulateDispatch: (key: string) => void;
}

const CATEGORY_CONFIG = [
  { id: 'all',       label: 'All Resources',       icon: Building,       color: '#6366f1', bg: 'rgba(99, 102, 241, 0.08)' },
  { id: 'emergency', label: 'Emergency',            icon: Shield,         color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)' },
  { id: 'disaster',  label: 'Disaster (NDMA)',      icon: AlertTriangle,  color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' },
  { id: 'medical',   label: 'Medical & Ambulance',  icon: HeartPulse,     color: '#22c55e', bg: 'rgba(34, 197, 94, 0.08)' },
  { id: 'utilities', label: 'Utilities & Drainage', icon: Phone,          color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)' },
];

const CITIES = ['All Cities', 'Islamabad', 'Karachi', 'Lahore', 'Peshawar', 'Quetta'];

export const KnowledgeBaseTab: React.FC<KnowledgeBaseTabProps> = ({
  contacts,
  searchQuery,
  setSearchQuery,
  cityFilter,
  setCityFilter,
  categoryFilter,
  setCategoryFilter,
  dispatchedSimId,
  handleCopyNumber,
  handleSimulateDispatch
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Count contacts per category for badge numbers
  const categoryCounts: Record<string, number> = { all: Object.keys(contacts).length };
  Object.entries(contacts).forEach(([key, contact]: [string, any]) => {
    const cat = contact.category || (FALLBACK_CONTACTS as any)[key]?.category || 'emergency';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Filtered contacts
  const filteredContactsList = Object.entries(contacts).filter(([key, contact]: [string, any]) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || contact.name.toLowerCase().includes(q) || 
                          contact.description.toLowerCase().includes(q) ||
                          (contact.default || '').includes(q);
    const contactCategory = contact.category || (FALLBACK_CONTACTS as any)[key]?.category || 'emergency';
    const matchesCategory = categoryFilter === 'all' || contactCategory === categoryFilter;
    const hasCity = cityFilter === 'All Cities' || contact.numbers[cityFilter] !== undefined;
    return matchesSearch && matchesCategory && hasCity;
  });

  const activeFiltersCount = (categoryFilter !== 'all' ? 1 : 0) + (cityFilter !== 'All Cities' ? 1 : 0) + (searchQuery ? 1 : 0);

  const clearAllFilters = () => {
    setSearchQuery('');
    setCityFilter('All Cities');
    setCategoryFilter('all');
  };

  const handleCopyWithFeedback = (num: string, key: string) => {
    handleCopyNumber(num);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Keyboard shortcut: Cmd/Ctrl+K to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <header className="header">
        <div>
          <h1>Crisis Response Knowledge Base</h1>
          <p style={{ color: 'var(--text-muted)' }}>Query live emergency contacts, WASA helplines, and dispatch routing intelligence.</p>
        </div>
      </header>

      <div className="kb-layout">
        {/* ─── LEFT: Filter Sidebar ─── */}
        <div className="kb-filter-panel">

          {/* ═══ SEARCH BOX ═══ */}
          <div className="kb-search-section">
            <div className={`kb-search-box ${searchFocused ? 'focused' : ''} ${searchQuery ? 'has-value' : ''}`}>
              <Search className="kb-search-icon" size={18} />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search agencies, helplines..." 
                className="kb-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              {searchQuery && (
                <button className="kb-search-clear" onClick={() => setSearchQuery('')} title="Clear search">
                  <X size={14} />
                </button>
              )}
              <kbd className="kb-search-kbd">⌘K</kbd>
            </div>
          </div>

          {/* ═══ CITY REGION SELECTOR ═══ */}
          <div className="kb-filter-group">
            <h3 className="kb-filter-title">
              <MapPin size={14} />
              <span>Operational Region</span>
            </h3>
            <div className="kb-city-grid">
              {CITIES.map(city => {
                const isActive = cityFilter === city;
                return (
                  <button
                    key={city}
                    onClick={() => setCityFilter(city)}
                    className={`kb-city-chip ${isActive ? 'active' : ''}`}
                  >
                    <span className="kb-city-emoji">{CITY_ICONS[city]}</span>
                    <span className="kb-city-label">{city === 'All Cities' ? 'All' : city}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ═══ RESOURCE CATEGORY SELECTOR ═══ */}
          <div className="kb-filter-group">
            <h3 className="kb-filter-title">
              <Filter size={14} />
              <span>Resource Category</span>
            </h3>
            <div className="kb-category-stack">
              {CATEGORY_CONFIG.map(cat => {
                const IconComp = cat.icon;
                const isActive = categoryFilter === cat.id;
                const count = categoryCounts[cat.id] || 0;
                return (
                  <button 
                    key={cat.id}
                    className={`kb-cat-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setCategoryFilter(cat.id)}
                    style={{
                      '--cat-color': cat.color,
                      '--cat-bg': cat.bg,
                    } as React.CSSProperties}
                  >
                    <div className="kb-cat-btn-left">
                      <div className="kb-cat-icon-wrap">
                        <IconComp size={15} />
                      </div>
                      <span className="kb-cat-label">{cat.label}</span>
                    </div>
                    <span className="kb-cat-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ═══ ACTIVE FILTERS PILL BAR ═══ */}
          {activeFiltersCount > 0 && (
            <div className="kb-active-filters">
              <div className="kb-active-filters-header">
                <span className="kb-active-filters-label">
                  <Filter size={12} />
                  {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
                </span>
                <button className="kb-clear-all-btn" onClick={clearAllFilters}>
                  Clear all
                </button>
              </div>
              <div className="kb-filter-pills">
                {searchQuery && (
                  <span className="kb-filter-pill">
                    <Search size={11} /> "{searchQuery}"
                    <button onClick={() => setSearchQuery('')}><X size={10} /></button>
                  </span>
                )}
                {cityFilter !== 'All Cities' && (
                  <span className="kb-filter-pill">
                    <MapPin size={11} /> {cityFilter}
                    <button onClick={() => setCityFilter('All Cities')}><X size={10} /></button>
                  </span>
                )}
                {categoryFilter !== 'all' && (
                  <span className="kb-filter-pill">
                    <Shield size={11} /> {CATEGORY_CONFIG.find(c => c.id === categoryFilter)?.label}
                    <button onClick={() => setCategoryFilter('all')}><X size={10} /></button>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ═══ SYNC NOTE ═══ */}
          <div className="kb-sync-note">
            <Info size={12} />
            <span>Synced with <code>contacts_registry.json</code></span>
          </div>
        </div>

        {/* ─── RIGHT: Results Grid ─── */}
        <div>
          <div className="kb-results-header">
            <span className="kb-results-count">
              {filteredContactsList.length} {filteredContactsList.length === 1 ? 'agency' : 'agencies'}
            </span>
            {activeFiltersCount > 0 && (
              <span className="kb-results-filtered">filtered</span>
            )}
          </div>

          {filteredContactsList.length === 0 ? (
            <div className="kb-empty-state">
              <Search size={40} />
              <h3>No agencies match your criteria</h3>
              <p>Try broadening your search or removing some filters.</p>
              <button className="kb-empty-reset-btn" onClick={clearAllFilters}>
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="kb-grid">
              {filteredContactsList.map(([key, contact]: [string, any]) => {
                const activeNumber = cityFilter === 'All Cities' ? contact.default : (contact.numbers[cityFilter] || contact.default);
                const isCopied = copiedId === key;
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
                      <div className="kb-number-display">
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                            {cityFilter === 'All Cities' ? 'DEFAULT DIAL' : `${cityFilter} HELPLINE`}
                          </div>
                          <div className="kb-number-val">{activeNumber}</div>
                        </div>
                        <button 
                          onClick={() => handleCopyWithFeedback(activeNumber, key)}
                          className={`kb-copy-btn ${isCopied ? 'copied' : ''}`}
                          title="Copy Helpline"
                        >
                          {isCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleSimulateDispatch(key)}
                          className="btn-primary" 
                          style={{ 
                            width: '100%', 
                            fontSize: '0.95rem', 
                            padding: '0.85rem', 
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            backgroundColor: 
                              contact.category === 'emergency' ? 'var(--danger)' : 
                              contact.category === 'medical' ? 'var(--success)' : 
                              contact.category === 'disaster' ? 'var(--warning)' : 
                              contact.category === 'defence' ? 'var(--accent)' : 'var(--primary)'
                          }}
                          disabled={dispatchedSimId !== null}
                        >
                          {dispatchedSimId === key ? <RefreshCcw className="pulse" size={18} /> : <AlertTriangle size={18} />}
                          Alert Unit
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
  );
};
export default KnowledgeBaseTab;
