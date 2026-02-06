import { View, Text, ScrollView, TouchableOpacity, Alert, Vibration } from 'react-native';
import Header from '@/app/components/ui/header';
import { AlertCircle, Phone } from 'lucide-react-native';
import { SosStyles } from '@/app/appStyles/sos.style';
import { useNavigation } from 'expo-router';
import * as Location from 'expo-location';
import call from 'react-native-phone-call';
import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';

export default function SOSScreen() {
 const navigation = useNavigation<any>();
  const [loc, setLoc] = useState<{ latitude: number; longitude: number } | null>(null);

  const getUserLoc = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Location permission is required");
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    setLoc({ latitude: location.coords.latitude, longitude: location.coords.longitude });
    return { latitude: location.coords.latitude, longitude: location.coords.longitude };
  };

  const triggerSOS = async () => {
    Vibration.vibrate([500, 500, 500]);

    const coords = await getUserLoc();
    if (!coords) return;

    try {
      await fetch('https://safepasig-backend.onrender.com/SOS', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coords),
      });

      Alert.alert(
        'SOS Triggered',
        `Your SOS has been sent!\nLocation: ${coords.latitude}, ${coords.longitude}`
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to send SOS. Try again.');
      console.error(err);
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
          Press the SOS button to alert government institutions and nearby users. Your location will be shared.
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
              <Text style={SosStyles.featureText}>Voice activation ready</Text>
            </View>
            <View style={SosStyles.featureItem}>
              <View style={SosStyles.featureDot} />
              <Text style={SosStyles.featureText}>Offline mode available</Text>
            </View>
            <View style={SosStyles.featureItem}>
              <View style={SosStyles.featureDot} />
              <Text style={SosStyles.featureText}>Auto-dial emergency services</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}