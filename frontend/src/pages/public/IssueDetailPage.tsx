import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { useIssueDetail } from '../../api/queries';
import { CaseDetailHeader } from '../../features/discovery/components/CaseDetailHeader';
import { ComprehensiveEvidenceGallery } from '../../features/discovery/components/ComprehensiveEvidenceGallery';
import { ComprehensiveTimeline } from '../../features/discovery/components/ComprehensiveTimeline';
import { LoadingIndicator } from '../../design-system/primitives/feedback/LoadingIndicator';
import { ErrorState } from '../../design-system/primitives/feedback/ErrorState';
import { Button } from '../../design-system/primitives/buttons/Button';
import { ArrowLeft } from 'lucide-react';

export const IssueDetailPage: React.FC = () => {
  const { id = 'CP-2026-001' } = useParams();
  const navigate = useNavigate();
  usePageTitle(`Case #${id} Detail & Timeline — nivaran`);
  const { data, isLoading, isError, refetch } = useIssueDetail(id);

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <LoadingIndicator label={`Loading case record #${id}...`} size="lg" />
      </div>
    );
  }

  if (isError || !data?.issue) {
    return (
      <ErrorState
        title="Case Not Found"
        description={`Civic case #${id} could not be retrieved from the backend API.`}
        onRetry={() => refetch()}
      />
    );
  }

  const issue = data.issue;
  const cluster = data.cluster;

  return (
    <div className="space-y-6 font-sans py-2">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          leadingIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Discovery
        </Button>
      </div>

      <CaseDetailHeader issue={issue} areaLabel={cluster?.area_label} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComprehensiveEvidenceGallery issue={issue} />
        <ComprehensiveTimeline detail={data} />
      </div>
    </div>
  );
};

export default IssueDetailPage;
