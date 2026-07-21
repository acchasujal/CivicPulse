import React from 'react';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { AdminDashboardOverview } from '../../features/admin/components/AdminDashboardOverview';

export const AdminPage: React.FC = () => {
  usePageTitle('Platform Administration & Moderation — CivicPulse');

  return (
    <div className="space-y-6 font-sans py-2">
      <AdminDashboardOverview />
    </div>
  );
};

export default AdminPage;
