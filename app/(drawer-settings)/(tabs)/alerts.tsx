import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Header from '@/components/header';
import { X } from 'lucide-react-native';
import { alerts } from '@/components/alertsObjs';
import { alertStyles } from '@/appStyles/alerts.style';
import { useNavigation } from 'expo-router';

export default function AlertsScreen() {
  const navigation = useNavigation<any>();
  return (
    <View style={alertStyles.container}>
      <Header onMenuPress={() => navigation.openDrawer()}/>
      <ScrollView style={alertStyles.scrollView} contentContainerStyle={alertStyles.content}>
        <Text style={alertStyles.pageTitle}>Active Alerts</Text>

        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <View
              key={alert.id}
              style={[
                alertStyles.alertCard,
                { backgroundColor: alert.color, borderLeftColor: alert.color },
              ]}>
              <View style={alertStyles.alertHeader}>
                <View style={alertStyles.alertTitleRow}>
                  <Icon size={24} color="#FFFFFF" />
                  <Text style={alertStyles.alertTitle}>{alert.title}</Text>
                </View>
                <TouchableOpacity style={alertStyles.closeButton}>
                  <X size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {alert.category && (
                <View style={alertStyles.categoryBadge}>
                  <Text style={alertStyles.categoryText}>{alert.category}</Text>
                </View>
              )}

              <Text style={alertStyles.alertDescription}>{alert.description}</Text>

              {alert.location && (
                <View style={alertStyles.alertFooter}>
                  <View style={alertStyles.locationBadge}>
                    <Text style={alertStyles.locationText}>📍 {alert.location}</Text>
                  </View>
                  <Text style={alertStyles.timeText}>{alert.time}</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}