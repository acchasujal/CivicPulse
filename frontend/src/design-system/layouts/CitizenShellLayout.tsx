import React from 'react';
import { AppBar } from '../composites/navigation/AppBar';
import { BottomNavigation } from '../composites/navigation/BottomNavigation';
import { Sidebar } from '../composites/navigation/Sidebar';
import { OfflineBanner } from '../primitives/feedback/OfflineBanner';
import { Container } from '../primitives/foundation/Container';
import { cn } from '../../lib/utils';

export interface CitizenShellLayoutProps {
  title?: string;
  isOffline?: boolean;
  activeNav?: 'home' | 'report' | 'my-reports';
  onNavigate?: (tab: 'home' | 'report' | 'my-reports') => void;
  onReportClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const CitizenShellLayout: React.FC<CitizenShellLayoutProps> = ({
  title,
  isOffline = false,
  activeNav = 'home',
  onNavigate,
  onReportClick,
  children,
  className,
}) => {
  return (
    <div className={cn('min-h-screen bg-neutral-50 flex flex-col md:flex-row font-sans text-neutral-900', className)}>
      <Sidebar activeDestination={activeNav} onNavigate={(id) => onNavigate?.(id as any)} />

      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        {isOffline && <OfflineBanner state="offline" pendingCount={1} />}
        <AppBar title={title} isOffline={isOffline} />

        <main className="flex-1 py-6">
          <Container width="reading">{children}</Container>
        </main>

        <BottomNavigation activeTab={activeNav} onNavigate={onNavigate} onReportClick={onReportClick} />
      </div>
    </div>
  );
};
