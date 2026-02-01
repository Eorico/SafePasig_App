import { Drawer } from 'expo-router/drawer';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerType: 'front',          
        overlayColor: 'rgba(0,0,0,0.5)',
        drawerStyle: {
          width: 280,
        },
      }}
    >
      <Drawer.Screen name="(tabs)" options={{ title: 'Settings' }} />
    </Drawer>
  );
}
