import { View, Text, TouchableOpacity, Image, ActivityIndicator, Animated, Vibration } from 'react-native';
import Header from '@/app/components/ui/header';
import { MapPin, Layers, Building, Plus, Minus, X, SirenIcon, HouseIcon, School } from 'lucide-react-native';
import { mapStyles } from '@/app/appStyles/map.style';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { pasigGovBuildings } from '@/app/components/objects/mapsObj';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { disasterPinImages } from '@/app/components/objects/disasterPins';
import { valleyFaultLines } from '@/app/components/objects/faultLines';
import { io } from "socket.io-client";
import { getDistance } from '@/app/functionalities/saferoutes/safeRoutes';

function getNearestSafeBuilding(report: { latitude: number; longitude: number }) {
  let nearest: any = null;
  let minDist = Infinity;

  pasigGovBuildings.forEach(building => {
    if (building.type === 'barangay' || building.type === 'police') {
      const dist = getDistance(report.latitude, report.longitude, building.coordinate.latitude, building.coordinate.longitude);
      if (dist < minDist) {
        minDist = dist;
        nearest = building;
      }
    }
  });

  return nearest;
}


export default function MapScreen() {
  const navigation = useNavigation<any>();
  const mapRef = useRef<MapView>(null);

  const [userLoc, setUserLoc] = useState<{ latitude: number; longitude: number } | null>(null);
  const [reportData, setReportData] = useState<any[]>([]);
  const [loadingMarkers, setLoadingMarkers] = useState<string[]>([]); // marker IDs still loading
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid' | 'terrain'>('standard');

  const [newAlertReport, setNewAlertReport] = useState<any | null>(null);

  const nearestBuilding = newAlertReport ? getNearestSafeBuilding(newAlertReport) : null;

  const params = useLocalSearchParams();
  const newReport = params.newReport ? JSON.parse(params.newReport as string) : null;
  const focusReport = params.focusReport ? JSON.parse(params.focusReport as string) : null;
  const deleteReportId = params.deletedReportId ? (params.deletedReportId as string) : null;

  // Animated scale + fade
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const socket = io("https://safepasig-backend.onrender.com");

  const [safeLocations, setSafeLocations] = useState<{ reportId: string; building: any }[]>([]);
  const [alertsForRoute, setAlertsForRoute] = useState<any[]>([]);


  useEffect(() => {
    const locations = reportData.map(report => {
      const nearest = getNearestSafeBuilding(report);
      return { reportId: report._id, building: nearest };
    });
    setSafeLocations(locations);
  }, [reportData]);

  useEffect(() => {

    socket.on("sos-alert", (data: any) => {
      const alertObj = {
        _id: data._id,
        type: data.type,
        description: data.description,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        createdAt: new Date().toISOString(),
      };

      setNewAlertReport(alertObj);

      setReportData(prev => [alertObj, ...prev]);
      setAlertsForRoute(prev => [...prev, alertObj]);  

      Vibration.vibrate([500, 500, 500]);
    });

    return () => {
      socket.off("sos-alert");
    };

  }, []);

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('https://safepasig-backend.onrender.com/reports');
        const data = await res.json();

        let reports = data.map((r: any) => ({
          ...r,
          latitude: parseFloat(r.latitude),
          longitude: parseFloat(r.longitude),
          deviceId: r.deviceId,
        }));

        if (newReport && !reports.find((r: any) => r._id === newReport._id)) {
          reports.push({
            ...newReport,
            latitude: parseFloat(newReport.latitude),
            longitude: parseFloat(newReport.longitude),
          });
          // Mark it as loading
          setLoadingMarkers(prev => [...prev, newReport._id]);
        }

        setReportData(reports);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      }
    };

    fetchReports();
  }, []);

 // ------------------- FIXED ANIMATION FOR SOCKET & POLLING -------------------
  useEffect(() => {
    if (newAlertReport && !loadingMarkers.includes(newAlertReport._id)) {
      // Mark loading to trigger spinner/animation
      setLoadingMarkers(prev => [...prev, newAlertReport._id]);

      const timer = setTimeout(() => {
        mapRef.current?.animateToRegion({
          latitude: parseFloat(newAlertReport.latitude),
          longitude: parseFloat(newAlertReport.longitude),
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        }, 1000);

        Animated.parallel([
          Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start(() => {
          setLoadingMarkers(prev => prev.filter(id => id !== newAlertReport._id));
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [newAlertReport]);


  // Focus report
  useEffect(() => {
    if (focusReport && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: parseFloat(focusReport.latitude),
        longitude: parseFloat(focusReport.longitude),
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      }, 1000);
    }
  }, [focusReport]);

  // Delete report
  useEffect(() => {
    if (deleteReportId) {
      setReportData(prev => prev.filter(r => r._id !== deleteReportId));
      setLoadingMarkers(prev => prev.filter(id => id !== deleteReportId));
      navigation.setParams({ deletedReportId: null });
    }
  }, [deleteReportId]);

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

      mapRef.current?.animateToRegion({
        ...coords,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    })();
  }, []);


  // Example with polling every 10 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch('https://safepasig-backend.onrender.com/reports');
      const data = await res.json();
      
      // Find the newest report that is not in the map
      const latest = data[data.length - 1];
      if (latest && !reportData.find(r => r._id === latest._id)) {
        setNewAlertReport(latest);

        // Optionally, add it to the map
        setReportData(prev => [...prev, {
          ...latest,
          latitude: parseFloat(latest.latitude),
          longitude: parseFloat(latest.longitude),
        }]);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [reportData]);


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

        {newAlertReport && (
          <View style={{
            position: 'absolute',
            top: 80,
            left: 20,
            right: 20,
            backgroundColor: '#DC2626',
            padding: 12,
            borderRadius: 10,
            elevation: 10,
            zIndex: 20
          }}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              New Disaster Report!
            </Text>
            <Text style={{ color: '#fff', marginTop: 4 }}>
              {newAlertReport.type}: {newAlertReport.description}
              {newAlertReport.deviceId ? `\nDevice ID: ${newAlertReport.deviceId}` : ''}
            </Text>
            <TouchableOpacity
              style={{ position: 'absolute', top: 8, right: 8 }}
              onPress={() => setNewAlertReport(null)}
            >
              <X size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}


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

          {valleyFaultLines.map((fault, idx) => (
            <Polyline
              key={`fault-${idx}`}
              coordinates={fault.coordinates}
              strokeColor="rgba(255, 115, 0, 0.89)"  
              strokeWidth={3}
              lineDashPattern={[6, 8]} 
            />
          ))}

          {reportData.filter(report => report && report._id)
            .map((report, index) => (
            <Marker
              key={`${report._id}-${index}`}
              coordinate={{ latitude: report.latitude, longitude: report.longitude }}
              title={`${report.type} | ${report.deviceId}`}
              description={`LOCATION: ${report.description} | PERSON: ${report.isPWD ? 'PWD' : 'Normal'}`} 
            >
              <View style={{ alignItems: 'center' }}>
                {loadingMarkers.includes(report._id) ? (
                  <ActivityIndicator size="small" color="#aa2727" />
                ) : (
                  <Animated.View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: '#aa2727',
                      alignItems: 'center',
                      justifyContent: 'center',
                      elevation: 4,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 2,
                      transform: [
                        { scale: report._id === newReport?._id ? scaleAnim : 1 }
                      ],
                      opacity: report._id === newReport?._id ? opacityAnim : 1,
                    }}
                  >
                    <Image
                      source={disasterPinImages[report.type] || disasterPinImages['Other']}
                      style={{ width: 24, height: 24 }}
                      resizeMode="contain"
                    />
                  </Animated.View>
                )}
              </View>
            </Marker>
          ))}

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

          {pasigGovBuildings.map((build, idx) => (
            <Marker key={`gov-${idx}`} coordinate={build.coordinate} title={build.title} description={build.description}>
              <View style={{ alignItems: 'center' }}>
                <View
                  style={{
                    backgroundColor: '#2681dc',
                    width: 24,
                    height: 24,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    elevation: 6,
                  }}
                >
                  {build.type === 'police' ? (
                    <SirenIcon color="white" size={15} />
                  ) : build.type === 'cityHall' ? (
                    <Building color="white" size={15} />
                  ) : build.type === 'barangay' ? (
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                      <HouseIcon size={15} color={'white'}/>
                    </Text>
                  ) : build.type === 'school' ? (
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                      <School color={'white'} size={15} />
                    </Text>
                  ) : null}
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
                    borderTopColor: '#2681dc',
                    marginTop: -5,
                  }}
                />
              </View>
            </Marker>
          ))}

        </MapView>

        <TouchableOpacity
          style={mapStyles.locationButton}
          onPress={() => {
            if (userLoc) mapRef.current?.animateToRegion({ ...userLoc, latitudeDelta: 0.002, longitudeDelta: 0.002 });
          }}
        >
          <MapPin size={20} color="#3B82F6" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 210, // under the location button
            right: 10,
            backgroundColor: '#3B82F6',
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 8,
            elevation: 10,
            zIndex: 10
          }}
          onPress={async () => {
            try {
              // Show ActivityIndicator immediately
              setLoadingMarkers(reportData.map(r => r._id));

              // Fetch latest reports
              const res = await fetch('https://safepasig-backend.onrender.com/reports');
              const data = await res.json();

              const reports = data.map((r: any) => ({
                ...r,
                latitude: parseFloat(r.latitude),
                longitude: parseFloat(r.longitude),
              }));

              // Include newReport if exists
              if (newReport && !reports.find((r: any) => r._id === newReport._id)) {
                reports.push({
                  ...newReport,
                  latitude: parseFloat(newReport.latitude),
                  longitude: parseFloat(newReport.longitude),
                });
              }

              setReportData(reports);

              // Animate map to the newReport
              if (newReport) {
                mapRef.current?.animateToRegion({
                  latitude: parseFloat(newReport.latitude),
                  longitude: parseFloat(newReport.longitude),
                  latitudeDelta: 0.001,
                  longitudeDelta: 0.001,
                }, 1000);
              }

              // Remove loading state after a short delay to allow rendering
              setTimeout(() => setLoadingMarkers([]), 300);

            } catch (error) {
              console.error('Failed to reload reports:', error);
            }
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Reload Map</Text>
        </TouchableOpacity>

        <View style={mapStyles.zoomControls}>
          <TouchableOpacity style={mapStyles.zoomButton} onPress={zoomIn}><Plus size={20} color="#3B82F6" /></TouchableOpacity>
          <View style={mapStyles.zoomDivider} />
          <TouchableOpacity style={mapStyles.zoomButton} onPress={zoomOut}><Minus size={20} color="#3B82F6" /></TouchableOpacity>
        </View>

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

              {newAlertReport && nearestBuilding && (
                <>
                  <Text style={mapStyles.routeDescription}>
                    Nearest safe location: {nearestBuilding.title}
                  </Text>
                  <Text style={mapStyles.routeSuggestion}>
                    Coordinates: {nearestBuilding.coordinate.latitude.toFixed(5)}, {nearestBuilding.coordinate.longitude.toFixed(5)}
                  </Text>

                  <Polyline
                    coordinates={[
                      { latitude: newAlertReport.latitude, longitude: newAlertReport.longitude },
                      nearestBuilding.coordinate
                    ]}
                    strokeColor="green"
                    strokeWidth={3}
                    lineDashPattern={[4, 6]}
                  />
                </>
              )}

             {alertsForRoute.map((alert) => {
                const nearest = getNearestSafeBuilding(alert);
                if (!nearest) return null;

                return (
                  <Polyline
                    key={`route-${alert._id}`}
                    coordinates={[
                      { latitude: alert.latitude, longitude: alert.longitude },
                      nearest.coordinate
                    ]}
                    strokeColor="green"
                    strokeWidth={3}
                    lineDashPattern={[4, 6]}
                  />
                );
              })}

          </View>
        </View>
      </View>
    </View>
  );
}
