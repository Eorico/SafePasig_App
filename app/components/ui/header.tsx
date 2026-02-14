import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { Shield, Settings2 } from 'lucide-react-native';
import { HeaderProps } from '@/app/entities/header.props';
import { headerStyles } from '@/app/appStyles/header.style';

export default function Header({ onMenuPress }: HeaderProps) {
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
        <TouchableOpacity onPress={onMenuPress} style={headerStyles.menuButton}>
          <Settings2 size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={headerStyles.titleContainer}>
          <Text style={headerStyles.title}>SafePasig</Text>
          <Text style={headerStyles.subtitle}>Disaster Response System</Text>
        </View>

      </View>
    </ImageBackground>
  );
}
