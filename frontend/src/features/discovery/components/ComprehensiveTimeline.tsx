import React from 'react';
import { Timeline } from '../../../design-system/composites/timeline/Timeline';
import { StatusEvent } from '../../../design-system/composites/timeline/StatusEvent';
import { GovernmentEvent } from '../../../design-system/composites/timeline/GovernmentEvent';
import { AIEvent } from '../../../design-system/composites/timeline/AIEvent';
import { RepairEvent } from '../../../design-system/composites/timeline/RepairEvent';
import { VerificationEvent } from '../../../design-system/composites/timeline/VerificationEvent';
import type { IssueDetailResponse } from '../../../api/types';

export interface ComprehensiveTimelineProps {
  detail: IssueDetailResponse;
  className?: string;
}

export const ComprehensiveTimeline: React.FC<ComprehensiveTimelineProps> = ({ detail, className }) => {
  const issue = detail.issue;

  return (
    <div className={`p-6 bg-white border border-neutral-200 rounded-lg shadow-subtle font-sans space-y-4 ${className || ''}`}>
      <h3 className="text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">
        Case Lifecycle Narrative Timeline
      </h3>

      <Timeline>
        {/* Event 1: Initial Submission */}
        <StatusEvent
          statusLabel="Evidence Captured & Registered"
          timestamp={new Date(issue.created_at).toLocaleString()}
          description={`Cryptographic hash generated. Initial credibility score: ${(issue.credibility_score * 100).toFixed(0)}%.`}
        />

        {/* Event 2: AI Classification Inference */}
        <AIEvent
          claim={`Classified as ${issue.issue_type.replace('_', ' ').toUpperCase()}`}
          confidencePercent={94}
          timestamp="System Automated"
          explanation="Multi-layer visual neural model evaluated hazard geometry and safety risk classification."
        />

        {/* Event 3: Institutional Acknowledgment */}
        {issue.status !== 'classified' && (
          <GovernmentEvent
            title="Executive Dispatch Issued to Municipal Directorate"
            department="Public Works & Infrastructure Dept"
            officerName="Duty Inspector Desk"
            timestamp="Acknowledged"
            officialDirective="Work order scheduled for site inspection and repair crew assignment."
          />
        )}

        {/* Event 4: Repair Evidence Pair (if approved) */}
        {issue.status === 'approved' && (
          <RepairEvent
            departmentName="Municipal Repair Crew #4"
            timestamp="Work Completed"
            notes="Asphalt resurfaced and sealed. Pedestrian safety restored."
          />
        )}

        {/* Event 5: Community Verification Gate */}
        {issue.status === 'approved' && (
          <VerificationEvent
            verifierName="Citizen Audit Panel"
            timestamp="Verified"
            criteriaChecked={[
              'Physical road hazard resolved',
              'Before/After evidence alignment confirmed',
              'Location coordinates matched',
            ]}
          />
        )}
      </Timeline>
    </div>
  );
};
