import { Slot } from "expo-router";
import { useEffect} from 'react';
import { TaskContextProvider} from '@/contexts/taskContext';
import AlertStack from '@/components/Alert/AlertStack';
import { AuthContextProvider} from '@/contexts/AuthenticationContext';
import { AlertContextProvider} from '@/contexts/AlertContext';

export default function RootLayout() {
  return (
      <AlertContextProvider>
        <AuthContextProvider>
          <Slot />
          <AlertStack />
        </AuthContextProvider>
      </AlertContextProvider>
  );
}
