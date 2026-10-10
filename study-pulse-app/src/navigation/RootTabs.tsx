import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { GroupsScreen } from '../screens/GroupsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors, fonts, spacing } from '../theme';

export type TabParamList = {
  Home: undefined;
  Goals: undefined;
  Groups: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const icons: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  Goals: 'trophy',
  Groups: 'people',
  Profile: 'person',
};

function TabIcon({ name, label, focused }: { name: keyof TabParamList; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
        <Ionicons name={icons[name]} size={20} color={focused ? colors.ink : colors.inkMuted} />
      </View>
      <Text
        style={[styles.tabLabel, focused && styles.tabLabelActive]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.9}
      >
        {label}
      </Text>
    </View>
  );
}

export function RootTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon name="Home" label="Home" focused={focused} /> }} />
      <Tab.Screen name="Goals" component={GoalsScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon name="Goals" label="Goals" focused={focused} /> }} />
      <Tab.Screen name="Groups" component={GroupsScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon name="Groups" label="Groups" focused={focused} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon name="Profile" label="Profile" focused={focused} /> }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.card,
    borderTopWidth: 0,
    height: 88,
    paddingTop: 6,
    paddingBottom: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  tabBarItem: {
    height: 72,
  },
  tabItem: {
    width: 76,
    height: 64,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 4,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.primary,
  },
  tabLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    lineHeight: 14,
    color: colors.inkMuted,
    textAlign: 'center',
    width: 76,
  },
  tabLabelActive: {
    fontFamily: fonts.bodyBold,
    color: colors.ink,
  },
});
