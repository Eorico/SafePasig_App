import { View, Text, TouchableOpacity, ImageBackground, Alert } from 'react-native';
import { Shield, Settings2 } from 'lucide-react-native';
import { HeaderProps } from '@/app/entities/header.props';
import { headerStyles } from '@/app/appStyles/header.style';

export default function Header({ onMenuPress, currentUser, setCurrentUser }: HeaderProps) {
  // Default isPWD flag
  const isPWD = currentUser?.isPWD ?? false;

  // Toggle PWD
  const handleTogglePWD = async () => {
    if (!currentUser?.id || !currentUser?.token) return;

    const newPWD = !currentUser.isPWD; // toggle

    try {
      const res = await fetch(`https://safepasig-backend.onrender.com/reports/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({ isPWD: newPWD }),
      });

      if (!res.ok) throw new Error('Failed to update PWD status');

      setCurrentUser({ ...currentUser, isPWD: newPWD });
      Alert.alert('Success', `You are now ${newPWD ? 'marked' : 'unmarked'} as PWD.`);
    } catch (err) {
      console.error('Error toggling PWD:', err);
      Alert.alert('Error', 'Could not update PWD status.');
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/images/pasigbg.png')}
      style={headerStyles.header}
      imageStyle={{ opacity: 0.3 }} // fade effect
    >
      <TouchableOpacity onPress={onMenuPress} style={headerStyles.menuButton}>
        <Settings2 size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={headerStyles.titleContainer}>
        <Text style={headerStyles.title}>SafePasig</Text>
        <Text style={headerStyles.subtitle}>Disaster Response System</Text>
      </View>

      <TouchableOpacity style={headerStyles.badge} onPress={handleTogglePWD}>
        <Shield size={16} color={isPWD ? '#10B981' : '#3B82F6'} />
        <Text style={headerStyles.badgeText}>{currentUser.isPWD ? 'PWD' : 'Mark PWD'}</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}
