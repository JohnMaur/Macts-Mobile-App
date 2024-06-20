import React, { useEffect, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from './Screen/Login/Login';
import SignUp from './Screen/Login/SignUp';
import { AppDrawer } from './Screen/AppDrawer';

const Stack = createStackNavigator();

const App = () => {
  const navigationRef = useRef(null);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    const backAction = () => {
      if (navigationRef.current && navigationRef.current.getCurrentRoute().name === 'AppDrawer') {
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
          setInitialRoute('AppDrawer');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };

    checkSession();
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
        <Stack.Screen 
          name="AppDrawer" 
          component={AppDrawer} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
