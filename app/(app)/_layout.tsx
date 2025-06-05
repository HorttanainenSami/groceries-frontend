import { Stack, Redirect } from 'expo-router';
import { TaskContextProvider } from '@/contexts/taskContext';
import useAuth from '@/hooks/useAuth';
import { RelationProvider } from '@/contexts/RelationContext';

export default function RootLayout() {
  const data = useAuth();
  if (!data?.user) return <Redirect href="/signin" />;
  return (
    <RelationProvider>
      <TaskContextProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </TaskContextProvider>
    </RelationProvider>
  );
}
