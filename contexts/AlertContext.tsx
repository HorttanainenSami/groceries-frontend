import React, { createContext, useContext, useState } from 'react';
import { z } from 'zod';

const alertSchema = z.object({
  id: z.string(),
  message: z.string(),
  type: z.enum(['error', 'warn', 'success', 'info']),
  timer: z.number().min(1000).max(10000),
});

export type AlertType = z.infer<typeof alertSchema>;

const addAlertPropsSchema = z.object({
  message: z.string(),
  type: z.enum(['error', 'warn', 'success', 'info']),
  timer: z.number().min(1000).max(10000).optional(),
});
export type addAlertProps = z.infer<typeof addAlertPropsSchema>;

interface AlertContextType {
  alerts: AlertType[];
  addAlert: (alertProps: addAlertProps) => void;
  removeAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertContextProvider = ({ children }: React.PropsWithChildren) => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);

  const addAlert = ({ message, type, timer = 10000 }: addAlertProps) => {
    const id =
      Date.now().toString() + Math.random().toString(36).substring(2, 15);
    const newAlert = { id, message, type, timer };

    const parsedAlert = alertSchema.parse(newAlert);
    console.log('set alert');
    setAlerts((prevAlerts) => [...prevAlerts, parsedAlert]);
  };

  const removeAlert = (id: string) => {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert }}>
      {children}
    </AlertContext.Provider>
  );
};
