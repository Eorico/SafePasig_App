import { Drawer } from 'expo-router/drawer';
import { View, Text, Switch, TouchableOpacity, ScrollView, Vibration } from 'react-native';
import { useState } from 'react';
import { drawerStyles } from '@/app/appStyles/drawer.style';
import { Settings } from 'lucide-react-native';

export default function DrawerLayout() {
  const [pushNotif, setPushNotif] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(false);
  const [vibrationAlerts, setVibrationAlerts] = useState(false);
  const [pwdProfile, setPwdProfile] = useState(false);
  const [autoLocation, setAutoLocation] = useState(false);

  const togglePWDProfile = async (value: boolean) => {
    setPwdProfile(value); // update UI immediately

    try {
      const res = await fetch("https://safepasig-backend.onrender.com/reports/pwd/all", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPWD: value }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert("Failed to update PWD for all reports.");
        setPwdProfile(!value); // revert UI
      } else {
        console.log(`Updated PWD for ${data.modifiedCount} reports`);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating PWD for all reports.");
      setPwdProfile(!value); // revert UI
    }
  };


  const CustomDrawerContent = () => (
    <ScrollView style={drawerStyles.drawerContainer} contentContainerStyle={{ padding: 8, marginTop: 20 }}>
      <View>
        <Text style={[drawerStyles.sectionTitle, { fontSize: 22 }]}>
          <Settings size={20}/> Settings
          </Text>
      </View>

      <View style={drawerStyles.divider}/>

      {/* Notifications */}
      <Text style={drawerStyles.sectionTitle}>Notifications</Text>
      <View style={drawerStyles.row}>
        <Text>Push Notifications</Text>
        <Switch value={pushNotif} onValueChange={setPushNotif} />
      </View>
      <View style={drawerStyles.row}>
        <Text>Sound Alerts</Text>
        <Switch value={soundAlerts} onValueChange={setSoundAlerts} />
      </View>

      <View style={drawerStyles.divider}/>

      <Text style={drawerStyles.sectionTitle}>Accessibility</Text>
      <View style={drawerStyles.row}>
        <Text>Vibration Alerts</Text>
        <Switch value={vibrationAlerts} onValueChange={setVibrationAlerts} />
      </View>
      <TouchableOpacity style={drawerStyles.button} onPress={() => Vibration.vibrate(500)}>
        <Text style={drawerStyles.buttonText}>Test Vibration</Text>
      </TouchableOpacity>

      <View style={drawerStyles.divider}/>
 
      <Text style={drawerStyles.sectionTitle}>User Profile</Text>
      <View style={drawerStyles.row}>
        <Text>PWD</Text>
        <Switch value={pwdProfile} onValueChange={togglePWDProfile} />
      </View>
      <View style={drawerStyles.row}>
        <Text>Auto Location Sharing</Text>
        <Switch value={autoLocation} onValueChange={setAutoLocation} />
      </View>
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
