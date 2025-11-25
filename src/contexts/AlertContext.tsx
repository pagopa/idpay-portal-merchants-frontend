import { createContext, useState, ReactNode, useMemo, useCallback } from 'react';

const ALERT_TIME = 5000;

type AlertContextType = {
  title: string;
  text: string;
  isOpen: boolean;
  setAlert: (title?: string, text?: string, isOpen?: boolean) => void;
};

const initialState = {title: '', text: '', isOpen: false, setAlert: () => {}};

export const AlertContext = createContext<AlertContextType>(initialState);

export const AlertProvider = ({children}: {children: ReactNode}) => {
  const [error, setError] = useState({title: '', text: '', isOpen: false});

  const setAlert = useCallback((title?: string, text?: string, isOpen?: boolean) => {
    setError({title: title ?? '', text: text ?? '', isOpen: isOpen ?? false});

    setTimeout(() => {
      setError({title: '', text: '', isOpen: false});
    }, ALERT_TIME);
  }, []);

  const value = useMemo(() => ({ ...error, setAlert}), [error]);

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};