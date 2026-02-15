import { Drawer } from 'expo-router/drawer';
import { View, Text, TouchableOpacity, ScrollView, Vibration } from 'react-native';

import { drawerStyles } from '@/app/appStyles/drawer.style';
import { Settings } from 'lucide-react-native';

export default function DrawerLayout() {

  const CustomDrawerContent = () => (
    <ScrollView style={drawerStyles.drawerContainer} contentContainerStyle={{ padding: 8, marginTop: 20 }}>
      <View>
        <Text style={[drawerStyles.sectionTitle, { fontSize: 22 }]}>
          <Settings size={20}/> Settings
        </Text>
      </View>

      <View style={drawerStyles.divider}/>

      <Text style={drawerStyles.sectionTitle}>Accessibility</Text>
      <TouchableOpacity style={drawerStyles.button} onPress={() => Vibration.vibrate(500)}>
        <Text style={drawerStyles.buttonText}>Test Vibration</Text>
      </TouchableOpacity>

      <View style={drawerStyles.divider}/>
    </ScrollView>
  );

  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        overlayColor: 'rgba(0,0,0,0.5)',
        drawerStyle: { width: 280 },
      }}
      drawerContent={CustomDrawerContent} 
    >
      <Drawer.Screen name="(tabs)" options={{ title: 'Home' }} />
    </Drawer>
  );
}
