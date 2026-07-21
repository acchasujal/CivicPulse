import React from 'react';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { QueueRow } from '../../design-system/patterns/government/QueueRow';

export const GovernmentQueuePage: React.FC = () => {
  usePageTitle('Executive Queue — Municipal Portal');

  return (
    <table className="w-full text-left font-sans">
      <thead>
        <tr className="border-b border-neutral-200 text-xs font-semibold text-neutral-700 bg-neutral-100/50">
          <th className="px-4 py-3">Case ID</th>
          <th className="px-4 py-3">Title</th>
          <th className="px-4 py-3">Department</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3">SLA Clock</th>
          <th className="px-4 py-3 text-right">Action</th>
        </tr>
      </thead>
      <tbody>
        <QueueRow
          caseId="CP-2026-881"
          title="Water Supply Line Burst"
          department="Jal Board"
          ageDays={1}
          slaDueHours={14}
          statusLabel="Assigned"
          isHighRisk
        />
        <QueueRow
          caseId="CP-2026-882"
          title="Main Street Light Outage"
          department="Electrical Dept"
          ageDays={2}
          slaDueHours={-4}
          statusLabel="Overdue Review"
        />
      </tbody>
    </table>
  );
};

export default GovernmentQueuePage;
