const API_BASE = 'http://localhost:8000/api';

export interface AgentStatus {
  [key: string]: string;
}

export interface Trace {
  agent_id: string;
  timestamp: string;
  action: string;
  details: any;
  status: string;
}

export const fetchHealth = async () => {
  const res = await fetch(`${API_BASE.replace('/api', '')}/health`);
  return res.json();
};

export const fetchAgentStatus = async () => {
  const res = await fetch(`${API_BASE}/agents/status`);
  return res.json();
};

export const fetchTraces = async () => {
  // In a real scenario, we'd have a trace endpoint
  // For now, we'll fetch logs or generic traces
  const res = await fetch(`${API_BASE}/agents/logs`);
  return res.json();
};

export const fetchActiveCrises = async () => {
  const res = await fetch(`${API_BASE}/crises/active`);
  return res.json();
};

export const fetchContacts = async () => {
  const res = await fetch(`${API_BASE}/agents/contacts`);
  return res.json();
};


export const triggerDemoWorkflow = async () => {
  // We'll use the ingest endpoint to trigger the demo
  const res = await fetch(`${API_BASE}/signals/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      social_media: [
        { platform: 'twitter', text: 'Flash flood happening at G-10 for past 30 mins' }
      ],
      weather: [
        { location: 'G-10', temperature: 24, rainfall: 55, condition: 'heavy_rain' }
      ],
      traffic: [
        { location: 'G-10', congestion_level: 'severe', congestion_percentage: 250, average_speed: 15, incident_reported: true }
      ]
    })
  });
  return res.json();
};
