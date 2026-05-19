import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import axios from 'axios';
import { Theme } from '../theme';
import { CONFIG } from '../config';

const API_BASE_URL = CONFIG.API_BASE_URL;

export default function ReportScreen() {
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!location || !description) {
      Alert.alert('Incomplete Report', 'Please provide both location and description.');
      return;
    }

    setSubmitting(true);
    try {
      // Use the ingestion endpoint which triggers the full agentic cycle
      const payload = {
        social_media: [{
          platform: 'mobile_app',
          text: `${description} at ${location}`,
          location: location,
          timestamp: new Date().toISOString(),
        }],
        weather: [],
        traffic: []
      };

      await axios.post(`${API_BASE_URL}/signals/ingest`, payload);

      Alert.alert(
        'Report Transmitted',
        'Your signal has been ingested by CIRO. Agents are now analyzing the humanitarian impact.',
        [{text: 'OK', onPress: () => {
          setLocation('');
          setDescription('');
        }}]
      );
    } catch (error) {
      console.error('Report submission error:', error);
      Alert.alert('System Error', 'Failed to transmit report. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Incident Report</Text>
        <Text style={styles.headerSubtitle}>Secure Humanitarian Channel</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Location / City</Text>
        <View style={styles.inputWrapper}>
          <Icon name="location-on" size={20} color={Theme.colors.primary} />
          <TextInput
            style={styles.input}
            placeholder="e.g. Orangi Town, Karachi"
            placeholderTextColor={Theme.colors.textSecondary}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <Text style={styles.label}>Description of Crisis</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe what is happening (e.g. rising water levels, heat exhaustion)..."
          placeholderTextColor={Theme.colors.textSecondary}
          multiline
          numberOfLines={6}
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity 
          style={[styles.submitButton, submitting && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.submitText}>Transmit to CIRO</Text>
              <Icon name="send" size={20} color="#fff" style={{marginLeft: 10}} />
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.ethicalNote}>
        <Icon name="verified" size={20} color={Theme.colors.success} />
        <Text style={styles.ethicalText}>
          Your data is processed using Ethical AI protocols prioritizing life-safety over infrastructure.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    padding: 30,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Theme.colors.text,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Theme.colors.primary,
    marginTop: 5,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 10,
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 10,
    color: Theme.colors.text,
    fontSize: 16,
  },
  textArea: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
    height: 140,
    textAlignVertical: 'top',
    marginBottom: 30,
    padding: 15,
  },
  submitButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 20,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: Theme.colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  ethicalNote: {
    flexDirection: 'row',
    padding: 25,
    alignItems: 'center',
    opacity: 0.7,
  },
  ethicalText: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
});
