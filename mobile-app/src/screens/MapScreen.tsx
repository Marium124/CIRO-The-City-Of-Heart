/**
 * Map Screen - Visualize crisis locations and traffic
 * Wrapped in error boundary to prevent app crashes when
 * Google Maps API key is missing or maps fail to load.
 */

import React, {useState, useEffect, Component, ErrorInfo, ReactNode} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { Theme } from '../theme';
import { CONFIG } from '../config';
import axios from 'axios';

const { width } = Dimensions.get('window');

// ── Error Boundary ──────────────────────────────────────────────────────
// Catches native crashes from MapView (e.g. missing Google Maps API key)

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class MapErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('MapView crash caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <MapFallback error={this.state.error?.message} />;
    }
    return this.props.children;
  }
}

// ── Fallback UI ─────────────────────────────────────────────────────────
// Shown when MapView fails to render (no API key, network error, etc.)

function MapFallback({ error }: { error?: string }) {
  return (
    <View style={styles.fallbackContainer}>
      <View style={styles.fallbackCard}>
        <View style={styles.fallbackIconCircle}>
          <Icon name="map" size={48} color={Theme.colors.primary} />
        </View>
        <Text style={styles.fallbackTitle}>Map Unavailable</Text>
        <Text style={styles.fallbackMessage}>
          Google Maps could not be loaded on this device. Crisis data is still available in the Crises tab.
        </Text>
        {error && (
          <View style={styles.errorBox}>
            <Icon name="info-outline" size={14} color={Theme.colors.textSecondary} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ── Crisis Marker Interface ─────────────────────────────────────────────

interface CrisisMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  location: string;
  severity: string;
  inactionRadius: number;
  responseRadius: number;
}

// ── Map Content ─────────────────────────────────────────────────────────
// Lazy-loads react-native-maps to catch import-level crashes

function MapContent() {
  const [visionMode, setVisionMode] = useState<'response' | 'inaction'>('response');
  const [crisisMarkers, setCrisisMarkers] = useState<CrisisMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [hasCentered, setHasCentered] = useState(false);
  const [region, setRegion] = useState({
    latitude: 30.3753, // Center of Pakistan
    longitude: 69.3451,
    latitudeDelta: 12.0,
    longitudeDelta: 12.0,
  });

  // Lazy import react-native-maps to catch native module errors
  const [MapModule, setMapModule] = useState<any>(null);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const maps = require('react-native-maps');
      setMapModule(maps);
      setMapReady(true);
    } catch (e: any) {
      console.error('Failed to load react-native-maps:', e);
      setMapLoadError(e.message || 'Maps module not available');
      setMapReady(true);
    }
  }, []);

  useEffect(() => {
    fetchCrises();
    const interval = setInterval(fetchCrises, CONFIG.REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const fetchCrises = async () => {
    try {
      const response = await axios.get(`${CONFIG.API_BASE_URL}/crises/active`);
      const activeCrises = response.data.crises || [];
      
      const markers = activeCrises.map((c: any) => ({
        id: c.crisis_id,
        latitude: c.latitude || 33.6844,
        longitude: c.longitude || 73.0479,
        title: (c.crisis_type || 'unknown_crisis').replace(/_/g, ' ').toUpperCase(),
        location: c.location || 'Unknown Location',
        severity: c.severity || 'low',
        inactionRadius: c.severity === 'critical' ? 5000 : 3000,
        responseRadius: c.severity === 'critical' ? 1000 : 500,
      }));
      
      setCrisisMarkers(markers);
      
      if (markers.length > 0 && !hasCentered) {
        setRegion({
          latitude: markers[0].latitude,
          longitude: markers[0].longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        });
        setHasCentered(true);
      }
    } catch (error) {
      console.error('Error fetching crises for map:', error);
    } finally {
      setLoading(false);
    }
  };

  const mapStyle = [
    {
      "elementType": "geometry",
      "stylers": [{"color": "#212121"}]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#757575"}]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [{"color": "#212121"}]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [{"color": "#757575"}]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [{"color": "#000000"}]
    }
  ];

  if (!mapReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
        <Text style={styles.loadingText}>Loading Map...</Text>
      </View>
    );
  }

  if (mapLoadError || !MapModule) {
    return <MapFallback error={mapLoadError || 'Maps module not available'} />;
  }

  const MapView = MapModule.default;
  const { Marker, Circle } = MapModule;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        customMapStyle={mapStyle}
        onRegionChangeComplete={setRegion}>
        {crisisMarkers.map(marker => (
          <React.Fragment key={marker.id}>
            <Marker
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              title={marker.title}>
              <View style={[
                styles.markerCircle, 
                {backgroundColor: visionMode === 'response' ? Theme.colors.secondary : Theme.colors.danger}
              ]}>
                <Icon name="warning" size={20} color="#fff" />
              </View>
            </Marker>
            <Circle
              center={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              radius={visionMode === 'response' ? marker.responseRadius : marker.inactionRadius}
              fillColor={visionMode === 'response' ? Theme.colors.secondary + '33' : Theme.colors.danger + '44'}
              strokeColor={visionMode === 'response' ? Theme.colors.secondary : Theme.colors.danger}
              strokeWidth={2}
            />
          </React.Fragment>
        ))}
      </MapView>

      <View style={styles.visionControls}>
        <Text style={styles.visionTitle}>Digital Twin Visualization</Text>
        <View style={styles.sliderTrack}>
          <TouchableOpacity 
            onPress={() => setVisionMode('inaction')}
            style={[styles.sliderOption, visionMode === 'inaction' && styles.sliderActiveInaction]}>
            <Text style={[styles.sliderLabel, visionMode === 'inaction' && styles.activeText]}>Inaction</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setVisionMode('response')}
            style={[styles.sliderOption, visionMode === 'response' && styles.sliderActiveResponse]}>
            <Text style={[styles.sliderLabel, visionMode === 'response' && styles.activeText]}>Agentic Response</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statusPanel}>
        <View style={styles.impactBadge}>
          <Icon name="favorite" size={16} color={Theme.colors.primary} />
          <Text style={styles.impactText}>
            {visionMode === 'response' ? 'Est. 1.2k Lives Protected' : 'High Risk to Vulnerable Groups'}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ── Exported Screen ─────────────────────────────────────────────────────

export default function MapScreen() {
  return (
    <MapErrorBoundary>
      <MapContent />
    </MapErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  map: {
    flex: 1,
  },
  markerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  visionControls: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: Theme.colors.surface,
    padding: 15,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
    alignItems: 'center',
  },
  visionTitle: {
    color: Theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    opacity: 0.6,
  },
  sliderTrack: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.md,
    padding: 4,
    width: '100%',
  },
  sliderOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Theme.borderRadius.sm,
  },
  sliderActiveInaction: {
    backgroundColor: Theme.colors.danger,
  },
  sliderActiveResponse: {
    backgroundColor: Theme.colors.secondary,
  },
  sliderLabel: {
    color: Theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  activeText: {
    color: '#fff',
  },
  statusPanel: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  impactBadge: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
  },
  impactText: {
    color: Theme.colors.text,
    marginLeft: 10,
    fontWeight: '600',
    fontSize: 14,
  },
  // Fallback & loading styles
  fallbackContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  fallbackCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.glassBorder,
    width: '100%',
    maxWidth: 340,
  },
  fallbackIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  fallbackTitle: {
    color: Theme.colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  fallbackMessage: {
    color: Theme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Theme.borderRadius.sm,
  },
  errorText: {
    color: Theme.colors.textSecondary,
    fontSize: 11,
    marginLeft: 6,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Theme.colors.textSecondary,
    marginTop: 12,
    fontSize: 14,
  },
});
