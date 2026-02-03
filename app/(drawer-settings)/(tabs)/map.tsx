import { View, Text, TouchableOpacity } from 'react-native';
import Header from '@/components/header';
import { MapPin, Layers, Building, Plus, Minus } from 'lucide-react-native';
import { mapStyles } from '@/appStyles/map.style';
import { useNavigation } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { pasigGovBuildings } from '@/components/mapsObj';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';

export default function MapScreen() {
  const navigation = useNavigation<any>();
  const [userLoc, setUserLoc] = useState<any>(null);
  const mapRef = useRef<MapView>(null);

  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid' | 'terrain'>('standard');

  useEffect(() => {
    (async () => {
      const {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Location permision denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coordinations = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLoc(coordinations);

      mapRef.current?.animateToRegion({
        ...coordinations,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });

    })();
  },[]);

  const zoomIn = async () => {
    const camera = await mapRef.current?.getCamera();
    mapRef.current?.animateCamera({
      ...camera,
      zoom: (camera?.zoom || 0) + 1,
    }); 
  }

  const zoomOut = async () => {
    const camera = await mapRef.current?.getCamera();
    mapRef.current?.animateCamera({
      ...camera,
      zoom: (camera?.zoom || 0) - 1,
    }); 
  }

  const toggleMapType = () => {
    if (mapType === 'standard') setMapType('satellite');
    else if (mapType === 'satellite') setMapType('hybrid');
    else if (mapType === 'hybrid') setMapType('terrain');
    else setMapType('standard');
  }

  return (
    <View style={mapStyles.container}>

      <Header onMenuPress={() => navigation.openDrawer()}/>
      
      <View style={mapStyles.mapWrapper}>
        <MapView
          provider='google'
          ref={mapRef}
          minDelta={0.001}
          maxDelta={0.01}
          mapType={mapType}
          style={mapStyles.mapContainer}
          initialRegion={{
            latitude: 14.5767,
            longitude: 121.0851,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002
          }}
        > 

          {userLoc && (
            <Marker
              coordinate={userLoc}
              title='You'
            >

              <View
                style={{
                  width: 16, 
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: '#3B82F6',
                  borderWidth: 3,
                  borderColor: '#fff'
                }}
              >

              </View>

            </Marker>
          )}

          {pasigGovBuildings.map((build, idx) => (
            <Marker
              key={idx}
              coordinate={build.coordinate}
              title={build.title}
              description={build.description}
            >

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


        <TouchableOpacity 
          style={mapStyles.locationButton}
          onPress={() => {
            if (userLoc) {
              mapRef.current?.animateToRegion({
                ...userLoc,
                latitudeDelta: 0.002,
                longitudeDelta: 0.002,
              })
            }
          }}
          >
          <MapPin size={20} color={'#3B82F6'}/>
        </TouchableOpacity>

        <View style={mapStyles.zoomControls}>

          <TouchableOpacity style={mapStyles.zoomButton} onPress={zoomIn}>
            <Plus size={20} color={'#3B82F6'}/>
          </TouchableOpacity>

          <View style={mapStyles.zoomDivider}/>

          <TouchableOpacity style={mapStyles.zoomButton} onPress={zoomOut}>
            <Minus size={20} color={'#3B82F6'}/>
          </TouchableOpacity>

        </View>
        

        <View style={mapStyles.bottomSheet}>
          <TouchableOpacity style={mapStyles.toggleButton} onPress={toggleMapType}>
            <Layers size={20} color="#1F2937" />
            <Text style={mapStyles.toggleText}>Toggle Map Layers</Text>
          </TouchableOpacity>
          
          {/*POSSIBLE BACKEND*/}
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

    </View>
  );
}