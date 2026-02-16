import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { Shield } from 'lucide-react-native';
import { headerStyles } from '@/app/appStyles/header.style';

export default function Header() {
  return (
    <ImageBackground
      source={require('@/assets/images/pasigbg.png')} // your image
      style={headerStyles.header}
      resizeMode="cover"
    >
      {/* Blue fade overlay */}
      <View style={headerStyles.overlay} />

      {/* Header content */}
      <View style={headerStyles.content}>
        <Text  style={headerStyles.menuButton}>
          <Shield size={24} color="#FFFFFF" />
        </Text>

        <View style={headerStyles.titleContainer}>
          <Text style={headerStyles.title}>SafePasig</Text>
          <Text style={headerStyles.subtitle}>Disaster Response System</Text>
        </View>

      </View>
    </ImageBackground>
  );
}
