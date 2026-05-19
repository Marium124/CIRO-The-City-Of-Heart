/**
 * Home Screen - Dashboard overview
 */

import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import axios from 'axios';
import { Theme } from '../theme';
import { CONFIG } from '../config';

const API_BASE_URL = CONFIG.API_BASE_URL;

interface SystemStatus {
  status: string;
  agents: number;
  active_crises: number;
}

export default function HomeScreen({ navigation }: any) {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchSystemStatus();
    startPulse();
  }, []);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const fetchSystemStatus = async () => {
    try {
      const [healthRes, crisesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/health`),
        axios.get(`${API_BASE_URL}/crises/active`)
      ]);
      
      setSystemStatus({
        status: healthRes.data.status,
        agents: healthRes.data.agent_manager === 'active' ? 6 : 0,
        active_crises: crisesRes.data.count || 0,
      });
    } catch (error) {
      console.error('Error fetching system status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
        <Text style={styles.loadingText}>Synchronizing with City Heart...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>CIRO</Text>
          <Text style={styles.headerSubtitle}>The Heart of the City</Text>
        </View>
        <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Icon name="favorite" size={30} color={Theme.colors.primary} />
        </Animated.View>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Icon name="verified-user" size={24} color={Theme.colors.success} />
          <Text style={styles.statusText}>National Defense Active</Text>
        </View>
        <View style={styles.statusDetails}>
          <View style={styles.statusItem}>
            <Text style={styles.statusValue}>{systemStatus?.agents || 6}</Text>
            <Text style={styles.statusLabel}>Agents</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={[styles.statusValue, {color: Theme.colors.primary}]}>
              {systemStatus?.active_crises || 0}
            </Text>
            <Text style={styles.statusLabel}>Crises</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Humanitarian Operations</Text>
        
        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Report')}>
          <View style={[styles.iconBox, {backgroundColor: Theme.colors.primary + '22'}]}>
            <Icon name="emergency" size={28} color={Theme.colors.primary} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Report Crisis</Text>
            <Text style={styles.actionDescription}>Submit reports for Pakistan-wide detection</Text>
          </View>
          <Icon name="chevron-right" size={24} color={Theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Map')}>
          <View style={[styles.iconBox, {backgroundColor: Theme.colors.secondary + '22'}]}>
            <Icon name="explore" size={28} color={Theme.colors.secondary} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Future Vision</Text>
            <Text style={styles.actionDescription}>Impact prediction & Digital Twin map</Text>
          </View>
          <Icon name="chevron-right" size={24} color={Theme.colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Logs')}>
          <View style={[styles.iconBox, {backgroundColor: Theme.colors.accent + '22'}]}>
            <Icon name="psychology" size={28} color={Theme.colors.accent} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Ethical Traces</Text>
            <Text style={styles.actionDescription}>View humanitarian decision reasoning</Text>
          </View>
          <Icon name="chevron-right" size={24} color={Theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: Theme.colors.textSecondary,
    letterSpacing: 1,
  },
  header: {
    padding: 30,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: Theme.colors.text,
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Theme.colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  pulseCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Theme.colors.primary + '11',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.primary + '33',
  },
  statusCard: {
    backgroundColor: Theme.colors.surface,
    margin: 20,
    padding: 24,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 10,
    color: Theme.colors.success,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    marginTop: 4,
  },
  statusValue: {
    fontSize: 32,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
    marginHorizontal: 25,
    marginBottom: 15,
    opacity: 0.6,
  },
  actionCard: {
    backgroundColor: Theme.colors.surface,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  actionDescription: {
    fontSize: 13,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
});

