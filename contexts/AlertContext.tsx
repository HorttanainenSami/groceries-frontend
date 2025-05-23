import React, { createContext, useContext, useEffect, useState } from 'react';
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
  getFromQueue: () => AlertType | undefined;
  alertsDisplaying: AlertDisplayType[];
  displayAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
export interface AlertDisplayType {
  Alert: AlertType;
  timer: number;
}
export const AlertContextProvider = ({ children }: React.PropsWithChildren) => {
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [alertsDisplaying, setAlertsDisplaying] = useState<AlertDisplayType[]>(
    []
  );
  const maxAlerts = 2;

  useEffect(() => {
    displayAlert();
  }, [alerts, alertsDisplaying]);

  const displayAlert = () => {
    if (alertsDisplaying.length >= maxAlerts) return;
    const initAlert = getFromQueue();
    console.log('initAlert', initAlert);
    if (!initAlert) return;

    const alertTimer = setTimeout(() => {
      cleanSelf(initAlert.id);
    }, initAlert.timer);
    setAlertsDisplaying((prevAlerts) => [
      ...prevAlerts,
      { Alert: initAlert, timer: alertTimer },
    ]);
  };
  const cleanSelf = (id: string) => {
    const alertObject = alertsDisplaying.find((a) => a.Alert.id === id);
    clearTimeout(alertObject?.timer);
    setAlertsDisplaying((prevAlerts) =>
      prevAlerts.filter((a) => a.Alert.id !== id)
    );
  };
  const addAlert = ({ message, type, timer = 10000 }: addAlertProps) => {
    const id =
      Date.now().toString() + Math.random().toString(36).substring(2, 15);
    const newAlert = { id, message, type, timer };

    const parsedAlert = alertSchema.parse(newAlert);
    console.log('set alert');
    setAlerts((prevAlerts) => [...prevAlerts, parsedAlert]);
  };

  const getFromQueue = () => {
    if (alerts.length > 0) {
      const initAlerts = [...alerts];
      const item = initAlerts.shift();
      setAlerts(initAlerts);
      return item;
    }
    return undefined;
  };
  const removeAlert = (id: string) => {
    cleanSelf(id);
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
  };

  return (
    <AlertContext.Provider
      value={{ alerts, alertsDisplaying,displayAlert, addAlert, removeAlert, getFromQueue }}>
      {children}
    </AlertContext.Provider>
  );
};
