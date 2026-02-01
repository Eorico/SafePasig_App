import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Header from '@/components/header';
import { Upload, Image, Video, AlertTriangle } from 'lucide-react-native';
import { reportsStyles } from '@/appStyles/reports.style';
import { reports } from '@/components/reportsObj';
import { useNavigation } from 'expo-router';

export default function ReportsScreen() {
  const navigation = useNavigation<any>();
  return (
    <View style={reportsStyles.container}>
      <Header onMenuPress={() => navigation.openDrawer()}/>
      <ScrollView style={reportsStyles.scrollView} contentContainerStyle={reportsStyles.content}>
        <Text style={reportsStyles.pageTitle}>User Reports</Text>

        <View style={reportsStyles.submitCard}>
          <View style={reportsStyles.submitCardContent}>
            <Text style={reportsStyles.submitTitle}>Report a Disaster</Text>
            <Text style={reportsStyles.submitDescription}>
              Help your community by submitting verified images or videos of disasters
            </Text>
            <TouchableOpacity style={reportsStyles.submitButton}>
              <Upload size={20} color="#3B82F6" />
              <Text style={reportsStyles.submitButtonText}>Submit Report</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={reportsStyles.protectionCard}>
          <View style={reportsStyles.protectionHeader}>
            <AlertTriangle size={16} color="#92400E" />
            <Text style={reportsStyles.protectionTitle}>Anti-Troll Protection</Text>
          </View>
          <Text style={reportsStyles.protectionText}>
            All submissions require photo/video and are scanned using AI to detect fake or misleading content. False reports will be flagged.
          </Text>
        </View>

        <View style={reportsStyles.reportsSection}>
          <Text style={reportsStyles.sectionTitle}>Recent Reports</Text>

          {reports.map((report) => (
            <View key={report.id} style={reportsStyles.reportCard}>
              <View style={[reportsStyles.reportIcon, { backgroundColor: report.bgColor }]}>
                <View style={reportsStyles.iconCircle}>
                  {report.icon === '🖼️' ? (
                    <Image size={28} color={report.color} />
                  ) : (
                    <Video size={28} color={report.color} />
                  )}
                </View>
                <View
                  style={[
                    reportsStyles.statusBadge,
                    report.status === 'Verified'
                      ? reportsStyles.verifiedBadge
                      : reportsStyles.pendingBadge,
                  ]}>
                  <Text
                    style={[
                      reportsStyles.statusIcon,
                      report.status === 'Verified'
                        ? reportsStyles.verifiedIcon
                        : reportsStyles.pendingIcon,
                    ]}>
                    {report.status === 'Verified' ? '✓' : '⏱'}
                  </Text>
                </View>
              </View>

              <View style={reportsStyles.reportContent}>
                <View style={reportsStyles.reportHeader}>
                  <View style={[reportsStyles.typeBadge, { backgroundColor: report.bgColor }]}>
                    <Text style={[reportsStyles.typeText, { color: report.color }]}>
                      {report.type}
                    </Text>
                  </View>
                  <Text style={reportsStyles.timeText}>{report.time}</Text>
                </View>
                <Text style={reportsStyles.locationText}>{report.location}</Text>
                <View style={reportsStyles.statusRow}>
                  <View
                    style={[
                      reportsStyles.statusPill,
                      report.status === 'Verified'
                        ? { backgroundColor: '#D1FAE5' }
                        : { backgroundColor: '#FEF3C7' },
                    ]}>
                    <Text
                      style={[
                        reportsStyles.statusText,
                        report.status === 'Verified'
                          ? { color: '#059669' }
                          : { color: '#D97706' },
                      ]}>
                      {report.status}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}