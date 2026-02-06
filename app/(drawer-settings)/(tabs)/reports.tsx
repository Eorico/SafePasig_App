import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import Header from '@/app/components/ui/header';
import { Upload, Video, Trash2 } from 'lucide-react-native';
import { reportsStyles } from '@/app/appStyles/reports.style';
import { useNavigation } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
 
import { useState, useEffect, useRef } from 'react';
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

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const submitReport = async () => {
    if (!selectedBrgy || !street) {
      Alert.alert('Error', 'Please select a barangay and enter street/village');
      return;
    }

    try {
      // Geocode the address to get latitude & longitude
      const fullAddress = `${street}, ${selectedBrgy}, Pasig, Philippines`;
      const geocoded = await Location.geocodeAsync(fullAddress);

      if (geocoded.length === 0) {
        Alert.alert('Error', 'Cannot find location for this address');
        return;
      }

      const { latitude, longitude } = geocoded[0];

      // Prepare form data
      const form = new FormData();
      form.append("type", "Fire");
      form.append("description", `${street}, ${selectedBrgy}`);
      form.append("barangay", selectedBrgy);
      form.append("street", street);
      form.append("latitude", String(latitude));
      form.append("longitude", String(longitude));

      if (imageUri) {
        const fileName = imageUri.split('/').pop();
        const fileType = `image/${fileName?.split('.').pop()}`;
        form.append("media", { uri: imageUri, name: fileName, type: fileType } as any);
      }

      // Send to backend
      const res = await fetch('https://safepasig-backend.onrender.com/reports', {
        method: 'POST',
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        Alert.alert('Success', 'Report submitted successfully!');
        setImageUri(null);
        setSelectedBrgy(null);
        setStreet('');

        const newReport = {
          _id: data.report._id,
          latitude: latitude,
          longitude: longitude,
          type: data.report.type,
          description: `${data.report.street}, ${data.report.barangay}`,
          mediaUrl: data.report.mediaUrl,
          status: data.report.status,
          createdAt: data.report.createdAt,
        };

        setReportsData(prev => [...prev, newReport]);

        // Navigate to map and pass the new report
        navigation.navigate('map', {
          newReport: JSON.stringify(newReport),
        });
      } else {
        Alert.alert('Error', 'Failed to submit report');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to submit report');
    }
  };

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

  // 1️⃣ Delete function with confirmation
const confirmDeleteReport = (reportId: string) => {
  Alert.alert(
    'Confirm Delete',
    'Are you sure you want to delete this report?',
    [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: () => deleteReport(reportId) 
      }
    ]
  );
};

const deleteReport = async (reportId: string) => {
  try {
    const res = await fetch(`https://safepasig-backend.onrender.com/reports/${reportId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}` // uncomment if backend requires auth
      }
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Server response:', text);
      Alert.alert('Error', 'Failed to delete report.');
      return;
    }

    const data = await res.json();

    if (data.success) {
      // Remove from local state
      setReportsData(prev => prev.filter(r => r._id !== reportId));

      // Optional: notify map screen to remove marker
      navigation.navigate('map', { deletedReportId: reportId });

      Alert.alert('Deleted', 'Report successfully deleted.');
    } else {
      Alert.alert('Error', 'Failed to delete report.');
    }
  } catch (err) {
    console.error(err);
    Alert.alert('Error', 'Failed to delete report.');
  }
};


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

            <Picker
              selectedValue={selectedBrgy}
              onValueChange={(itemValue: any) => setSelectedBrgy(itemValue)}
              style={{ marginVertical: 10, color: '#fff' }}
            >
              <Picker.Item label="Select Barangay" value={null} />
              {barangays.map(b => (
                <Picker.Item key={b} label={b} value={b} />
              ))}
            </Picker>

            <TextInput
              placeholder="Enter street/village"
              placeholderTextColor="gray"
              value={street}
              onChangeText={setStreet}
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 8,
                padding: 8,
                marginBottom: 10,
                color: '#fff'
              }}
            />

            <TouchableOpacity style={reportsStyles.submitButton} onPress={pickMedia}>
              <Upload size={20} color="#3B82F6" />
              <Text style={reportsStyles.submitButtonText}>Upload Image/Video</Text>
            </TouchableOpacity>

            {imageUri && (
              <Image source={{ uri: imageUri }} style={{ width: 100, height: 100, marginTop: 10, borderRadius: 8 }} />
            )}

            <TouchableOpacity
              style={[reportsStyles.submitButton, { marginTop: 10 }]}
              onPress={submitReport}
            >
              <Text style={reportsStyles.submitButtonText}>Submit Report</Text>
            </TouchableOpacity>
          </View>
        </View>

         
        <Text style={reportsStyles.sectionTitle}>Recent Reports</Text>
         {reportsData.map(report => (
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

            {/* Trash Icon */}
            <TouchableOpacity
              style={{ position: 'absolute', top: 10, right: 10 }}
              onPress={() => confirmDeleteReport(report._id)}
            >
              <Trash2 size={20} color="#B91C1C" />
            </TouchableOpacity>
          </View>
        ))}

      </ScrollView>
    </View>
  );
}
