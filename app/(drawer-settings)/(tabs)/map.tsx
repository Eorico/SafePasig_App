import { View, Text, TouchableOpacity } from 'react-native';
import Header from '@/components/header';
import { MapPin, Plus, Minus, Layers } from 'lucide-react-native';
import { mapStyles } from '@/appStyles/map.style';
import { useNavigation } from 'expo-router';

export default function MapScreen() {
  const navigation = useNavigation<any>();
  return (
    <View style={mapStyles.container}>
      <Header onMenuPress={() => navigation.openDrawer()}/>
      <View style={mapStyles.mapContainer}>
        <View style={mapStyles.map}>
          <View style={[mapStyles.gradientCircle, mapStyles.gradient1]} />
          <View style={[mapStyles.gradientCircle, mapStyles.gradient2]} />
          <View style={[mapStyles.gradientCircle, mapStyles.gradient3]} />

          <View style={[mapStyles.marker, { top: '40%', left: '50%' }]}>
            <View style={mapStyles.markerIcon}>
              <Text style={mapStyles.markerEmoji}>🏢</Text>
            </View>
            <View style={mapStyles.markerLabel}>
              <Text style={mapStyles.markerText}>Pasig Sports Center</Text>
            </View>
          </View>

          <View style={[mapStyles.marker, { top: '48%', left: '42%' }]}>
            <View style={[mapStyles.markerIcon, { backgroundColor: '#DC2626' }]}>
              <Text style={mapStyles.markerEmoji}>🏠</Text>
            </View>
            <View style={mapStyles.markerLabel}>
              <Text style={mapStyles.markerText}>H2O</Text>
            </View>
          </View>

          <View style={[mapStyles.marker, { top: '56%', left: '52%' }]}>
            <View style={[mapStyles.markerIcon, { backgroundColor: '#10B981' }]}>
              <Text style={mapStyles.markerEmoji}>🏛️</Text>
            </View>
            <View style={mapStyles.markerLabel}>
              <Text style={mapStyles.markerText}>Active Fire</Text>
              <Text style={mapStyles.markerSubtext}>Barangay Hall</Text>
            </View>
          </View>

          <TouchableOpacity style={mapStyles.locationButton}>
            <MapPin size={20} color="#3B82F6" />
          </TouchableOpacity>

          <View style={mapStyles.zoomControls}>
            <TouchableOpacity style={mapStyles.zoomButton}>
              <Plus size={20} color="#374151" />
            </TouchableOpacity>
            <View style={mapStyles.zoomDivider} />
            <TouchableOpacity style={mapStyles.zoomButton}>
              <Minus size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={mapStyles.bottomSheet}>
        <TouchableOpacity style={mapStyles.toggleButton}>
          <Layers size={20} color="#1F2937" />
          <Text style={mapStyles.toggleText}>Toggle Map Layers</Text>
        </TouchableOpacity>

        <View style={mapStyles.routeCard}>
          <View style={mapStyles.routeHeader}>
            <MapPin size={16} color="#3B82F6" />
            <Text style={mapStyles.routeTitle}>Suggested Safe Route</Text>
          </View>
          <Text style={mapStyles.routeDescription}>
            Current route analysis: Avoid Ortigas Ave (flooding).
          </Text>
          <Text style={mapStyles.routeSuggestion}>
            Suggested: C5 Road → Meralco Ave
          </Text>
        </View>
      </View>
    </View>
  );
}