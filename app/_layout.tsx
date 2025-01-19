import { Stack } from "expo-router";
import {useContext} from 'react';
import { TaskContextProvider} from '@/contexts/taskContext';

export default function RootLayout() {
  return (
    <TaskContextProvider>
      <Stack />
    </TaskContextProvider>
  );
}
