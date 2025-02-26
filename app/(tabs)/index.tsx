import React, { useEffect } from 'react';
import Constants from 'expo-constants';
import HomeScreen from '../screens/HomeScreen';

const App: React.FC = () => {
  useEffect(() => {
    console.log('Expo Config:', Constants.expoConfig);
  }, []);

  return <HomeScreen />;
};

export default App;