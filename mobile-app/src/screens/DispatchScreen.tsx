/**
 * Dispatch Screen - Live authority alert feed
 * Shows which emergency services were contacted, when, and how
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import axios from 'axios';
import { Theme } from '../theme';
import { CONFIG } from '../config';

const API_BASE_URL = CONFIG.API_BASE_URL;

interface DispatchAlert {
  id: number;
  crisis_id: string;
  crisis_type: string;
  location: string;
  severity: string;
  authority_name: string;
  authority_phone: string;
  dispatch_method: string;
  status: string;
  real_sms_sent: boolean;
  message_preview: string;
  dispatched_at: string;
}

interface DispatchSummary {
  total_dispatches: number;
  real_sms_sent: number;
  simulated: number;
  authorities_in_registry: number;
}

const AUTHORITY_ICONS: Record<string, string> = {
  fire_brigade: 'local-fire-department',
  traffic_police: 'local-police',
  ndma: 'account-balance',
  edhi_foundation: 'medical-services',
  rescue_medical: 'local-hospital',
  water_board: 'water',
  civil_defence: 'shield',
  city_admin: 'location-city',
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#FF3B30',
  high: '#FF9500',
  medium: '#FFCC00',
  low: '#34C759',
};

export default function DispatchScreen() {
  const [alerts, setAlerts] = useState<DispatchAlert[]>([]);
  const [summary, setSummary] = useState<DispatchSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, CONFIG.REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [alertsRes, summaryRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/dispatch/alerts?limit=30`),
        axios.get(`${API_BASE_URL}/dispatch/summary`),
      ]);
      setAlerts(alertsRes.data.alerts || []);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching dispatch data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getStatusStyle = (status: string, realSent: boolean) => {
    if (realSent) return { bg: '#0A3D1F', border: '#34C759', text: '#34C759', label: '✓ SMS Sent' };
    if (status === 'simulated') return { bg: '#1A1A2E', border: '#5E5CE6', text: '#5E5CE6', label: '⬡ Automated Route' };
    if (status === 'failed') return { bg: '#3D0A0A', border: '#FF3B30', text: '#FF3B30', label: '✗ Failed' };
    return { bg: '#1A1A2E', border: '#888', text: '#888', label: status };
  };

  const formatTime = (iso: string) => {
    if (!iso) return 'Unknown Time';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? 'Unknown Time' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatCrisisType = (type: string) =>
    (type || 'Unknown').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
        <Text style={styles.loadingText}>Loading Dispatch Feed...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Authority Dispatch</Text>
          <Text style={styles.headerSubtitle}>Live Emergency Alerts</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Summary Stats */}
      {summary && (
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{summary.total_dispatches}</Text>
            <Text style={styles.statLabel}>Total Alerts</Text>
          </View>
          <View style={[styles.statCard, { borderColor: '#34C759' }]}>
            <Text style={[styles.statValue, { color: '#34C759' }]}>{summary.real_sms_sent}</Text>
            <Text style={styles.statLabel}>SMS Sent</Text>
          </View>
          <View style={[styles.statCard, { borderColor: '#5E5CE6' }]}>
            <Text style={[styles.statValue, { color: '#5E5CE6' }]}>{summary.simulated}</Text>
            <Text style={styles.statLabel}>Automated Route</Text>
          </View>
          <View style={[styles.statCard, { borderColor: Theme.colors.accent }]}>
            <Text style={[styles.statValue, { color: Theme.colors.accent }]}>{summary.authorities_in_registry}</Text>
            <Text style={styles.statLabel}>Authorities</Text>
          </View>
        </View>
      )}

      {/* Alerts Feed */}
      <Text style={styles.sectionTitle}>📡 Dispatch Log</Text>

      {alerts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="notifications-off" size={56} color={Theme.colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Dispatches Yet</Text>
          <Text style={styles.emptyText}>
            When a crisis is detected, CIRO will automatically alert the relevant authorities here.
          </Text>
        </View>
      ) : (
        alerts.map(alert => {
          const statusStyle = getStatusStyle(alert.status, alert.real_sms_sent);
          const severityColor = SEVERITY_COLORS[alert.severity] || '#888';
          const iconName = (AUTHORITY_ICONS[(alert.authority_name || '').toLowerCase().replace(/ /g, '_')] || 'notifications') as any;

          return (
            <View key={alert.id} style={[styles.alertCard, { borderLeftColor: severityColor }]}>
              {/* Top Row */}
              <View style={styles.alertHeader}>
                <View style={[styles.authorityIcon, { backgroundColor: severityColor + '22' }]}>
                  <Icon name="notifications-active" size={22} color={severityColor} />
                </View>
                <View style={styles.alertInfo}>
                  <Text style={styles.authorityName}>{alert.authority_name}</Text>
                  <Text style={styles.crisisType}>{formatCrisisType(alert.crisis_type)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
                  <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
                </View>
              </View>

              {/* Details */}
              <View style={styles.alertDetails}>
                <View style={styles.detailRow}>
                  <Icon name="location-on" size={14} color={Theme.colors.textSecondary} />
                  <Text style={styles.detailText}>{alert.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="schedule" size={14} color={Theme.colors.textSecondary} />
                  <Text style={styles.detailText}>{formatTime(alert.dispatched_at)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="phone" size={14} color={Theme.colors.textSecondary} />
                  <Text style={styles.detailText}>
                    {alert.authority_phone !== 'NOT_CONFIGURED' ? alert.authority_phone : 'Configure in .env'}
                  </Text>
                </View>
              </View>

              {/* Message Preview */}
              {alert.message_preview ? (
                <View style={styles.messageBox}>
                  <Text style={styles.messageText} numberOfLines={2}>{alert.message_preview}</Text>
                </View>
              ) : null}

              {/* Severity Tag */}
              <View style={[styles.severityTag, { backgroundColor: severityColor + '22' }]}>
                <View style={[styles.severityDot, { backgroundColor: severityColor }]} />
                <Text style={[styles.severityText, { color: severityColor }]}>
                  {alert.severity.toUpperCase()} SEVERITY
                </Text>
              </View>
            </View>
          );
        })
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.background },
  loadingText: { marginTop: 14, color: Theme.colors.textSecondary, fontSize: 15 },
  header: {
    padding: 28, paddingTop: 56, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { fontSize: 28, fontWeight: '900', color: Theme.colors.text, letterSpacing: 1 },
  headerSubtitle: { fontSize: 13, color: Theme.colors.primary, fontWeight: '600', marginTop: 2, textTransform: 'uppercase' },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FF3B3022', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#FF3B30',
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3B30' },
  liveText: { color: '#FF3B30', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: Theme.colors.surface, borderRadius: 12,
    padding: 12, alignItems: 'center', borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: Theme.colors.text },
  statLabel: { fontSize: 10, color: Theme.colors.textSecondary, marginTop: 2, textAlign: 'center' },
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: Theme.colors.text,
    paddingHorizontal: 20, marginBottom: 12, opacity: 0.6,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  emptyContainer: { alignItems: 'center', padding: 50 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Theme.colors.text, marginTop: 16 },
  emptyText: { fontSize: 14, color: Theme.colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  alertCard: {
    backgroundColor: Theme.colors.surface, marginHorizontal: 16,
    marginBottom: 12, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Theme.colors.glassBorder,
    borderLeftWidth: 4,
  },
  alertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  authorityIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  alertInfo: { flex: 1, marginLeft: 12 },
  authorityName: { fontSize: 15, fontWeight: '700', color: Theme.colors.text },
  crisisType: { fontSize: 12, color: Theme.colors.textSecondary, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    borderWidth: 1,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  alertDetails: { gap: 6, marginBottom: 10 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 13, color: Theme.colors.textSecondary },
  messageBox: {
    backgroundColor: Theme.colors.background, borderRadius: 8,
    padding: 10, marginBottom: 10,
  },
  messageText: { fontSize: 12, color: Theme.colors.textSecondary, fontFamily: 'monospace', lineHeight: 18 },
  severityTag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  severityDot: { width: 6, height: 6, borderRadius: 3 },
  severityText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
});
