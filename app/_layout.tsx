import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MedicalProfileProvider } from "@/contexts/medical-profile";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="add-condition" 
        options={{ 
          title: "Add Condition",
          presentation: "modal" 
        }} 
      />
      <Stack.Screen 
        name="add-medication" 
        options={{ 
          title: "Add Medication",
          presentation: "modal" 
        }} 
      />
      <Stack.Screen 
        name="consultation/[id]" 
        options={{ 
          title: "Consultation Details"
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <MedicalProfileProvider>
        <GestureHandlerRootView>
          <RootLayoutNav />
        </GestureHandlerRootView>
      </MedicalProfileProvider>
    </QueryClientProvider>
  );
}