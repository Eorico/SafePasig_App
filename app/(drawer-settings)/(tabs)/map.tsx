import { View, Text, TouchableOpacity } from 'react-native';
import Header from '@/components/header';
import { MapPin, Layers, Building, Plus, Minus } from 'lucide-react-native';
import { mapStyles } from '@/appStyles/map.style';
import { useNavigation } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { pasigGovBuildings } from '@/components/mapsObj';

export default function MapScreen() {
  const navigation = useNavigation<any>();
  return (
    <View style={mapStyles.container}>

      <Header onMenuPress={() => navigation.openDrawer()}/>
      
      <View style={mapStyles.mapWrapper}>
        <MapView
          style={mapStyles.mapContainer}
          initialRegion={{
            latitude: 14.5767,
            longitude: 121.0851,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02
          }}
        >

          {pasigGovBuildings.map((build, idx) => (
            <Marker
              key={idx}
              coordinate={build.coordinate}
              title={build.title}
              description={build.description}
            >

              <View
                style={{
                  backgroundColor: '#DC2626',
                  padding: 4,
                  borderRadius: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View>
                  <Building color={'white'} size={24}/>
                </View>
              </View>

            </Marker>
          ))}

        </MapView>


        <TouchableOpacity style={mapStyles.locationButton}>
          <MapPin size={20} color={'#3B82F6'}/>
        </TouchableOpacity>

        <View style={mapStyles.zoomControls}>

          <TouchableOpacity style={mapStyles.zoomButton}>
            <Plus size={20} color={'#3B82F6'}/>
          </TouchableOpacity>

          <View style={mapStyles.zoomDivider}/>

          <TouchableOpacity style={mapStyles.zoomButton}>
            <Minus size={20} color={'#3B82F6'}/>
          </TouchableOpacity>

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

    </View>
  );
}