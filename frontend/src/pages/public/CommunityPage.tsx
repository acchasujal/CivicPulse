import React from 'react';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { CommunityActivityFeed } from '../../features/community/components/CommunityActivityFeed';

export const CommunityPage: React.FC = () => {
  usePageTitle('Community Collaboration & Verification Hub — CivicPulse');

  return (
    <div className="space-y-6 font-sans py-2">
      <CommunityActivityFeed />
    </div>
  );
};

export default CommunityPage;
