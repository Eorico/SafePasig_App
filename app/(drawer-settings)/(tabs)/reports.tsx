import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image, ActivityIndicator } from 'react-native';
import Header from '@/app/components/ui/header';
import { Upload, Video, Trash2 } from 'lucide-react-native';
import { reportsStyles } from '@/app/appStyles/reports.style';
import { useNavigation } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
 
import { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';

import { disasterPinImages } from '@/app/components/objects/disasterPins';

export default function ReportsScreen() {
  const navigation = useNavigation<any>();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [reportsData, setReportsData] = useState<any[]>([]);
  const [selectedBrgy, setSelectedBrgy] = useState<string | null>(null);
  const [street, setStreet] = useState<string>('');

  const [selectedType, setSelectedType] = useState<string>('Fire');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const disasterTypes = ['Fire', 'Flood', 'Landslide', 'Earthquake', 'Storm', 'Accident', 'Emergency', 'Other'];

  const [isLoadingReports, setIsLoadingReports] = useState<boolean>(false);

 
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
    if (!selectedBrgy || !street) return Alert.alert('Error', 'Please fill required fields');
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const fullAddress = `${street}, ${selectedBrgy}, Pasig, Philippines`;
      const geocoded = await Location.geocodeAsync(fullAddress);
      if (!geocoded.length) return Alert.alert('Error', 'Cannot find location');

      const { latitude, longitude } = geocoded[0];

      const form = new FormData();
      form.append('type', selectedType);
      form.append('description', `${street}, ${selectedBrgy}`);
      form.append('barangay', selectedBrgy);
      form.append('street', street);
      form.append('latitude', String(latitude));
      form.append('longitude', String(longitude));

      if (imageUri) {
        const fileName = imageUri.split('/').pop();
        const fileType = `image/${fileName?.split('.').pop()}`;
        form.append('media', { uri: imageUri, name: fileName, type: fileType } as any);
      }

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
        setSelectedType('Fire');

        // REFRESH from backend
        fetchReports();

        navigation.navigate('map', { newReport: JSON.stringify(data.report) });
      } else {
        Alert.alert('Error', 'Failed to submit report');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchReports = async () => {
    setIsLoadingReports(true);
    try {
      const res = await fetch('https://safepasig-backend.onrender.com/reports');
      const data = await res.json();

      const sortedReports = data.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setReportsData([]);

      sortedReports.forEach((report: any, index: number) => {
        setTimeout(() => {
          setReportsData(prev => [...prev, report]);
        }, index * 50);  
      });

    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setIsLoadingReports(false); 
    }
  };

  useEffect(() => {
    console.log("Fetching reports...");
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

            {/* Disaster Type Picker */}
            <View
              style={{
                borderWidth: 1,
                borderColor: '#fff',
                borderRadius: 8,
                marginVertical: 10,
                overflow: 'hidden', // ensures borderRadius works
              }}
            >
              <Picker
                selectedValue={selectedType}
                onValueChange={(itemValue: any) => setSelectedType(itemValue)}
                dropdownIconColor="#fff" // Android dropdown arrow color
                style={{
                  color: '#fff',
                  backgroundColor: 'transparent', // keep it transparent inside the border
                }}
              >
                {disasterTypes.map(type => (
                  <Picker.Item key={type} label={type} value={type} />
                ))}
              </Picker>
            </View>

            {/* Barangay Picker */}
            <View
              style={{
                borderWidth: 1,
                borderColor: '#fff',
                borderRadius: 8,
                marginVertical: 10,
                overflow: 'hidden',
              }}
            >
              <Picker
                selectedValue={selectedBrgy}
                onValueChange={(itemValue: any) => setSelectedBrgy(itemValue)}
                dropdownIconColor="#fff"
                style={{
                  color: '#fff',
                  backgroundColor: 'transparent',
                }}
              >
                <Picker.Item label="Select Barangay" value={null} />
                {barangays.map(b => (
                  <Picker.Item key={b} label={b} value={b} />
                ))}
              </Picker>
            </View>

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
              style={[reportsStyles.submitButton, { marginTop: 10, opacity: isSubmitting ? 0.6 : 1 }]}
              onPress={submitReport}
              disabled={isSubmitting}
            >
              <Text style={reportsStyles.submitButtonText}>
               {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                  <Text style={reportsStyles.submitButtonText}>Submitting...</Text>
                </>
               ) : (
                <Text style={reportsStyles.submitButtonText}>Submit Report</Text>
               )}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

         
        <Text style={reportsStyles.sectionTitle}>Recent Pasig Reports</Text>
         {isLoadingReports ? (
            <View style={{ marginTop: 20, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={{ marginTop: 10, color: '#555' }}>Loading reports...</Text>
            </View>
          ) : (
            reportsData.map(report => (
              <TouchableOpacity
                key={report._id}
                onPress={() => navigation.navigate('map', {
                  focusReport: JSON.stringify({
                    latitude: report.latitude,
                    longitude: report.longitude,
                    type: report.type,
                    description: report.description,
                    _id: report._id
                  })
                })}
              >
                <View key={report._id} style={reportsStyles.reportCard}>
                  <View style={[reportsStyles.reportIcon, { backgroundColor: '#FECACA' }]}>
                    <View style={reportsStyles.iconCircle}>
                      {report.mediaUrl?.endsWith('.mp4') ? (
                        <Video size={28} color="#B91C1C" />
                      ) : report.mediaUrl ? (
                        <Image
                          source={{ uri: `https://safepasig-backend.onrender.com/${report.mediaUrl}` }}
                          style={{ width: 50, height: 50, borderRadius: 8 }}
                        />
                      ) : (
                        <View style={{ width: 50, height: 50, borderRadius: 8, backgroundColor: '#eee' }} />
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

                  <TouchableOpacity
                    style={{ position: 'absolute', top: 10, right: 10 }}
                    onPress={() => confirmDeleteReport(report._id)}
                  >
                    <Trash2 size={20} color="#B91C1C" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}

      </ScrollView>
    </View>
  );
}
