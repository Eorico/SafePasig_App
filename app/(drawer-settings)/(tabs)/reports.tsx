import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import Header from '@/app/components/ui/header';
import { Upload, Video, AlertTriangle } from 'lucide-react-native';
import { reportsStyles } from '@/app/appStyles/reports.style';
import { useNavigation } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import MapView, { Marker } from 'react-native-maps';
import { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker'; 

export default function ReportsScreen() {
  const navigation = useNavigation<any>();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [reportsData, setReportsData] = useState<any[]>([]);
  const [selectedBrgy, setSelectedBrgy] = useState<string | null>(null);
  const [street, setStreet] = useState<string>('');

  // List of barangays in Pasig
  const barangays = [
    'Bagong Ilog', 'Bagong Katipunan', 'Bambang', 'Kapitolyo', 'Karangalan', 
    'Manggahan', 'Oranbo', 'Palatiw', 'Pasig Proper', 'Pinagbuhatan', 
    'San Antonio', 'San Joaquin', 'San Jose', 'San Nicolas', 'Santa Cruz', 
    'Santa Lucia', 'Santa Rosa', 'Santolan', 'Sumilang', 'Ugong', 'Bagong Bayan'
  ];

  // Pick image/video
  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
    });

    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  // Submit report to backend
  const submitReport = async () => {
    if (!selectedBrgy || !street) {
      Alert.alert('Error', 'Please select a barangay and enter street/village');
      return;
    }

    try {
      const loc = await Location.getCurrentPositionAsync({});
      const form = new FormData();

      form.append("type", "Fire"); // You can replace with a type input later
      form.append("description", `${street}, ${selectedBrgy}`);
      form.append("barangay", selectedBrgy);
      form.append("street", street);
      form.append("lat", String(loc.coords.latitude));
      form.append("lng", String(loc.coords.longitude));

      if (imageUri) {
        const fileName = imageUri.split('/').pop();
        const fileType = imageUri.split('.').pop();
        form.append("media", {
          uri: imageUri,
          name: fileName,
          type: `image/${fileType}`,
        } as any);
      }

      const res = await fetch('https://safepasig-backend.onrender.com/reports', {
        method: 'POST',
        body: form,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = await res.json();
      if (data.success) {
        Alert.alert('Success', 'Report submitted successfully!');
        setImageUri(null);
        setSelectedBrgy(null);
        setStreet('');

        // Add new report to state immediately
        setReportsData(prev => [
          ...prev,
          {
            _id: data.report._id,
            lat: data.report.lat,
            lng: data.report.lng,
            type: data.report.type,
            description: `${data.report.street}, ${data.report.barangay}`,
            mediaUrl: data.report.mediaUrl,
            status: data.report.status,
            createdAt: data.report.createdAt,
          }
        ]);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to submit report');
    }
  };

  // Fetch recent reports from backend
  const fetchReports = async () => {
    try {
      const res = await fetch('https://safepasig-backend.onrender.com/reports');
      const data = await res.json();
      setReportsData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <View style={reportsStyles.container}>
      <Header onMenuPress={() => navigation.openDrawer()} />
      <ScrollView style={reportsStyles.scrollView} contentContainerStyle={reportsStyles.content}>
        <Text style={reportsStyles.pageTitle}>User Reports</Text>

        {/* Submit Report */}
        <View style={reportsStyles.submitCard}>
          <View style={reportsStyles.submitCardContent}>
            <Text style={reportsStyles.submitTitle}>Report a Disaster</Text>
            <Text style={reportsStyles.submitDescription}>
              Help your community by submitting verified images or videos of disasters
            </Text>

            {/* Barangay Dropdown */}
            <Picker
              selectedValue={selectedBrgy}
              onValueChange={(itemValue: any) => setSelectedBrgy(itemValue)}
              style={{ marginVertical: 10 }}
            >
              <Picker.Item label="Select Barangay" value={null} />
              {barangays.map((b) => (
                <Picker.Item key={b} label={b} value={b} />
              ))}
            </Picker>

            {/* Street Input */}
            <TextInput
              placeholder="Enter street/village"
              value={street}
              onChangeText={setStreet}
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 8,
                padding: 8,
                marginBottom: 10,
              }}
            />

            {/* Upload Media */}
            <TouchableOpacity style={reportsStyles.submitButton} onPress={pickMedia}>
              <Upload size={20} color="#3B82F6" />
              <Text style={reportsStyles.submitButtonText}>Upload Image/Video</Text>
            </TouchableOpacity>

            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={{ width: 100, height: 100, marginTop: 10, borderRadius: 8 }}
              />
            )}

            <TouchableOpacity
              style={[reportsStyles.submitButton, { marginTop: 10 }]}
              onPress={submitReport}
            >
              <Text style={reportsStyles.submitButtonText}>Submit Report</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Anti-troll */}
        <View style={reportsStyles.protectionCard}>
          <View style={reportsStyles.protectionHeader}>
            <AlertTriangle size={16} color="#92400E" />
            <Text style={reportsStyles.protectionTitle}>Anti-Troll Protection</Text>
          </View>
          <Text style={reportsStyles.protectionText}>
            All submissions require photo/video and are scanned using AI to detect fake or misleading content. False reports will be flagged.
          </Text>
        </View>

        {/* Map */}
        <Text style={reportsStyles.sectionTitle}>Recent Reports on Map</Text>
        <MapView
          style={{ width: '100%', height: 300, marginBottom: 20 }}
          initialRegion={{
            latitude: 14.5767,
            longitude: 121.0851,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          {reportsData.map((report) => (
            <Marker
              key={report._id}
              coordinate={{ latitude: report.lat, longitude: report.lng }}
              title={report.type}
              description={`${report.type} – ${report.description}`}
            />
          ))}
        </MapView>

        {/* Recent Reports List */}
        <Text style={reportsStyles.sectionTitle}>Recent Reports</Text>
        {reportsData.map((report) => (
          <View key={report._id} style={reportsStyles.reportCard}>
            <View style={[reportsStyles.reportIcon, { backgroundColor: '#FECACA' }]}>
              <View style={reportsStyles.iconCircle}>
                {report.mediaUrl?.endsWith('.mp4') ? (
                  <Video size={28} color="#B91C1C" />
                ) : (
                  <Image
                    source={{ uri: report.mediaUrl }}
                    style={{ width: 50, height: 50, borderRadius: 8 }}
                  />
                )}
              </View>
              <View style={reportsStyles.statusBadge}>
                <Text style={reportsStyles.statusIcon}>
                  {report.status === 'Verified' ? '✓' : '⏱'}
                </Text>
              </View>
            </View>

            <View style={reportsStyles.reportContent}>
              <Text style={reportsStyles.locationText}>{report.description}</Text>
              <Text style={reportsStyles.timeText}>{new Date(report.createdAt).toLocaleString()}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
