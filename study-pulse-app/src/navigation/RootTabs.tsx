
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { HomeScreen } from '../screens/HomeScreen';
import { GoalsScreen } from '../screens/GoalsScreen';
import { GroupsScreen } from '../screens/GroupsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { fonts } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { NotificationsHost } from '../components/NotificationsHost';

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

function TabIcon({
  name,
  label,
  focused,
  palette,
}: {
  name: keyof TabParamList;
  label: string;
  focused: boolean;
  palette: ReturnType<typeof useTheme>['temaAtual'];
}) {
  return (
    <View style={styles.tabItem}>
      <View style={[styles.iconWrap, focused && { backgroundColor: palette.primary }]}>
        <Ionicons
          name={icons[name]}
          size={20}
          color={focused ? palette.background : palette.inkMuted}
        />
      </View>
      <Text
        style={[styles.tabLabel, { color: focused ? palette.ink : palette.inkMuted }, focused && styles.tabLabelActive]}
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
  const { t } = useTranslation();
  const { temaAtual } = useTheme();

  return (
    <NotificationsHost>
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: [styles.tabBar, { backgroundColor: temaAtual.card, borderTopColor: temaAtual.border }],
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="Home"
              label={t('navigation.tabs.home')}
              focused={focused}
              palette={temaAtual}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Goals"
        component={GoalsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="Goals"
              label={t('navigation.tabs.goals')}
              focused={focused}
              palette={temaAtual}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="Groups"
              label={t('navigation.tabs.groups')}
              focused={focused}
              palette={temaAtual}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name="Profile"
              label={t('navigation.tabs.profile')}
              focused={focused}
              palette={temaAtual}
            />
          ),
        }}
      />
    </Tab.Navigator>
    </NotificationsHost>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
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
  tabLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
    width: 76,
  },
  tabLabelActive: {
    fontFamily: fonts.bodyBold,
  },
});
