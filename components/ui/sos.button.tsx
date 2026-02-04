import { Animated, TouchableOpacity, View, Text } from 'react-native';
import { useRef, useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react-native';
import { useRouter, useSegments } from 'expo-router';
import { _layoutStyles } from '@/appStyles/_layout.style';

export function SosTabButton(props: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const segments = useSegments(); // current route segments
  const [isSelected, setIsSelected] = useState(false);

  // Check if current tab is SOS
  useEffect(() => {
    // last segment is the current tab name
    setIsSelected(segments[segments.length - 1] === 'sos');
  }, [segments]);

  const handlePress = () => {
    // Bounce animation
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
    ]).start();

    // Trigger tab navigation
    props.onPress?.();
  };

  return (
    <TouchableOpacity
      {...props}
      onPress={handlePress}
      activeOpacity={0.8}
      style={{ alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: -35 }}
    >
      {/* Icon */}
      <Animated.View style={{ transform: [{ scale }] }}>
        <View
          style={[
            _layoutStyles.sosIconInner,
            { backgroundColor: isSelected ? '#DC2626' : '#b90707' },
          ]}
        >
          <AlertCircle size={28} color="#FFFFFF" />
        </View>
      </Animated.View>

      {/* Label */}
      <Text
        style={{
          marginTop: 15,
          fontSize: 11,
          fontWeight: '600',
          color: isSelected ? '#DC2626' : '#6B7280',
        }}
      >
        SOS
      </Text>
    </TouchableOpacity>
  );
}
