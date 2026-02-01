import { Stack } from 'expo-router';
import { colors } from '@/lib/theme';

export default function AssessmentLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.foreground,
      }}
    />
  );
}






