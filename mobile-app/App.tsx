/**
 * Crisis Response App - Main Entry Point
 * React Native mobile app for crisis reporting and monitoring
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import axios from 'axios';
import { CONFIG } from './src/config';

// Globally inject API key for hackathon security validation
axios.defaults.headers.common['X-API-Key'] = CONFIG.API_KEY || 'ciro-secret-key-2026';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ReportScreen from './src/screens/ReportScreen';
import CrisisScreen from './src/screens/CrisisScreen';
import MapScreen from './src/screens/MapScreen';
import AgentLogScreen from './src/screens/AgentLogScreen';
import DispatchScreen from './src/screens/DispatchScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Report') {
            iconName = 'report';
          } else if (route.name === 'Crises') {
            iconName = 'warning';
          } else if (route.name === 'Map') {
            iconName = 'map';
          } else if (route.name === 'Dispatch') {
            iconName = 'notifications-active';
          } else if (route.name === 'Logs') {
            iconName = 'history';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#e91e63',
        tabBarInactiveTintColor: 'gray',
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Report" component={ReportScreen} />
      <Tab.Screen name="Crises" component={CrisisScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Dispatch" component={DispatchScreen} />
      <Tab.Screen name="Logs" component={AgentLogScreen} />
    </Tab.Navigator>
  );
}

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{headerShown: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
