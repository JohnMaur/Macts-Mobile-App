import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import App from './App'; // Your main App component

export default function Main() {
  return (
    <SafeAreaProvider>
      <App />
    </SafeAreaProvider>
  );
}