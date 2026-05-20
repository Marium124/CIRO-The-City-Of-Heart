/**
 * Home Screen - Dashboard overview (Hyper-Accessible SOS Interface)
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
  Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import axios from 'axios';
import { Theme } from '../theme';
import { CONFIG } from '../config';

const API_BASE_URL = CONFIG.API_BASE_URL;

export default function HomeScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Karachi");
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startPulse();
  }, []);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const triggerSOS = async (crisisName: string, icon: string) => {
    Alert.alert(
      `${icon} SOS CONFIRMATION`,
      `Are you sure you want to trigger a ${crisisName} emergency? This will immediately alert authorities.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'YES, SEND SOS', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Triggers the Agent Pipeline (Ingestion -> Detection -> Dispatch)
              await axios.post(`${API_BASE_URL}/signals/`, {
                source: "mobile_sos_button",
                content: `EMERGENCY SOS: ${crisisName} reported directly via user device. Immediate help required!`,
                location: selectedCity, // Using the visually selected city
                coordinates: { lat: 24.8607, lng: 67.0011 }
              });
              Alert.alert('✅ SOS SENT', 'Authorities have been dispatched. Help is on the way!');
              navigation.navigate('Crises');
            } catch (error) {
              Alert.alert('Error', 'Could not send SOS. Check connection.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>CIRO</Text>
          <Text style={styles.headerSubtitle}>The Heart of the City</Text>
        </View>
        <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={{fontSize: 28}}>🚨</Text>
        </Animated.View>
      </View>

      {/* Visual City Selector */}
      <View style={styles.citySelectorContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cityScroll}>
          {[
            { name: "Karachi", icon: "🚢" },
            { name: "Lahore", icon: "🕌" },
            { name: "Islamabad", icon: "🌲" },
            { name: "Peshawar", icon: "⛰️" },
            { name: "Quetta", icon: "🏔️" },
          ].map(city => (
            <TouchableOpacity 
              key={city.name}
              style={[styles.cityBadge, selectedCity === city.name && styles.cityBadgeActive]}
              onPress={() => setSelectedCity(city.name)}
            >
              <Text style={styles.cityBadgeEmoji}>{city.icon}</Text>
              <Text style={[styles.cityBadgeText, selectedCity === city.name && styles.cityBadgeTextActive]}>{city.name.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Text style={styles.instructionText}>
        TAP EMERGENCY TO SEND SOS
      </Text>

      {/* Grid of Universal Emergency Buttons */}
      <View style={styles.sosGrid}>
        <TouchableOpacity 
          style={[styles.sosButton, { backgroundColor: '#FF3B30' }]}
          onPress={() => triggerSOS('FIRE', '🔥')}
          disabled={loading}
        >
          <Text style={styles.sosEmoji}>🔥</Text>
          <Text style={styles.sosText}>FIRE</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.sosButton, { backgroundColor: '#007AFF' }]}
          onPress={() => triggerSOS('FLOOD', '🌊')}
          disabled={loading}
        >
          <Text style={styles.sosEmoji}>🌊</Text>
          <Text style={styles.sosText}>FLOOD</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.sosButton, { backgroundColor: '#34C759' }]}
          onPress={() => triggerSOS('MEDICAL', '🚑')}
          disabled={loading}
        >
          <Text style={styles.sosEmoji}>🚑</Text>
          <Text style={styles.sosText}>MEDICAL</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.sosButton, { backgroundColor: '#FF9500' }]}
          onPress={() => triggerSOS('EXPLOSION', '💥')}
          disabled={loading}
        >
          <Text style={styles.sosEmoji}>💥</Text>
          <Text style={styles.sosText}>EXPLOSION</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Navigation Buttons for Status & Map */}
      <View style={styles.navGrid}>
        <TouchableOpacity style={styles.navCard} onPress={() => navigation.navigate('Crises')}>
          <View style={[styles.iconBox, {backgroundColor: '#FF3B3022'}]}>
            <Text style={{fontSize: 32}}>⚠️</Text>
          </View>
          <View style={styles.navContent}>
            <Text style={styles.navTitle}>ALERTS</Text>
            <Text style={styles.navSubtitle}>Active Threats</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navCard} onPress={() => navigation.navigate('Map')}>
          <View style={[styles.iconBox, {backgroundColor: '#007AFF22'}]}>
            <Text style={{fontSize: 32}}>🗺️</Text>
          </View>
          <View style={styles.navContent}>
            <Text style={styles.navTitle}>MAP</Text>
            <Text style={styles.navSubtitle}>Safe Routes</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navCard} onPress={() => navigation.navigate('Dispatch')}>
          <View style={[styles.iconBox, {backgroundColor: '#34C75922'}]}>
            <Text style={{fontSize: 32}}>🛡️</Text>
          </View>
          <View style={styles.navContent}>
            <Text style={styles.navTitle}>RESCUE</Text>
            <Text style={styles.navSubtitle}>Tracking Units</Text>
          </View>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Pure dark for high contrast
  },
  header: {
    padding: 25,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  pulseCircle: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: '#FF3B3033',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  instructionText: {
    textAlign: 'center',
    color: '#AAA',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 15,
    marginBottom: 10,
    letterSpacing: 1.5,
  },
  citySelectorContainer: {
    marginTop: 15,
  },
  cityScroll: {
    paddingHorizontal: 15,
    gap: 10,
  },
  cityBadge: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityBadgeActive: {
    backgroundColor: '#007AFF22',
    borderColor: '#007AFF',
  },
  cityBadgeEmoji: {
    fontSize: 22,
    marginRight: 8,
  },
  cityBadgeText: {
    color: '#888',
    fontWeight: '800',
    fontSize: 14,
  },
  cityBadgeTextActive: {
    color: '#007AFF',
  },
  sosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'center',
  },
  sosButton: {
    width: '45%',
    aspectRatio: 1,
    margin: '2.5%',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sosEmoji: {
    fontSize: 64, // Massive emoji
    marginBottom: 10,
  },
  sosText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginHorizontal: 20,
    marginVertical: 20,
  },
  navGrid: {
    paddingHorizontal: 15,
    gap: 15,
    paddingBottom: 40,
  },
  navCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  iconBox: {
    width: 65,
    height: 65,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navContent: {
    marginLeft: 15,
    flex: 1,
  },
  navTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  navSubtitle: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
});
