import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";
import { notFound } from "@/appStyles/not.found.style";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }}/>
      <View style={notFound.NF_container}>
        <Text style={notFound.NF_text}>Oops! Page not Found.</Text>
        <Link href='/(drawer-settings)/(tabs)/map' style={notFound.NF_link}>
          <Text>Go Back!</Text>
        </Link>
      </View>
    </>
  );
}