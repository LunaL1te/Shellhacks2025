import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { MedicalProfileProvider } from "@/contexts/medical-profile-database";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack 
      screenOptions={{ 
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: "#FFFFFF",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        headerTintColor: "#1F2937",
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="add-condition" 
        options={{ 
          title: "Add Condition",
          presentation: "modal",
          headerStyle: {
            backgroundColor: "#FFFFFF",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          },
        }} 
      />
      <Stack.Screen 
        name="add-medication" 
        options={{ 
          title: "Add Medication",
          presentation: "modal",
          headerStyle: {
            backgroundColor: "#FFFFFF",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          },
        }} 
      />
      <Stack.Screen 
        name="consultation/[id]" 
        options={{ 
          title: "Consultation Details",
          headerStyle: {
            backgroundColor: "#FFFFFF",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          },
        }} 
      />
      <Stack.Screen 
        name="database-management" 
        options={{ 
          title: "Database Management",
          presentation: "modal",
          headerStyle: {
            backgroundColor: "#FFFFFF",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          },
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
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="dark" backgroundColor="#FFFFFF" />
          <RootLayoutNav />
        </GestureHandlerRootView>
      </MedicalProfileProvider>
    </QueryClientProvider>
  );
}