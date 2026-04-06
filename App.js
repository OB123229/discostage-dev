import 'react-native-url-polyfill/auto';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { OnboardingProvider } from './src/context/OnboardingContext';
import AppNavigator from './src/navigation';

export default function App() {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </OnboardingProvider>
    </AuthProvider>
  );
}
