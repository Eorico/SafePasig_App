import { View, Text, TouchableOpacity } from 'react-native';
import { Menu, Shield } from 'lucide-react-native';
import { HeaderProps } from '@/entities/header.props';
import { headerStyles } from '@/appStyles/header.style';

export default function Header({ onMenuPress }: HeaderProps) {
  return (
    <View style={headerStyles.header}>
      <TouchableOpacity onPress={onMenuPress} style={headerStyles.menuButton}>
        <Menu size={24} color="#FFFFFF" />
      </TouchableOpacity>
      <View style={headerStyles.titleContainer}>
        <Text style={headerStyles.title}>SafePasig</Text>
        <Text style={headerStyles.subtitle}>Disaster Response System</Text>
      </View>
      <View style={headerStyles.badge}>
        <Shield size={16} color="#3B82F6" />
        <Text style={headerStyles.badgeText}>PWD</Text>
      </View>
    </View>
  );
}
