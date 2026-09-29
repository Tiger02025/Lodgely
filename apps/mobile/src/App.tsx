import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from 'react-query';
import { NavigationContainerRef } from '@react-navigation/native';

import {
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts as useNunitoFonts,
} from '@expo-google-fonts/nunito';
import {
  Inter_400Regular,
  Inter_500Medium,
  useFonts as useInterFonts,
} from '@expo-google-fonts/inter';

import LoginScreen from './screens/LoginScreen';
import RegisterStudentScreen from './screens/RegisterStudentScreen';
import RegisterLandlordScreen from './screens/RegisterLandlordScreen';
import PropertyDetailScreen from './screens/PropertyDetailScreen';
import BookingScreen from './screens/BookingScreen';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import { RootStackParamList } from './types/navigation';
import { colors, fonts } from './theme/brand';

const Stack = createNativeStackNavigator<RootStackParamList>();

const queryClient = new QueryClient();

export type NavigationRef = NavigationContainerRef<RootStackParamList>;
export const navigationRef: NavigationRef = {} as NavigationRef;

export function navigate(name: keyof RootStackParamList, params?: any) {
  navigationRef.navigate(name, params);
}

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    border: colors.border,
    card: colors.white,
    notification: colors.accent,
    primary: colors.primary,
    text: colors.text,
  },
};

function Root() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer ref={navigationRef as any} theme={navigationTheme}>
      <StatusBar style="light" backgroundColor={colors.primary} />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerShadowVisible: false,
          headerTintColor: colors.white,
          headerTitleStyle: { fontFamily: fonts.medium },
        }}
      >
        {token ? (
          <>
            <Stack.Screen name="Main" component={BottomTabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
            <Stack.Screen name="Booking" component={BookingScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="RegisterStudent" component={RegisterStudentScreen} options={{ headerShown: false }} />
            <Stack.Screen name="RegisterLandlord" component={RegisterLandlordScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [nunitoLoaded] = useNunitoFonts({ Nunito_700Bold, Nunito_800ExtraBold });
  const [interLoaded] = useInterFonts({ Inter_400Regular, Inter_500Medium });
  if (!nunitoLoaded || !interLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Root />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
