import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { TodayScreen } from '../screens/TodayScreen';
import { ExercisesScreen } from '../screens/ExercisesScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { ManageHomeScreen } from '../screens/ManageHomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RoutineFormScreen } from '../screens/RoutineFormScreen';
import { CommitmentFormScreen } from '../screens/CommitmentFormScreen';
import { colors, fonts } from '../theme';
import { RootStackParamList, TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const screenHeaderStyle = {
  headerStyle: { backgroundColor: colors.background },
  headerTitleStyle: { fontFamily: fonts.heading, color: colors.text },
  headerShadowVisible: false,
  headerTintColor: colors.text,
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarLabelStyle: { fontFamily: fonts.body, fontSize: 11 },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
            Hoje: 'calendar-outline',
            Exercicios: 'pulse-outline',
            Tarefas: 'checkbox-outline',
          };
          return <Ionicons name={icons[route.name as keyof TabParamList]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Hoje" component={TodayScreen} options={{ title: 'Hoje' }} />
      <Tab.Screen name="Exercicios" component={ExercisesScreen} options={{ title: 'Exercícios' }} />
      <Tab.Screen name="Tarefas" component={TasksScreen} options={{ title: 'Tarefas' }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={screenHeaderStyle}>
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ManageHome" component={ManageHomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RoutineForm" component={RoutineFormScreen} options={{ title: 'Exercício' }} />
      <Stack.Screen name="CommitmentForm" component={CommitmentFormScreen} options={{ title: 'Tarefa' }} />
    </Stack.Navigator>
  );
}
