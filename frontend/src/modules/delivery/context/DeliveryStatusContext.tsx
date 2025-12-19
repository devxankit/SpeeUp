import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { updateStatus, getDeliveryProfile } from '../../../services/api/delivery/deliveryService';

interface DeliveryStatusContextType {
  isOnline: boolean;
  setIsOnline: (status: boolean) => void;
  toggleStatus: () => Promise<void>;
}

const DeliveryStatusContext = createContext<DeliveryStatusContextType | undefined>(undefined);

export function DeliveryStatusProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnlineLocal] = useState(false);

  // Fetch initial status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const profile = await getDeliveryProfile();
        setIsOnlineLocal(profile.isOnline || false);
      } catch (error) {
        console.error("Failed to fetch initial status", error);
      }
    };
    fetchStatus();
  }, []);

  const toggleStatus = async () => {
    const newStatus = !isOnline;
    // Optimistic update
    setIsOnlineLocal(newStatus);
    try {
      await updateStatus(newStatus);
    } catch (error) {
      console.error("Failed to update status", error);
      // Revert on failure
      setIsOnlineLocal(!newStatus);
    }
  };

  const setIsOnline = (status: boolean) => {
    // Direct setting if needed, but prefer toggleStatus for API sync
    setIsOnlineLocal(status);
    updateStatus(status).catch(err => console.error(err));
  };

  return (
    <DeliveryStatusContext.Provider value={{ isOnline, setIsOnline, toggleStatus }}>
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

