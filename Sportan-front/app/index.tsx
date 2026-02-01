import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  // Redirect based on user role
  switch (role) {
    case 'coach':
      return <Redirect href="/(tabs)/coach" />;
    case 'athlete':
      return <Redirect href="/(tabs)/athlete" />;
    case 'parent':
      return <Redirect href="/(tabs)/parent" />;
    default:
      return <Redirect href="/(tabs)/coach" />;
  }
}

