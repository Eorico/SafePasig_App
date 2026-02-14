import { Drawer } from 'expo-router/drawer';
import { View, Text, Switch, TouchableOpacity, ScrollView, Vibration, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { NotificationHandler, NotificationBehavior } from 'expo-notifications';
import * as Location from 'expo-location';
import { drawerStyles } from '@/app/appStyles/drawer.style';
import { Settings } from 'lucide-react-native';

// Configure notification handler
const notificationHandler: NotificationHandler = {
  handleNotification: async (): Promise<NotificationBehavior> => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
};
Notifications.setNotificationHandler(notificationHandler);

export default function DrawerLayout() {
  const [pushNotif, setPushNotif] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [vibrationAlerts, setVibrationAlerts] = useState(true);
  const [autoLocation, setAutoLocation] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  // Register device for push notifications
  const registerForPushNotifications = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Permission denied', 'Enable notifications to receive alerts');
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      setExpoPushToken(tokenData.data);

      // Register token with backend
      await fetch('https://safepasig-backend.onrender.com/reports/register-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenData.data }),
      });

    } catch (error) {
      console.error('Push notification permission error:', error);
    }
  };

  // Auto-register when toggle is enabled
  useEffect(() => {
    if (pushNotif) registerForPushNotifications();
  }, [pushNotif]);

  // Auto location sharing
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | undefined;

    const enableLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Enable location to use auto location sharing');
        setAutoLocation(false);
        return;
      }

      if (autoLocation) {
        locationSubscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Highest, distanceInterval: 10 },
          async (loc) => {
            console.log('Updated Location:', loc.coords);

            // Send location to backend (example endpoint)
            await fetch('https://safepasig-backend.onrender.com/reports/update-location', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                deviceId: 'yourDeviceId', // replace with actual deviceId
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              }),
            });
          }
        );
      }
    };

    enableLocation();

    return () => locationSubscription?.remove();
  }, [autoLocation]);

  // Test notification
  const sendTestNotification = async () => {
    if (!expoPushToken) {
      Alert.alert('Push notifications not enabled');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Alert!",
        body: "This is a test notification",
        sound: soundAlerts ? 'default' : undefined,
      },
      trigger: null,
    });

    if (vibrationAlerts) Vibration.vibrate(500);
  };

  const CustomDrawerContent = () => (
    <ScrollView style={drawerStyles.drawerContainer} contentContainerStyle={{ padding: 8, marginTop: 20 }}>
      <View>
        <Text style={[drawerStyles.sectionTitle, { fontSize: 22 }]}>
          <Settings size={20}/> Settings
        </Text>
      </View>

      <View style={drawerStyles.divider}/>

      <Text style={drawerStyles.sectionTitle}>Notifications</Text>
      <View style={drawerStyles.row}>
        <Text>Push Notifications</Text>
        <Switch value={pushNotif} onValueChange={setPushNotif} />
      </View>
      <View style={drawerStyles.row}>
        <Text>Sound Alerts</Text>
        <Switch value={soundAlerts} onValueChange={setSoundAlerts} disabled={!pushNotif} />
      </View>
      <View style={drawerStyles.row}>
        <Text>Vibration Alerts</Text>
        <Switch value={vibrationAlerts} onValueChange={setVibrationAlerts} disabled={!pushNotif} />
      </View>
      <TouchableOpacity style={drawerStyles.button} onPress={sendTestNotification}>
        <Text style={drawerStyles.buttonText}>Test Notification</Text>
      </TouchableOpacity>

      <View style={drawerStyles.divider}/>

      <Text style={drawerStyles.sectionTitle}>User Profile</Text>
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
