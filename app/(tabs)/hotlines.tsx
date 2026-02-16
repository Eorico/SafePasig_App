import { View, Text, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import Header from '@/app/components/ui/header';
import { Phone, Copy } from 'lucide-react-native';
import { hotlinesStyles } from '@/app/appStyles/hotlines.style';
import { hotlines } from '@/app/components/objects/hotlinesObjs';
import { getCategoryColor } from '@/app/functionalities/hotlines/hotlinesColor.img';
import * as Clipboard from 'expo-clipboard';

export default function HotlinesScreen() {

  const handleCall = (number: string) => {
      const cleanedNumber = number.replace(/[^\d+]/g, '');
      Linking.openURL(`tel:${cleanedNumber}`);
    };

  const handleCopy = (number: string) => {
    Clipboard.setStringAsync(number);
    Alert.alert("Copied", `Hotline number ${number} copied to clipboard`);
  };

  return (
    <View style={hotlinesStyles.container}>
      <Header/>
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
                style={[hotlinesStyles.callButton, { backgroundColor: hotline.color }]}
                onPress={() => handleCall(hotline.number)}    
              >
                <Phone size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={hotlinesStyles.copyButton}
                onPress={() => handleCopy(hotline.name)}
              >
                <Copy size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}