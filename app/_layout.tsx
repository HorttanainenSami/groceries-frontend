import { Slot } from 'expo-router';
import AlertStack from '@/components/Alert/AlertStack';
import { AuthContextProvider } from '@/contexts/AuthenticationContext';
import { AlertContextProvider } from '@/contexts/AlertContext';
import { SQLiteProvider } from 'expo-sqlite';
import { initDb } from '@/service/LocalDatabase';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="todo" onInit={initDb}>
      <AlertContextProvider>
        <AuthContextProvider>
          <Slot />
          <AlertStack />
        </AuthContextProvider>
      </AlertContextProvider>
    </SQLiteProvider>
  );
}
