import { Stack, Redirect } from 'expo-router';
import { TaskContextProvider } from '@/contexts/taskContext';
import useAuth from '@/hooks/useAuth';
import { RelationProvider } from '@/contexts/RelationContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { SyncContextProvider } from '@/contexts/SyncContext';

export default function RootLayout() {
  const data = useAuth();
  if (!data?.user) return <Redirect href="/signin" />;
  return (
    <SocketProvider>
      <SyncContextProvider>
        <RelationProvider>
          <TaskContextProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </TaskContextProvider>
        </RelationProvider>
      </SyncContextProvider>
    </SocketProvider>
  );
}
