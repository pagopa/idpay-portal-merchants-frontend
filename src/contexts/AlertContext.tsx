import { AlertColor } from '@mui/material';
import { createContext, useState, ReactNode, useMemo, useCallback } from 'react';

const ALERT_TIME = 5000;

type AlertProps = {
  title?: string;
  text?: string;
  isOpen?: boolean;
  severity?: AlertColor;
};

type AlertContextType = {
  alert: AlertProps;
  setAlert: (alert?: AlertProps) => void;
};

const initialState: AlertProps = {
  title: '',
  text: '',
  isOpen: false,
  severity: 'error'
};

export const AlertContext = createContext<AlertContextType>({alert: { ...initialState}, setAlert: () => {}});

export const AlertProvider = ({children}: {children: ReactNode}) => {
  const [error, setError] = useState<AlertProps>(initialState);

  const setAlert = useCallback((alert?: AlertProps) => {
    setError({...alert});

    setTimeout(() => {
      setError(prev => ({ ...prev, isOpen: false}));
    }, ALERT_TIME);
  }, []);

  const value = useMemo(() => ({ alert: {...error}, setAlert}), [error]);

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};