import { drawerStyles } from "@/app/appStyles/drawer.style";
import { getDeviceId } from "@/utils/device";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Drawer } from "expo-router/drawer";
import { Settings } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";

export default function DrawerLayout() {
  const [pushNotif, setPushNotif] = useState(false);
  const [soundAlerts, setSoundAlerts] = useState(false);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: false,
        shouldShowList: false,
      }),
    });
  });

  // Register device for push notifications
  const registerForPushNotifications = async () => {
    try {
      if (!Constants.isDevice) {
        Alert.alert("Push Notifications require a physical device");
        return;
      }

      const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert("Failed to get push token for push notifications");
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const expoPushToken = tokenData.data;

      const deviceId = await getDeviceId();

      // Send token to backend
      await fetch(
        "https://safepasig-backend.onrender.com/notifications/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deviceId, expoPushToken }),
        },
      );

      console.log("Push token registered:", expoPushToken);
    } catch (error) {
      console.error("Error registering for push notifications:", error);
    }
  };

  // Listen for notifications while app is in foreground
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        Alert.alert("Notification", notification.request.content.body || "");
        if (soundAlerts) Vibration.vibrate([500, 500, 500]);
      },
    );

    return () => subscription.remove();
  }, [soundAlerts]);

  const CustomDrawerContent = () => (
    <ScrollView
      style={drawerStyles.drawerContainer}
      contentContainerStyle={{ padding: 8, marginTop: 20 }}
    >
      <View>
        <Text style={[drawerStyles.sectionTitle, { fontSize: 22 }]}>
          <Settings size={20} /> Settings
        </Text>
      </View>

      <View style={drawerStyles.divider} />

      {/* Notifications */}
      <Text style={drawerStyles.sectionTitle}>Notifications</Text>
      <View style={drawerStyles.row}>
        <Text>Push Notifications</Text>
        <Switch
          value={pushNotif}
          onValueChange={async (value) => {
            setPushNotif(value);
            if (value) await registerForPushNotifications();
          }}
        />
      </View>
      <View style={drawerStyles.row}>
        <Text>Sound Alerts</Text>
        <Switch value={soundAlerts} onValueChange={setSoundAlerts} />
      </View>

      <View style={drawerStyles.divider} />

      <Text style={drawerStyles.sectionTitle}>Accessibility</Text>
      <TouchableOpacity
        style={drawerStyles.button}
        onPress={() => Vibration.vibrate(500)}
      >
        <Text style={drawerStyles.buttonText}>Test Vibration</Text>
      </TouchableOpacity>

      <View style={drawerStyles.divider} />
    </ScrollView>
  );

  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerType: "front",
        overlayColor: "rgba(0,0,0,0.5)",
        drawerStyle: { width: 280 },
      }}
      drawerContent={CustomDrawerContent}
    >
      <Drawer.Screen name="(tabs)" options={{ title: "Home" }} />
    </Drawer>
  );
}
