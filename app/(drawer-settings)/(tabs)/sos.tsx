import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Header from '@/app/components/ui/header';
import { AlertCircle, Mic, Phone } from 'lucide-react-native';
import { SosStyles } from '@/app/appStyles/sos.style';
import { useNavigation } from 'expo-router';

export default function SOSScreen() {
  const navigation = useNavigation<any>();
  return (
    <View style={SosStyles.container}>
      <Header onMenuPress={() => navigation.openDrawer()}/>
      <ScrollView style={SosStyles.scrollView} contentContainerStyle={SosStyles.content}>
        <Text style={SosStyles.pageTitle}>Emergency SOS</Text>

        <Text style={SosStyles.description}>
          Press the SOS button to alert government institutions and nearby users. Your location will be shared.
        </Text>

        <View style={SosStyles.sosSection}>
          <TouchableOpacity style={SosStyles.sosButton}>
            <View style={SosStyles.sosButtonInner}>
              <AlertCircle size={64} color="#FFFFFF" strokeWidth={3} />
              <Text style={SosStyles.sosButtonText}>SOS</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={SosStyles.actionButtons}>
          <TouchableOpacity style={SosStyles.voiceButton}>
            <Mic size={20} color="#FFFFFF" />
            <Text style={SosStyles.voiceButtonText}>Voice SOS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={SosStyles.callButton}>
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