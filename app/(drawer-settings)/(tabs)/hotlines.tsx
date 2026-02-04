import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import Header from '@/app/components/ui/header';
import { Phone, Copy } from 'lucide-react-native';
import { hotlinesStyles } from '@/app/appStyles/hotlines.style';
import { hotlines } from '@/app/components/objects/hotlinesObjs';
import { useNavigation } from 'expo-router';

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Police':
      return '#DBEAFE';
    case 'Disaster':
      return '#FEE2E2';
    case 'Fire':
      return '#FFEDD5';
    case 'Medical':
      return '#FECACA';
    default:
      return '#F3F4F6';
  }
};

export default function HotlinesScreen() {
  const navigation = useNavigation<any>();
  return (
    <View style={hotlinesStyles.container}>
      <Header onMenuPress={() => navigation.openDrawer()}/>
      <ScrollView style={hotlinesStyles.scrollView} contentContainerStyle={hotlinesStyles.content}>
        <Text style={hotlinesStyles.pageTitle}>Emergency Hotlines</Text>

        {hotlines.map((hotline) => (
          <View key={hotline.id} style={hotlinesStyles.hotlineCard}>
            <View style={hotlinesStyles.hotlineHeader}>
              <View style={hotlinesStyles.hotlineInfo}>
                <View style={hotlinesStyles.hotlineTitleRow}>
                  <Text style={hotlinesStyles.hotlineName}>{hotline.name}</Text>
                  <View style={hotlinesStyles.availableBadge}>
                    <Text style={hotlinesStyles.availableText}>{hotline.available}</Text>
                  </View>
                </View>
                <Text style={hotlinesStyles.hotlineNumber}>{hotline.number}</Text>
                <View
                  style={[
                    hotlinesStyles.categoryBadge,
                    { backgroundColor: getCategoryColor(hotline.category) },
                  ]}>
                  <Text
                    style={[
                      hotlinesStyles.categoryText,
                      { color: hotline.color },
                    ]}>
                    {hotline.category}
                  </Text>
                </View>
              </View>
            </View>

            <View style={hotlinesStyles.actionButtons}>
              <TouchableOpacity
                style={[hotlinesStyles.callButton, { backgroundColor: hotline.color }]}>
                <Phone size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={hotlinesStyles.copyButton}>
                <Copy size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}