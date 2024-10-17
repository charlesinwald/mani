import {StackScreenProps} from '@react-navigation/stack';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Password: undefined;
};

export type RootTabParamList = {
  Entries: undefined;
  ChecklistEntries: undefined;
  Jump: undefined;
  SettingsStack: undefined;
  EntrySingle: {id: string; newEntry?: boolean;};
  ChecklistEntrySingle: {id: string; newEntry?: boolean; type: string};
};

export type SettingsStackParamList = {
  Settings: undefined;
  SetPassword: undefined;
  ChangePassword: undefined;
  RemovePassword: undefined;
};

export type SettingsStackScreens =
  | 'Settings'
  | 'SetPassword'
  | 'ChangePassword'
  | 'RemovePassword';

// Root Stack
export type PasswordProps = StackScreenProps<RootStackParamList, 'Password'>;

// Root Bottom Tab Screens
export type EntriesProps = BottomTabScreenProps<RootTabParamList, 'Entries'>;
export type ChecklistEntriesProps = BottomTabScreenProps<
  RootTabParamList,
  'ChecklistEntries'
>;
export type JumpProps = BottomTabScreenProps<RootTabParamList, 'Jump'>;
export type EntrySingleProps = BottomTabScreenProps<
  RootTabParamList,
  'EntrySingle'
>;
export type ChecklistEntrySingleProps = BottomTabScreenProps<
  RootTabParamList,
  'ChecklistEntrySingle'
>;

// Settings Stack Screens
export type SettingsProps = StackScreenProps<
  SettingsStackParamList,
  'Settings'
>;
export type SetPasswordProps = StackScreenProps<
  SettingsStackParamList,
  'SetPassword'
>;
export type ChangePasswordProps = StackScreenProps<
  SettingsStackParamList,
  'ChangePassword'
>;
export type RemovePasswordProps = StackScreenProps<
  SettingsStackParamList,
  'RemovePassword'
>;
