import React from 'react';
import { Search, Building, Shield, AlertTriangle, HeartPulse, Phone, Info, Copy, RefreshCcw } from 'lucide-react';
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
  // Filtered contacts
  const filteredContactsList = Object.entries(contacts).filter(([key, contact]: [string, any]) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          contact.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Fallback if backend JSON is missing the category attribute
    const contactCategory = contact.category || (FALLBACK_CONTACTS as any)[key]?.category || 'emergency';
    const matchesCategory = categoryFilter === 'all' || contactCategory === categoryFilter;
    
    // Check if the contact has numbers for the selected city or defaults
    const hasCity = cityFilter === 'All Cities' || contact.numbers[cityFilter] !== undefined;
    
    return matchesSearch && matchesCategory && hasCity;
  });

  return (
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
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 className="kb-sidebar-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem' }}>📍</span> Operational Region
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {['All Cities', 'Islamabad', 'Karachi', 'Lahore', 'Peshawar', 'Quetta'].map(city => (
                <button
                  key={city}
                  onClick={() => setCityFilter(city)}
                  style={{
                    background: cityFilter === city ? 'var(--primary)' : 'rgba(255,255,255,0.02)',
                    color: cityFilter === city ? 'white' : 'var(--text-muted)',
                    border: `1px solid ${cityFilter === city ? 'var(--primary)' : 'var(--border)'}`,
                    padding: '0.6rem 0.5rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.8rem',
                    fontWeight: cityFilter === city ? 'bold' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{CITY_ICONS[city]}</span>
                  {city}
                </button>
              ))}
            </div>
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
