import { View, Text, TouchableOpacity, Image } from 'react-native';
import Header from '@/app/components/ui/header';
import { MapPin, Layers, Building, Plus, Minus } from 'lucide-react-native';
import { mapStyles } from '@/app/appStyles/map.style';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { pasigGovBuildings } from '@/app/components/objects/mapsObj';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { disasterPinImages } from '@/app/components/objects/disasterPins';

export default function MapScreen() {
  const navigation = useNavigation<any>();
  const mapRef = useRef<MapView>(null);

  const [userLoc, setUserLoc] = useState<{ latitude: number; longitude: number } | null>(null);
  const [reportData, setReportData] = useState<any[]>([]);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid' | 'terrain'>('standard');

  const params = useLocalSearchParams();
  const newReport = params.newReport ? JSON.parse(params.newReport as string) : null;

  // Fetch reports once
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('https://safepasig-backend.onrender.com/reports');
        const data = await res.json();

        // Convert lat/lng to numbers
        let reports = data.map((r: any) => ({
          ...r,
          latitude: parseFloat(r.latitude),
          longitude: parseFloat(r.longitude),
        }));

        // Add newReport if it doesn't already exist
        if (newReport && !reports.find((r: any) => r._id === newReport._id)) {
          reports.push({
            ...newReport,
            latitude: parseFloat(newReport.latitude),
            longitude: parseFloat(newReport.longitude),
          });

          // Animate to the new report
          mapRef.current?.animateToRegion({
            latitude: parseFloat(newReport.latitude),
            longitude: parseFloat(newReport.longitude),
            latitudeDelta: 0.001,
            longitudeDelta: 0.001,
          }, 1000);
        }

        setReportData(reports);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      }
    };

    fetchReports();
  }, []);

  // Get user location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = { latitude: location.coords.latitude, longitude: location.coords.longitude };
      setUserLoc(coords);

      // Animate to user location
      mapRef.current?.animateToRegion({
        ...coords,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    })();
  }, []);

  const zoomIn = async () => {
    const camera = await mapRef.current?.getCamera();
    mapRef.current?.animateCamera({ ...camera, zoom: (camera?.zoom || 0) + 1 });
  };

  const zoomOut = async () => {
    const camera = await mapRef.current?.getCamera();
    mapRef.current?.animateCamera({ ...camera, zoom: (camera?.zoom || 0) - 1 });
  };

  const toggleMapType = () => {
    setMapType(prev => {
      if (prev === 'standard') return 'satellite';
      if (prev === 'satellite') return 'hybrid';
      if (prev === 'hybrid') return 'terrain';
      return 'standard';
    });
  };

  return (
    <View style={mapStyles.container}>
      <Header onMenuPress={() => navigation.openDrawer()} />

      <View style={mapStyles.mapWrapper}>
        <MapView
          provider="google"
          ref={mapRef}
          mapType={mapType}
          style={mapStyles.mapContainer}
          initialRegion={{
            latitude: 14.5767,
            longitude: 121.0851,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          }}
        >
          {/* User reports */}
          {reportData.map(report => (
            <Marker
              key={report._id} // guaranteed unique now
              coordinate={{ latitude: report.latitude, longitude: report.longitude }}
              title={report.type}
              description={report.description}
            >
              <Image
                source={disasterPinImages[report.type] || disasterPinImages['Other']}
                style={{ width: 32, height: 32 }}
                resizeMode='contain'
              />
            </Marker>
          ))}

          {/* User location */}
          {userLoc && (
            <Marker coordinate={userLoc} title="You">
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: '#3B82F6',
                  borderWidth: 3,
                  borderColor: '#fff',
                }}
              />
            </Marker>
          )}

          {/* Government buildings */}
          {pasigGovBuildings.map((build, idx) => (
            <Marker key={`gov-${idx}`} coordinate={build.coordinate} title={build.title} description={build.description}>
              <View style={{ alignItems: 'center' }}>
                <View
                  style={{
                    backgroundColor: '#DC2626',
                    width: 24,
                    height: 24,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    elevation: 6,
                  }}
                >
                  <Building color="white" size={15} />
                </View>

                <View
                  style={{
                    width: 0,
                    height: 0,
                    borderLeftWidth: 8,
                    borderRightWidth: 8,
                    borderTopWidth: 12,
                    borderLeftColor: 'transparent',
                    borderRightColor: 'transparent',
                    borderTopColor: '#DC2626',
                    marginTop: -5,
                  }}
                />
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Location button */}
        <TouchableOpacity
          style={mapStyles.locationButton}
          onPress={() => {
            if (userLoc) {
              mapRef.current?.animateToRegion({ ...userLoc, latitudeDelta: 0.002, longitudeDelta: 0.002 });
            }
          }}
        >
          <MapPin size={20} color="#3B82F6" />
        </TouchableOpacity>

        {/* Zoom controls */}
        <View style={mapStyles.zoomControls}>
          <TouchableOpacity style={mapStyles.zoomButton} onPress={zoomIn}>
            <Plus size={20} color="#3B82F6" />
          </TouchableOpacity>
          <View style={mapStyles.zoomDivider} />
          <TouchableOpacity style={mapStyles.zoomButton} onPress={zoomOut}>
            <Minus size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* Bottom sheet */}
        <View style={mapStyles.bottomSheet}>
          <TouchableOpacity style={mapStyles.toggleButton} onPress={toggleMapType}>
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
            <Text style={mapStyles.routeSuggestion}>Suggested: C5 Road → Meralco Ave</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
