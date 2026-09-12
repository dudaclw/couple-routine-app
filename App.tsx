import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Quicksand_500Medium, Quicksand_600SemiBold } from '@expo-google-fonts/quicksand';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginScreen } from './screens/LoginScreen';
import { ProfileSetupScreen } from './screens/ProfileSetupScreen';
import { RootNavigator } from './navigation/RootNavigator';
import { isSupabaseConfigured } from './lib/supabase';
import { colors, fonts } from './theme';

function AppContent() {
  const { session, loading, profile, profileLoading } = useAuth();

  if (loading || (session && profileLoading)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  let content: React.ReactNode = <LoginScreen />;
  if (session) content = profile ? <RootNavigator /> : <ProfileSetupScreen />;

  return <NavigationContainer>{content}</NavigationContainer>;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <View style={styles.center}>
        <Text style={styles.configTitle}>Configuração pendente</Text>
        <Text style={styles.configText}>
          Copie .env.example para .env e preencha EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  configTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.text,
  },
  configText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    opacity: 0.8,
  },
});
