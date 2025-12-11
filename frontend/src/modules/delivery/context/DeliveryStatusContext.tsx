import { createContext, useContext, useState, ReactNode } from 'react';

interface DeliveryStatusContextType {
  isOnline: boolean;
  setIsOnline: (status: boolean) => void;
}

const DeliveryStatusContext = createContext<DeliveryStatusContextType | undefined>(undefined);

export function DeliveryStatusProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <DeliveryStatusContext.Provider value={{ isOnline, setIsOnline }}>
      {children}
    </DeliveryStatusContext.Provider>
  );
}

export function useDeliveryStatus() {
  const context = useContext(DeliveryStatusContext);
  if (context === undefined) {
    throw new Error('useDeliveryStatus must be used within a DeliveryStatusProvider');
  }
  return context;
}

