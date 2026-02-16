import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image, ActivityIndicator, RefreshControl, Vibration } from 'react-native';
import Header from '@/app/components/ui/header';
import { Upload, Video, Trash2, User, CheckCheckIcon, Clock, XCircle } from 'lucide-react-native';
import { reportsStyles } from '@/app/appStyles/reports.style';
import { useNavigation } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';
import { getDeviceId } from '@/utils/device';
import io from 'socket.io-client';

// Define Report type for TypeScript safety
interface Report {
  _id: string;
  deviceId: string;
  type: string;
  description: string;
  barangay?: string;
  street?: string;
  latitude: number;
  longitude: number;
  mediaUrl?: string;
  isPWD?: boolean;
  status?: 'True' | 'False' | 'Pending';
  createdAt: string;
}

export default function ReportsScreen() {
  const navigation = useNavigation<any>();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [reportsData, setReportsData] = useState<Report[]>([]);
  const [selectedBrgy, setSelectedBrgy] = useState<string | null>(null);
  const [street, setStreet] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('Fire');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingReports, setIsLoadingReports] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pwdProfile, setPwdProfile] = useState(false);

  const disasterTypes = ['Fire', 'Flood', 'Landslide', 'Earthquake', 'Storm', 'Accident', 'Emergency', 'Stray Dogs','Other'];

  const barangays = [
    'Bagong Ilog', 'Bagong Katipunan', 'Bambang', 'Kapitolyo', 'Karangalan', 
    'Manggahan', 'Oranbo', 'Palatiw', 'Pasig Proper', 'Pinagbuhatan', 
    'San Antonio', 'San Joaquin', 'San Jose', 'San Nicolas', 'Santa Cruz', 
    'Santa Lucia', 'Santa Rosa', 'Santolan', 'Sumilang', 'Ugong', 'Bagong Bayan'
  ];

  const socket = io("https://safepasig-backend.onrender.com");


  // Socket: Listen for new reports in real-time
  useEffect(() => {
    socket.on("new-report", (data: Report) => {
      setReportsData(prev => [data, ...prev]);
      Alert.alert('New Report', `A new report has been submitted: ${data.type}`);
      Vibration.vibrate([500, 500]);
    });

    socket.on("report-deleted", (data: { id: string }) => {
      setReportsData(prev => prev.filter(r => r._id !== data.id));
    });

    return () => {
      socket.off("new-report");
      socket.off("report-deleted");
    };
  }, []);

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const fetchReports = async () => {
    setIsLoadingReports(true);
    try {
      const res = await fetch('https://safepasig-backend.onrender.com/reports');
      const data: Report[] = await res.json();
      setReportsData(
        data.filter(Boolean).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setIsLoadingReports(false);
    }
  };

  const submitReport = async () => {
    const deviceId = await getDeviceId();
    if (!selectedBrgy || !street) return Alert.alert('OOPS!', 'Please fill required fields');
    if (!imageUri) return Alert.alert('OOPS!', 'Please provide an image or video for proof!');
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const fullAddress = `${street}, ${selectedBrgy}, Pasig, Philippines`;
      const geocoded = await Location.geocodeAsync(fullAddress);
      if (!geocoded.length) return Alert.alert('Error', 'Cannot find location');

      const { latitude, longitude } = geocoded[0];

      const form = new FormData();
      form.append('deviceId', deviceId);
      form.append('type', selectedType);
      form.append('description', `${street}, ${selectedBrgy}`);
      form.append('barangay', selectedBrgy);
      form.append('street', street);
      form.append('latitude', String(latitude));
      form.append('longitude', String(longitude));
      form.append('isPWD', pwdProfile ? 'true' : 'false');

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

        fetchReports();
        navigation.navigate('map', { newReport: JSON.stringify(data.report) });

        // Notify other users via socket
        socket.emit('new-report', data.report);
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

  const confirmDeleteReport = (reportId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this report?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteReport(reportId) }
      ]
    );
  };

  const deleteReport = async (reportId: string) => {
    try {
      const res = await fetch(`https://safepasig-backend.onrender.com/reports/${reportId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setReportsData(prev => prev.filter(r => r && r._id !== reportId));
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

  const onRefreshReports = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchReports(),
      new Promise(resolve => setTimeout(resolve, 3000))  
    ]);
    setIsRefreshing(false);
  };

  const renderStatusIcon = (status?: string) => {
      switch (status?.toLowerCase()) {
        case 'true':
          return <CheckCheckIcon size={18} color="#059669" />; // ✔
        case 'false':
          return <XCircle size={18} color="#DC2626" />; // ❌ (red X look)
        case 'pending':
        default:
          return <Clock size={18} color="#797b7d" />; // ⏳
      }    
  }

  return (
    <View style={reportsStyles.container}>
      <Header  />
      <ScrollView
        style={reportsStyles.scrollView}
        contentContainerStyle={reportsStyles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefreshReports}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
      >
        <Text style={reportsStyles.pageTitle}>User Reports</Text>

        {/* Submit Report Card */}
        <View style={reportsStyles.submitCard}>
          <View style={reportsStyles.submitCardContent}>
            <Text style={reportsStyles.submitTitle}>Report a Disaster</Text>
            <Text style={reportsStyles.submitDescription}>
              Help your community by submitting verified images or videos of disasters
            </Text>

            {/* Type Pickers */}
            <View style={{ borderWidth: 1, borderColor: '#fff', borderRadius: 8, marginVertical: 10, overflow: 'hidden' }}>
              <Picker
                selectedValue={selectedType}
                onValueChange={setSelectedType}
                dropdownIconColor="#fff"
                style={{ color: '#fff', backgroundColor: 'transparent' }}
              >
                {disasterTypes.map(type => (<Picker.Item key={type} label={type} value={type} />))}
              </Picker>
            </View>

            <View style={{ borderWidth: 1, borderColor: '#fff', borderRadius: 8, marginVertical: 10, overflow: 'hidden' }}>
              <Picker
                selectedValue={pwdProfile ? 'PWD' : 'Normal'}
                onValueChange={(itemValue) => setPwdProfile(itemValue === 'PWD')}
                dropdownIconColor="#fff"
                style={{ color: '#fff', backgroundColor: 'transparent' }}
              >
                <Picker.Item label="Normal" value="Normal" />
                <Picker.Item label="PWD" value="PWD" />
              </Picker>
            </View>

            <View style={{ borderWidth: 1, borderColor: '#fff', borderRadius: 8, marginVertical: 10, overflow: 'hidden' }}>
              <Picker
                selectedValue={selectedBrgy}
                onValueChange={setSelectedBrgy}
                dropdownIconColor="#fff"
                style={{ color: '#fff', backgroundColor: 'transparent' }}
              >
                <Picker.Item label="Select Barangay" value={null} />
                {barangays.map(b => (<Picker.Item key={b} label={b} value={b} />))}
              </Picker>
            </View>

            <TextInput
              placeholder="Enter street/village"
              placeholderTextColor="gray"
              value={street}
              onChangeText={setStreet}
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 10, color: '#fff' }}
            />

            <TouchableOpacity style={reportsStyles.submitButton} onPress={pickMedia}>
              <Upload size={20} color="#3B82F6" />
              <Text style={reportsStyles.submitButtonText}>Upload Image/Video</Text>
            </TouchableOpacity>

            {imageUri && (<Image source={{ uri: imageUri }} style={{ width: 100, height: 100, marginTop: 10, borderRadius: 8 }} />)}

            <TouchableOpacity
              style={[reportsStyles.submitButton, { marginTop: 10, opacity: isSubmitting ? 0.6 : 1 }]}
              onPress={submitReport}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={reportsStyles.submitButtonText}>Submit Report</Text>
              )}
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
          reportsData.filter(Boolean).map((report, index) => {
            if (!report) return null;
            const isVideo = report.mediaUrl?.endsWith('.mp4');
            return (
              <TouchableOpacity
                key={report._id || index}
                onPress={() => navigation.navigate('map', {
                  focusReport: JSON.stringify({
                    deviceId: report.deviceId,
                    latitude: report.latitude,
                    longitude: report.longitude,
                    type: report.type,
                    description: report.description,
                    isPWD: report.isPWD,
                    _id: report._id,
                  }),
                })}
              >
                <View style={reportsStyles.reportCard}>
                  <View style={[reportsStyles.reportIcon, { backgroundColor: '#4070c8' }]}>
                    <View style={reportsStyles.iconCircle}>
                      {isVideo ? (
                        <Video size={28} color="#B91C1C" />
                      ) : report.mediaUrl ? (
                        <Image
                          source={{ uri: `https://safepasig-backend.onrender.com/${report.mediaUrl}` }}
                          style={{ width: 50, height: 50, borderRadius: 8 }}
                        />
                      ) : (
                        <View style={{ width: 50, height: 50, borderRadius: 8, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={24} color="#333" />
                        </View>
                      )}
                    </View>
                    <View style={reportsStyles.statusBadge}>
                      <Text style={reportsStyles.statusIcon}>
                        {renderStatusIcon(report.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={reportsStyles.reportContent}>
                    <Text style={reportsStyles.locationText}>TYPE: {report.type}</Text>
                    <Text style={reportsStyles.locationText}>{report.description}</Text>
                    <Text style={reportsStyles.locationText}>DEVICE ID: {report.deviceId}</Text>
                    {report.isPWD && (
                      <Text style={{ color: '#10B981', fontWeight: 'bold', marginTop: 4 }}>
                        Person: PWD
                      </Text>
                    )}
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
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
