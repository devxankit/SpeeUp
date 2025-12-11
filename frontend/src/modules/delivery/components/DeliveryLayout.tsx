import { ReactNode } from 'react';
import DeliveryBottomNav from './DeliveryBottomNav';
import { DeliveryStatusProvider, useDeliveryStatus } from '../context/DeliveryStatusContext';
import { DeliveryUserProvider } from '../context/DeliveryUserContext';

interface DeliveryLayoutContentProps {
  children: ReactNode;
}

function DeliveryLayoutContent({ children }: DeliveryLayoutContentProps) {
  const { isOnline } = useDeliveryStatus();

  return (
    <div className={`flex flex-col min-h-screen bg-neutral-100 transition-all duration-300 ${!isOnline ? 'grayscale' : ''}`}>
      <main className="flex-1 overflow-y-auto scrollbar-hide pb-20">
        {children}
      </main>
      <DeliveryBottomNav />
    </div>
  );
}

interface DeliveryLayoutProps {
  children: ReactNode;
}

export default function DeliveryLayout({ children }: DeliveryLayoutProps) {
  return (
    <DeliveryStatusProvider>
      <DeliveryUserProvider>
        <DeliveryLayoutContent>{children}</DeliveryLayoutContent>
      </DeliveryUserProvider>
    </DeliveryStatusProvider>
  );
}




