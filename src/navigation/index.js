import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

import WelcomeScreen from '../screens/WelcomeScreen';
import AuthScreen from '../screens/AuthScreen';
import LocationScreen from '../screens/LocationScreen';
import RoleScreen from '../screens/RoleScreen';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import SearchScreen from '../screens/SearchScreen';
import ProfileScreen from '../screens/ProfileScreen';
import UploadScreen from '../screens/UploadScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function PostTabButton({ onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.postTabBtn}
      activeOpacity={0.85}
    >
      <View style={styles.postBtnShadow}>
        <LinearGradient
          colors={['#C084FC', '#7B2FBE', '#5B1F9E']}
          style={styles.postBtnGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={28} color="white" />
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1E0642',
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
          overflow: 'visible',
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Events: focused ? 'calendar' : 'calendar-outline',
            Explore: focused ? 'compass' : 'compass-outline',
            Search: focused ? 'search' : 'search-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Events" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen
        name="Post"
        component={UploadScreen}
        options={{
          tabBarLabel: () => null,
          tabBarButton: (props) => <PostTabButton {...props} />,
        }}
      />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function LoadingScreen() {
  return (
    <LinearGradient colors={['#1a0533', '#2D0A5C', '#1a0533']} style={{ flex: 1 }} />
  );
}

export default function AppNavigator() {
  const { user, profile, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  const isOnboarded = user && profile?.role && profile?.town;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!user ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Location" component={LocationScreen} />
            <Stack.Screen name="Role" component={RoleScreen} />
          </>
        ) : !isOnboarded ? (
          <>
            <Stack.Screen name="Location" component={LocationScreen} />
            <Stack.Screen name="Role" component={RoleScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Analytics" component={AnalyticsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  postTabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postBtnShadow: {
    marginBottom: 18,
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.65,
    shadowRadius: 12,
    elevation: 10,
    borderRadius: 28,
  },
  postBtnGradient: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
