/**
 * Agent Log Screen - View agent execution traces and logs
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import axios from 'axios';
import { CONFIG } from '../config';

const API_BASE_URL = CONFIG.API_BASE_URL;

interface AgentLog {
  timestamp: string;
  agent: string;
  action: string;
  details: any;
  status: string;
}

export default function AgentLogScreen() {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAgent, setFilterAgent] = useState<string>('all');

  const agents = [
    'signal_ingestion',
    'event_detection',
    'reasoning',
    'action_planning',
    'simulation',
    'visualization',
  ];

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/agents/logs`);
      const mappedLogs = (response.data.logs || []).map((log: any) => ({
        ...log,
        agent: log.agent || log.agent_id || 'unknown_agent',
      }));
      setLogs(mappedLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      // Set demo data for demonstration
      setLogs([
        {
          timestamp: new Date().toISOString(),
          agent: 'signal_ingestion',
          action: 'process',
          details: {input_type: 'social_media'},
          status: 'completed',
        },
        {
          timestamp: new Date(Date.now() - 1000).toISOString(),
          agent: 'event_detection',
          action: 'cluster_detected',
          details: {location: 'G-10', count: 3},
          status: 'completed',
        },
        {
          timestamp: new Date(Date.now() - 2000).toISOString(),
          agent: 'reasoning',
          action: 'reasoning_complete',
          details: {crisis_detected: true, confidence: 0.92},
          status: 'completed',
        },
        {
          timestamp: new Date(Date.now() - 3000).toISOString(),
          agent: 'action_planning',
          action: 'plan_generated',
          details: {actions_count: 4},
          status: 'completed',
        },
        {
          timestamp: new Date(Date.now() - 4000).toISOString(),
          agent: 'simulation',
          action: 'simulation_complete',
          details: {executed: 5, failed: 0},
          status: 'completed',
        },
        {
          timestamp: new Date(Date.now() - 5000).toISOString(),
          agent: 'visualization',
          action: 'visualization_complete',
          details: {},
          status: 'completed',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = filterAgent === 'all' 
    ? logs 
    : logs.filter(log => log.agent === filterAgent);

  const getAgentIcon = (agent: string) => {
    const icons: {[key: string]: string} = {
      signal_ingestion: 'input',
      event_detection: 'search',
      reasoning: 'psychology',
      action_planning: 'assignment',
      simulation: 'play-circle',
      visualization: 'bar-chart',
    };
    return icons[agent] || 'smart_toy';
  };

  const getAgentColor = (agent: string) => {
    const colors: {[key: string]: string} = {
      signal_ingestion: '#2196F3',
      event_detection: '#9C27B0',
      reasoning: '#FF9800',
      action_planning: '#4CAF50',
      simulation: '#E91E63',
      visualization: '#00BCD4',
    };
    return colors[agent] || '#666';
  };

  const formatAgentName = (agent: string) => {
    return (agent || 'Unknown').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'Unknown Time';
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? 'Unknown Time' : date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e91e63" />
        <Text style={styles.loadingText}>Loading Agent Logs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agent Logs</Text>
        <Text style={styles.headerSubtitle}>
          Multi-agent execution traces
        </Text>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              filterAgent === 'all' && styles.filterChipActive,
            ]}
            onPress={() => setFilterAgent('all')}>
            <Text
              style={[
                styles.filterChipText,
                filterAgent === 'all' && styles.filterChipTextActive,
              ]}>
              All Agents
            </Text>
          </TouchableOpacity>
          {agents.map(agent => (
            <TouchableOpacity
              key={agent}
              style={[
                styles.filterChip,
                filterAgent === agent && styles.filterChipActive,
              ]}
              onPress={() => setFilterAgent(agent)}>
              <Icon
                name={getAgentIcon(agent) as any}
                size={16}
                color={filterAgent === agent ? '#fff' : getAgentColor(agent)}
              />
              <Text
                style={[
                  styles.filterChipText,
                  filterAgent === agent && styles.filterChipTextActive,
                ]}>
                {formatAgentName(agent)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.logsContainer}>
        {filteredLogs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="history" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Logs Found</Text>
            <Text style={styles.emptyText}>
              No agent logs available for the selected filter.
            </Text>
          </View>
        ) : (
          filteredLogs.map((log, index) => (
            <View key={index} style={styles.logCard}>
              <View style={styles.logHeader}>
                <View
                  style={[
                    styles.agentBadge,
                    {backgroundColor: getAgentColor(log.agent)},
                  ]}>
                  <Icon name={getAgentIcon(log.agent) as any} size={20} color="#fff" />
                </View>
                <View style={styles.logTitleContainer}>
                  <Text style={styles.logAgent}>{formatAgentName(log.agent)}</Text>
                  <Text style={styles.logAction}>{log.action}</Text>
                </View>
                <Text style={styles.logTimestamp}>{formatTimestamp(log.timestamp)}</Text>
              </View>

              <View style={styles.logDetails}>
                <Text style={styles.logDetailsLabel}>Details:</Text>
                <Text style={styles.logDetailsText}>
                  {JSON.stringify(log.details, null, 2)}
                </Text>
              </View>

              <View style={styles.logFooter}>
                <View style={[styles.statusBadge, styles.statusCompleted]}>
                  <Icon name="check-circle" size={12} color="#4CAF50" />
                  <Text style={styles.statusText}>{log.status}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity style={styles.refreshButton} onPress={fetchLogs}>
        <Icon name="refresh" size={20} color="#e91e63" />
        <Text style={styles.refreshButtonText}>Refresh Logs</Text>
      </TouchableOpacity>
    </View>
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
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterChipActive: {
    backgroundColor: '#e91e63',
    borderColor: '#e91e63',
  },
  filterChipText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  logsContainer: {
    flex: 1,
    padding: 15,
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
  logCard: {
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 15,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  agentBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  logAgent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  logAction: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  logTimestamp: {
    fontSize: 12,
    color: '#999',
  },
  logDetails: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  logDetailsLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  logDetailsText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
  logFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
  },
  statusCompleted: {
    backgroundColor: '#E8F5E9',
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
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
});
