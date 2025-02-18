import { Slot } from "expo-router";
import { useEffect} from 'react';
import { TaskContextProvider} from '@/contexts/taskContext';
import AlertStack from '@/components/Alert/AlertStack';
import { AuthContextProvider} from '@/contexts/AuthenticationContext';
import { AlertContextProvider} from '@/contexts/AlertContext';
import { SQLiteProvider } from "expo-sqlite";
import {initDb} from '@/service/LocalDatabase';

export default function RootLayout() {
  return (
      <AlertContextProvider>
        <AuthContextProvider>
          <SQLiteProvider databaseName='todo' onInit={initDb}>
            <Slot />
            <AlertStack />
          </SQLiteProvider>
        </AuthContextProvider>
      </AlertContextProvider>
  );
}
