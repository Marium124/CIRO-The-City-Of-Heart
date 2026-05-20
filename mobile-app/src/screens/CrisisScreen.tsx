/**
 * Crisis Screen - View detected crises and their status
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import axios from 'axios';
import { CONFIG } from '../config';

const API_BASE_URL = CONFIG.API_BASE_URL;

interface Crisis {
  crisis_id: string;
  crisis_type: string;
  location: string;
  severity: string;
  confidence: number;
  status: string;
  description: string;
  detected_at: string;
  dispatched_authorities?: {
    authority_name: string;
    authority_phone: string;
    dispatch_method: string;
    status: string;
    real_sms_sent: boolean;
    dispatched_at: string;
  }[];
}

const DEMO_CRISES: Crisis[] = [
  {
    crisis_id: 'EVT-20260520-001',
    crisis_type: 'urban_flooding',
    location: 'Clifton, Karachi',
    severity: 'critical',
    confidence: 0.94,
    status: 'active',
    description: 'Multi-source signal fusion: 12 citizen SOS reports + weather station rainfall 95mm/hr + traffic camera congestion 92%. Water levels rising rapidly in low-lying sectors.',
    detected_at: '2026-05-20T09:30:00.000Z',
    dispatched_authorities: [
      { authority_name: 'NDMA Karachi', authority_phone: '1700', dispatch_method: 'twilio_sms', status: 'sent', real_sms_sent: true, dispatched_at: '2026-05-20T09:31:00.000Z' },
      { authority_name: 'WASA / Water Board', authority_phone: '1334', dispatch_method: 'simulated', status: 'executed', real_sms_sent: false, dispatched_at: '2026-05-20T09:32:00.000Z' },
    ]
  },
  {
    crisis_id: 'EVT-20260520-002',
    crisis_type: 'fire_emergency',
    location: 'Saddar, Karachi',
    severity: 'high',
    confidence: 0.87,
    status: 'active',
    description: 'Fire reported near commercial district. 4 citizen reports confirmed by traffic camera anomaly detection. Smoke plume detected.',
    detected_at: '2026-05-20T09:15:00.000Z',
    dispatched_authorities: [
      { authority_name: 'Fire Brigade / Rescue 1122', authority_phone: '1122', dispatch_method: 'twilio_sms', status: 'sent', real_sms_sent: true, dispatched_at: '2026-05-20T09:16:00.000Z' },
      { authority_name: 'Edhi Foundation Rescue', authority_phone: '115', dispatch_method: 'simulated', status: 'executed', real_sms_sent: false, dispatched_at: '2026-05-20T09:17:00.000Z' },
    ]
  },
  {
    crisis_id: 'EVT-20260520-003',
    crisis_type: 'traffic_gridlock',
    location: 'G-10, Islamabad',
    severity: 'medium',
    confidence: 0.76,
    status: 'active',
    description: 'Severe traffic congestion reported. Average speed dropped to 5 km/h. Possible road blockage or accident detected via camera feed.',
    detected_at: '2026-05-20T08:50:00.000Z',
    dispatched_authorities: [
      { authority_name: 'Traffic Police', authority_phone: '15', dispatch_method: 'simulated', status: 'executed', real_sms_sent: false, dispatched_at: '2026-05-20T08:51:00.000Z' },
    ]
  },
  {
    crisis_id: 'EVT-20260520-004',
    crisis_type: 'structural_collapse',
    location: 'Lyari, Karachi',
    severity: 'critical',
    confidence: 0.91,
    status: 'active',
    description: 'Building collapse reported in Lyari. Multiple SOS signals from surrounding area. Rescue teams and ambulances dispatched immediately.',
    detected_at: '2026-05-20T09:35:00.000Z',
    dispatched_authorities: [
      { authority_name: 'Civil Defence', authority_phone: '1122', dispatch_method: 'twilio_sms', status: 'sent', real_sms_sent: true, dispatched_at: '2026-05-20T09:36:00.000Z' },
      { authority_name: 'Edhi Foundation Rescue', authority_phone: '115', dispatch_method: 'twilio_sms', status: 'sent', real_sms_sent: true, dispatched_at: '2026-05-20T09:36:00.000Z' },
      { authority_name: 'Emergency Medical Services', authority_phone: '1122', dispatch_method: 'simulated', status: 'executed', real_sms_sent: false, dispatched_at: '2026-05-20T09:37:00.000Z' },
    ]
  },
];

export default function CrisisScreen() {
  const [crises, setCrises] = useState<Crisis[]>(DEMO_CRISES);
  const [loading, setLoading] = useState(true);
  const [selectedCrisis, setSelectedCrisis] = useState<Crisis | null>(null);

  const fetchCrises = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/crises/active`);
      const fetchedCrises = response.data.crises || [];
      
      // Merge real backend crises on top of demo data
      const realIds = new Set(fetchedCrises.map((c: Crisis) => c.crisis_id));
      const demoFiltered = DEMO_CRISES.filter(d => !realIds.has(d.crisis_id));
      const merged = [...fetchedCrises, ...demoFiltered];
      merged.sort((a: Crisis, b: Crisis) =>
        new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime()
      );
      setCrises(merged);
    } catch (_e) {
      // Keep existing data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrises();
    const interval = setInterval(fetchCrises, 10000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#f44336';
      case 'high':
        return '#FF9800';
      case 'medium':
        return '#FFC107';
      default:
        return '#4CAF50';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'check-circle';
    }
  };

  const formatCrisisType = (type: string) => {
    return (type || 'Unknown').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e91e63" />
        <Text style={styles.loadingText}>Loading Crises...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Crises</Text>
        <Text style={styles.headerSubtitle}>
          {crises.length} active situation{crises.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {crises.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="check-circle" size={64} color="#4CAF50" />
          <Text style={styles.emptyTitle}>No Active Crises</Text>
          <Text style={styles.emptyText}>
            All systems normal. No crisis situations detected.
          </Text>
        </View>
      ) : (
        crises.map(crisis => (
          <TouchableOpacity
            key={crisis.crisis_id}
            style={styles.crisisCard}
            onPress={() => setSelectedCrisis(crisis)}>
            <View style={styles.crisisHeader}>
              <View
                style={[
                  styles.severityBadge,
                  {backgroundColor: getSeverityColor(crisis.severity)},
                ]}>
                <Icon
                  name={getSeverityIcon(crisis.severity)}
                  size={24}
                  color="#fff"
                />
              </View>
              <View style={styles.crisisTitleContainer}>
                <Text style={styles.crisisType}>
                  {formatCrisisType(crisis.crisis_type)}
                </Text>
                <Text style={styles.crisisLocation}>{crisis.location}</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#999" />
            </View>

            <View style={styles.crisisDetails}>
              <View style={styles.detailItem}>
                <Icon name="timeline" size={16} color="#666" />
                <Text style={styles.detailLabel}>Confidence</Text>
                <Text style={styles.detailValue}>
                  {(crisis.confidence * 100).toFixed(0)}%
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Icon name="schedule" size={16} color="#666" />
                <Text style={styles.detailLabel}>Detected</Text>
                <Text style={styles.detailValue}>
                  {crisis.detected_at && !isNaN(new Date(crisis.detected_at).getTime()) 
                    ? new Date(crisis.detected_at).toLocaleTimeString() 
                    : 'Unknown Time'}
                </Text>
              </View>
            </View>

            <Text style={styles.crisisDescription} numberOfLines={2}>
              {crisis.description}
            </Text>

            {crisis.dispatched_authorities && crisis.dispatched_authorities.length > 0 && (
              <View style={styles.dispatchSection}>
                <Text style={styles.dispatchTitle}>Dispatched Authorities:</Text>
                {crisis.dispatched_authorities.map((auth, index) => (
                  <View key={index} style={styles.dispatchItem}>
                    <Icon name="check-circle" size={14} color="#4CAF50" />
                    <Text style={styles.dispatchText}>
                      <Text style={styles.dispatchName}>{auth.authority_name}</Text>
                      {' '}via {auth.dispatch_method === 'twilio_sms' ? 'Twilio SMS' : 'Automated Route'} 
                      {' '}({auth.status === 'sent' ? 'Sent' : 'Executed'})
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.crisisFooter}>
              <View style={[styles.statusBadge, styles.statusActive]}>
                <Text style={styles.statusText}>{crisis.status}</Text>
              </View>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => {
                  Alert.alert(
                    `${crisis.crisis_type.toUpperCase()} - ${crisis.location}`,
                    `Severity: ${crisis.severity.toUpperCase()}\nConfidence: ${(crisis.confidence * 100).toFixed(0)}%\n\nDescription: ${crisis.description}\n\nTime: ${new Date(crisis.detected_at).toLocaleString()}`
                  );
                }}
              >
                <Text style={styles.actionButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))
      )}

      <TouchableOpacity style={styles.refreshButton} onPress={fetchCrises}>
        <Icon name="refresh" size={20} color="#e91e63" />
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#e91e63',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  crisisCard: {
    backgroundColor: '#fff',
    margin: 15,
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  crisisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  severityBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crisisTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  crisisType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  crisisLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  crisisDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 5,
  },
  crisisDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  crisisFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#E8F5E9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  actionButton: {
    backgroundColor: '#e91e63',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  refreshButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e91e63',
  },
  refreshButtonText: {
    color: '#e91e63',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  dispatchSection: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  dispatchTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dispatchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  dispatchText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  dispatchName: {
    fontWeight: 'bold',
    color: '#333',
  },
});
