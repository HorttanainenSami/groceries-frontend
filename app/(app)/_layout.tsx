import { Stack, Redirect } from "expo-router";
import { useEffect} from 'react';
import { TaskContextProvider} from '@/contexts/taskContext';
import { AuthContextProvider, useAuth} from '@/contexts/AuthenticationContext';

export default function RootLayout() {
  const data = useAuth();
  useEffect(()=> {
    console.log(data);
  },[data.user]);
  if(!data?.user) return <Redirect href='/signin' />
  return (
    <TaskContextProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </TaskContextProvider>
  );
}
