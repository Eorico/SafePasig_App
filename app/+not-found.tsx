import { Stack, useRouter } from "expo-router";
import { Text, View, Pressable } from "react-native";
import { notFound } from "@/app/appStyles/not.found.style";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={notFound.NF_container}>
        <Text style={notFound.NF_text}>Oops! Page not Found.</Text>

        <Pressable 
          style={notFound.NF_link}
          onPress={(() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/map');
            }
          })}
        >
          <Text>Go Back!</Text>
        </Pressable>
      </View>
    </>
  );
}
