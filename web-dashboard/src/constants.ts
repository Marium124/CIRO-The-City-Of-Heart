export const FALLBACK_CONTACTS: Record<string, any> = {
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

export const AGENT_META: Record<string, any> = {
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

export const AGENT_EMOJIS: Record<string, string> = {
  signal_ingestion: '📡',
  event_detection: '🔍',
  reasoning: '🧠',
  action_planning: '📋',
  dispatch: '🚀',
  simulation: '🔮',
  visualization: '🗺️'
};

export const CITY_ICONS: Record<string, string> = {
  'All Cities': '🌍',
  'Islamabad': '🌲',
  'Karachi': '🚢',
  'Lahore': '🕌',
  'Peshawar': '⛰️',
  'Quetta': '🏔️'
};
