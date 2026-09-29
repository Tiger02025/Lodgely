import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from '../types/navigation';
import HomeScreen from '../screens/HomeScreen';
import SavedPropertiesScreen from '../screens/SavedPropertiesScreen';
import MatchmakingScreen from '../screens/MatchmakingScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/brand';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'code';
          switch (route.name) {
            case 'HomeTab':
              iconName = 'home';
              break;
            case 'SavedTab':
              iconName = 'bookmark';
              break;
            case 'MatchmakingTab':
              iconName = 'people';
              break;
            case 'NotificationsTab':
              iconName = 'notifications';
              break;
            case 'ProfileTab':
              iconName = 'person';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.divider,
          paddingBottom: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="SavedTab" component={SavedPropertiesScreen} options={{ title: 'Saved' }} />
      <Tab.Screen name="MatchmakingTab" component={MatchmakingScreen} options={{ title: 'Matchmaking' }} />
      <Tab.Screen name="NotificationsTab" component={NotificationsScreen} options={{ title: 'Notifications' }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
