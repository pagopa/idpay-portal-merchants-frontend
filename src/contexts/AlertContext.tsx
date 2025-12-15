import { createContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { AlertComponentProps } from '../components/Alert/AlertComponent';

type AlertContextType = {
  alert: AlertComponentProps;
  setAlert: (alert?: AlertComponentProps) => void;
};

const initialState: AlertComponentProps = {
  title: '',
  text: '',
  isOpen: false,
  severity: 'error',
  containerStyle: {},
  contentStyle: {}
};

export const AlertContext = createContext<AlertContextType>({alert: { ...initialState}, setAlert: () => {}});

export const AlertProvider = ({children}: {children: ReactNode}) => {
  const [error, setError] = useState<AlertComponentProps | undefined>(initialState);

  const onClose = useCallback(() => setError(prev => ({ ...prev, isOpen: false})), []);
  const setAlert = useCallback((alert?: AlertComponentProps) => setError(alert), []);

  useEffect(() => {
    if(error?.isOpen) {
      setTimeout(onClose, 3000);
    };
  }, [error]);

  const value = useMemo(() => ({ alert: {...error, onClose}, setAlert}), [error]);

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};