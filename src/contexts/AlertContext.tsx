import { AlertColor, SxProps, Theme } from '@mui/material';
import { createContext, useState, ReactNode, useMemo, useCallback } from 'react';

const ALERT_TIME = 5000;

type AlertProps = {
  title?: string;
  text?: string;
  isOpen?: boolean;
  severity?: AlertColor;
  containerStyle?: SxProps<Theme>;
  contentStyle?: SxProps<Theme>;
};

type AlertContextType = {
  alert: AlertProps;
  setAlert: (alert?: AlertProps) => void;
};

const initialState: AlertProps = {
  title: '',
  text: '',
  isOpen: false,
  severity: 'error',
  containerStyle: {},
  contentStyle: {}
};

export const AlertContext = createContext<AlertContextType>({alert: { ...initialState}, setAlert: () => {}});

export const AlertProvider = ({children}: {children: ReactNode}) => {
  const [error, setError] = useState<AlertProps | undefined>(initialState);

  const setAlert = useCallback((alert?: AlertProps) => {

    setError(alert);

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