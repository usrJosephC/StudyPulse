import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { RootTabs } from './RootTabs';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginPage}
      />

      <Stack.Screen
        name="Register"
        component={RegisterPage}
      />

      <Stack.Screen
        name="Main"
        component={RootTabs}
      />
    </Stack.Navigator>
  );
}