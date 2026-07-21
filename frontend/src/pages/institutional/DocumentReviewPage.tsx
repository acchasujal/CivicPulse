import React from 'react';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { DocumentReviewLayout } from '../../design-system/layouts/DocumentReviewLayout';
import { Button } from '../../design-system/primitives/buttons/Button';
import { EvidenceCard } from '../../design-system/composites/evidence/EvidenceCard';

export const DocumentReviewPage: React.FC = () => {
  usePageTitle('Document Review & Legal Dispatch — CivicPulse');

  return (
    <DocumentReviewLayout
      documentTitle="Executive Notice of Repair Directive"
      documentRef="DISPATCH-CP-2026-99"
      documentContent={
        <div className="space-y-3">
          <p>
            Pursuant to the Municipal Public Works Accountability Act, notice is hereby issued to the Road Maintenance Directorate regarding verified pothole hazards on Main Arterial Sector 62.
          </p>
          <p className="font-semibold text-neutral-900">
            Mandatory Resolution Window: 48 Hours.
          </p>
        </div>
      }
      evidenceContext={
        <EvidenceCard
          id="EV-1"
          title="Verified Road Pothole Photo"
          timestamp="Yesterday"
          locality="Sector 62, Noida"
        />
      }
      actionGate={
        <div className="space-y-2">
          <Button variant="primary" fullWidth>
            Authorize & Execute Dispatch
          </Button>
        </div>
      }
    />
  );
};

export default DocumentReviewPage;
