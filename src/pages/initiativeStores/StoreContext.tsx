import { createContext, useContext, ReactNode, useState } from "react";

interface StoreContextType {
  storeId: string;
  setStoreId: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a PointOfSaleProvider");
  }
  return context;
};

interface ProviderProps {
  children: ReactNode;
}

export const StoreProvider = ({ children }: ProviderProps) => {
  const [storeId, setStoreId] = useState('');

  return (
    <StoreContext.Provider value={{ storeId, setStoreId }}>
      {children}
    </StoreContext.Provider>
  );
};