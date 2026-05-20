const API_BASE = 'http://localhost:8000/api';
const API_KEY = 'ciro-secret-key-2026';

const secureFetch = async (url: string, options: RequestInit = {}) => {
  const headers = {
    ...options.headers,
    'X-API-Key': API_KEY
  };
  return fetch(url, { ...options, headers });
};

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
  const res = await secureFetch(`${API_BASE.replace('/api', '')}/health`);
  return res.json();
};

export const fetchAgentStatus = async () => {
  const res = await secureFetch(`${API_BASE}/agents/status`);
  return res.json();
};

export const fetchTraces = async () => {
  const res = await secureFetch(`${API_BASE}/agents/logs`);
  return res.json();
};

export const fetchActiveCrises = async () => {
  const res = await secureFetch(`${API_BASE}/crises/active`);
  return res.json();
};

export const fetchContacts = async () => {
  const res = await secureFetch(`${API_BASE}/agents/contacts`);
  return res.json();
};

export const triggerDemoWorkflow = async () => {
  const res = await secureFetch(`${API_BASE}/signals/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      social_media: [
        { platform: 'twitter', text: 'Flash flood happening at G-10 for past 30 mins, roads completely submerged', location: 'G-10' },
        { platform: 'twitter', text: 'Flooding in G-10 Islamabad, water entering homes, need rescue boats urgently', location: 'G-10' },
        { platform: 'facebook', text: 'G-10 flood situation critical, children stranded on rooftops, please send help', location: 'G-10' },
        { platform: 'whatsapp', text: 'SOS: massive water logging G-10 sector, all vehicles stuck, ambulance cannot pass', location: 'G-10' },
        { platform: 'citizen_report', text: 'G-10 Islamabad flooded, power outage in entire sector, elderly trapped', location: 'G-10' }
      ],
      weather: [
        { location: 'G-10', temperature: 22, rainfall: 95, condition: 'Heavy Thunderstorm' }
      ],
      traffic: [
        { location: 'G-10', congestion_level: 'critical', congestion_percentage: 98, average_speed: 2, incident_reported: true }
      ]
    })
  });
  return res.json();
};
