import { View, Text, ScrollView, TouchableOpacity, Alert, Vibration } from 'react-native';
import Header from '@/app/components/ui/header';
import { AlertCircle, Phone } from 'lucide-react-native';
import { SosStyles } from '@/app/appStyles/sos.style';
import { useNavigation } from 'expo-router';
import * as Location from 'expo-location';
import call from 'react-native-phone-call';
import { useEffect, useState } from 'react';
import { io } from "socket.io-client";
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { getDeviceId } from '@/utils/device';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

export default function SOSScreen() {
  const navigation = useNavigation<any>();
  const [loc, setLoc] = useState<{ latitude: number; longitude: number } | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [soundAlerts, setSoundAlerts] = useState(true); // optional: integrate from Drawer later
  const socket = io("https://safepasig-backend.onrender.com");

  // Listen for SOS alerts via socket
  useEffect(() => {
    socket.on("sos", (data: any) => {
      Alert.alert(
        "SOS Alert Received",
        `An SOS alert was triggered nearby!\nLatitude: ${data.latitude}\nLongitude: ${data.longitude}`
      );
      if (soundAlerts) Vibration.vibrate([500, 500, 500]);
    });
    return () => {
      socket.off("sos");
    };
  }, [soundAlerts]);

  // Register device for push notifications
  const registerForPushNotifications = async () => {
    if (!Constants.isDevice) {
      Alert.alert('Push Notifications require a physical device');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert('Failed to get push token for push notifications');
      return;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync();
    setExpoPushToken(tokenData.data);

    // Send token to backend
    const deviceId = await getDeviceId();
    await fetch('https://safepasig-backend.onrender.com/notifications/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, expoPushToken: tokenData.data }),
    });
  };

  // Listen for notifications while app is foregrounded
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      Alert.alert('Notification', notification.request.content.body || '');
      if (soundAlerts) Vibration.vibrate([500, 500, 500]);
    });

    return () => subscription.remove();
  }, [soundAlerts]);

  const getUserLoc = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Location permission is required");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setLoc({ latitude: location.coords.latitude, longitude: location.coords.longitude });
  };

  const triggerSOS = async () => {
    const deviceId = await getDeviceId();

    Vibration.vibrate([500, 500, 500]);
    await registerForPushNotifications(); // ensure push notifications are registered

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Location permission is required to trigger SOS");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const coords = { latitude: location.coords.latitude, longitude: location.coords.longitude };
    setLoc(coords);

    try {
      const response = await fetch('https://safepasig-backend.onrender.com/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, latitude: coords.latitude, longitude: coords.longitude }),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert(
          "SOS triggered",
          `Your SOS has been sent!\nLocation: ${coords.latitude}, ${coords.longitude}`
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to send SOS");
    }
  };

  const quickCall911 = () => {
    const args = { number: '911', prompt: true };
    call(args).catch(() => Alert.alert("Error", "Unable to call 911"));
  };

  return (
    <View style={SosStyles.container}>
      <Header onMenuPress={() => navigation.openDrawer()}/>
      <ScrollView style={SosStyles.scrollView} contentContainerStyle={SosStyles.content}>
        <Text style={SosStyles.pageTitle}>Emergency SOS</Text>

        <Text style={SosStyles.description}>
          Press the SOS button to alert nearby users around Pasig District. Your location will be shared.
          NOTE: PWD OR NORMAL PERSON IS INCLUDE ONCE THE SOS IS TRIGGERED.
        </Text>

        <View style={SosStyles.sosSection}>
          <TouchableOpacity style={SosStyles.sosButton} onPress={triggerSOS}>
            <View style={SosStyles.sosButtonInner}>
              <AlertCircle size={64} color="#FFFFFF" strokeWidth={3} />
              <Text style={SosStyles.sosButtonText}>SOS</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={SosStyles.actionButtons}>
          <TouchableOpacity style={SosStyles.callButton} onPress={quickCall911}>
            <Phone size={20} color="#FFFFFF" />
            <Text style={SosStyles.callButtonText}>Quick Call 911</Text>
          </TouchableOpacity>
        </View>

        <Text style={SosStyles.footerNote}>
          Press SOS to alert government institutions and nearby users.
        </Text>

        <View style={SosStyles.featuresCard}>
          <View style={SosStyles.featuresHeader}>
            <View style={SosStyles.checkIcon}>
              <Text style={SosStyles.checkmark}>✓</Text>
            </View>
            <Text style={SosStyles.featuresTitle}>Features Active</Text>
          </View>

          <View style={SosStyles.featuresList}>
            <View style={SosStyles.featureItem}>
              <View style={SosStyles.featureDot} />
              <Text style={SosStyles.featureText}>Location tracking enabled</Text>
            </View>
            <View style={SosStyles.featureItem}>
              <View style={SosStyles.featureDot} />
              <Text style={SosStyles.featureText}>SOS Trigger quickly</Text>
            </View>
            <View style={SosStyles.featureItem}>
              <View style={SosStyles.featureDot} />
              <Text style={SosStyles.featureText}>Other users will see your SOS or report</Text>
            </View>
            <View style={SosStyles.featureItem}>
              <View style={SosStyles.featureDot} />
              <Text style={SosStyles.featureText}>Auto-dial for emergency services by just clicking and it will move you to the dial phone</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
