import React, { useState } from 'react';
import { MapWrapper } from '../../../design-system/patterns/maps/MapWrapper';
import { MapMarker } from '../../../design-system/patterns/maps/MapMarker';
import { LocationSearch } from '../../../design-system/patterns/maps/LocationSearch';
import { CaseGridFeed } from './CaseGridFeed';
import type { Issue } from '../../../api/types';

export interface InteractiveMapExperienceProps {
  issues: Issue[];
  onSelectCase: (id: string) => void;
  className?: string;
}

export const InteractiveMapExperience: React.FC<InteractiveMapExperienceProps> = ({
  issues,
  onSelectCase,
  className,
}) => {
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const selectedIssue = issues.find((i) => i.id === selectedIssueId);

  return (
    <div className={`space-y-3 font-sans ${className || ''}`}>
      <LocationSearch
        onSelectLocation={(locationName: string) => console.log('Selected map location:', locationName)}
      />

      <MapWrapper
        title="Civic Reports Spatial Map View"
        listFallback={<CaseGridFeed issues={issues} onSelectCase={onSelectCase} />}
      >
        <div className="w-full h-full min-h-[420px] bg-neutral-200 relative p-4 flex flex-wrap items-center justify-center gap-3">
          {issues.map((issue) => (
            <MapMarker
              key={issue.id}
              id={issue.id}
              label={issue.issue_type.replace('_', ' ')}
              status={issue.status === 'approved' ? 'resolved' : 'active'}
              latitude={issue.latitude}
              longitude={issue.longitude}
              onClick={() => setSelectedIssueId(issue.id)}
            />
          ))}

          {/* Marker Selection Tooltip Card */}
          {selectedIssue && (
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 max-w-sm bg-white p-4 rounded-lg shadow-modal border border-neutral-200 z-30 animate-fade space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-primary-700">{selectedIssue.id}</span>
                <button
                  type="button"
                  onClick={() => setSelectedIssueId(null)}
                  className="text-xs text-neutral-700 hover:text-neutral-900 font-bold"
                >
                  ✕
                </button>
              </div>

              <h4 className="text-sm font-semibold text-neutral-900 line-clamp-1">
                {selectedIssue.description || selectedIssue.issue_type.replace('_', ' ').toUpperCase()}
              </h4>

              <button
                type="button"
                onClick={() => onSelectCase(selectedIssue.id)}
                className="w-full py-2 bg-primary-700 text-white rounded-md text-xs font-semibold hover:bg-primary-800 transition-colors"
              >
                Inspect Case Detail & Timeline →
              </button>
            </div>
          )}
        </div>
      </MapWrapper>
    </div>
  );
};
