import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Hoje: undefined;
  Exercicios: undefined;
  Tarefas: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  Profile: undefined;
  ManageHome: undefined;
  RoutineForm: { id?: string };
  CommitmentForm: { id?: string };
};
