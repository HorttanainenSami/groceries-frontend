import React, { createContext, useContext, useEffect, useState } from 'react';
import { z } from 'zod';

export const alertSchema = z.object({
  id: z.string(),
  message: z.string(),
  type: z.enum(['error', 'warn', 'success', 'info']),
  timer: z.number().min(1000).max(10000),
});

export type AlertType = z.infer<typeof alertSchema>;


interface AlertContextType {
  alerts: AlertType[];
  setAlerts: React.Dispatch<React.SetStateAction<AlertType[]>>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlertContext = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertContextProvider = ({ children }: React.PropsWithChildren) => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
 

  return (
    <AlertContext.Provider
      value={{ alerts, setAlerts}}>
      {children}
    </AlertContext.Provider>
  );
};
