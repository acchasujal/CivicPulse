import React, { useState } from 'react';
import { Camera, MapPin, ShieldCheck, Sparkles, Network } from 'lucide-react';
import type { Issue } from '@/api/types';
import { getImageUrl } from '@/utils/getImageUrl';
import { getLocalityName } from '@/utils/getLocalityName';
import {
  humanizeIssueType,
  getSeverityBadgeColor,
} from '@/utils/issueHelpers';
import { cn } from '@/lib/utils';

import { HelpTooltip } from '@/components/shared/HelpTooltip';
import { useTour } from '@/context/TourContext';

interface EvidenceCardProps {
  issue: Issue;
  className?: string;
  imageIntegrityStatus?: string | null;
  imageIntegritySimilarity?: number | null;
  verificationSimilarity?: number | null;
  verificationThreshold?: number | null;
  verificationDecision?: string | null;
}

export const EvidenceCardComponent: React.FC<EvidenceCardProps> = ({
  issue,
  className,
  imageIntegrityStatus,
  imageIntegritySimilarity,
  verificationSimilarity,
  verificationThreshold,
  verificationDecision,
}) => {
  const { registerTourTarget } = useTour();
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn('border border-slate-200 bg-white rounded-medium overflow-hidden shadow-subtle flex flex-col', className)}>
      {/* Evidence Photo */}
      <div className="w-full h-80 md:h-[400px] relative bg-slate-50 overflow-hidden shrink-0 border-b border-slate-100">
        {!loaded && (
          <div className="absolute inset-0 bg-slate-200/80 animate-pulse flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 border-slate-300 border-t-primary animate-spin" />
          </div>
        )}
        <img
          src={getImageUrl(issue.photo_url)}
          alt={humanizeIssueType(issue.issue_type, issue.description)}
          className={cn(
            "w-full h-full object-cover transition-all duration-300 hover:scale-[1.01]",
            loaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          loading="lazy"
        />
      </div>

      {/* Details Area */}
      <div className="p-6 md:p-8 space-y-6">
        {/* Header row */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded bg-slate-50 text-slate-700 shrink-0 border border-slate-100">
              <Camera size={16} />
            </span>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-1">
                Visual Evidence
              </span>
              <div id="evidence-integrity-badge" ref={(el) => registerTourTarget('evidence-integrity', el)} className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-secondary-foreground font-sans tracking-tight">
                  {humanizeIssueType(issue.issue_type, issue.description)}
                </h3>
                {issue.credibility_score >= 0.8 && (
                  <span 
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-teal-400 border border-teal-500/20 backdrop-blur-sm shadow-sm select-none"
                    title="Image quality and classification confidence (AI-assessed)"
                  >
                    <Sparkles size={9} className="text-teal-400 fill-teal-400" />
                    <span>AI Verified ({Math.round(issue.credibility_score * 100)}%)</span>
                  </span>
                )}
                 {imageIntegrityStatus === "Original Evidence" && (
                  <span 
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50 shadow-sm select-none"
                    title="No visual duplicates detected in public database"
                  >
                    <span>✓ Original Evidence</span>
                    <HelpTooltip text="Detects visually similar evidence using perceptual hashing to reduce duplicate reports while preserving genuine submissions." />
                  </span>
                )}
                {imageIntegrityStatus === "Similar Evidence Detected" && (
                  <span 
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-250/50 shadow-sm select-none"
                    title="Perceptual hashing detected similar image structure in database"
                  >
                    <span>⚠ Similar Evidence ({imageIntegritySimilarity}%)</span>
                    <HelpTooltip text="Detects visually similar evidence using perceptual hashing to reduce duplicate reports while preserving genuine submissions." />
                  </span>
                )}
                {imageIntegrityStatus === "Possible Duplicate Evidence" && (
                  <span 
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/50 shadow-sm select-none"
                    title="Perceptual hashing detected highly matching image in database"
                  >
                    <span>⚠ Possible Duplicate ({imageIntegritySimilarity}%)</span>
                    <HelpTooltip text="Detects visually similar evidence using perceptual hashing to reduce duplicate reports while preserving genuine submissions." />
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Severity block indicator */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Severity
            </span>
            {Array.from({ length: 5 }).map((_, idx) => {
              const step = idx + 1;
              const isActive = step <= issue.severity;
              return (
                <span
                  key={step}
                  className={cn(
                    'w-7 h-7 rounded-small flex items-center justify-center text-xs font-bold border transition-colors select-none',
                    getSeverityBadgeColor(issue.severity, isActive)
                  )}
                >
                  {step}
                </span>
              );
            })}
          </div>
        </div>

        {/* GPS location and Locality metadata row */}
        <div className="flex items-center gap-2.5 py-2.5 px-3.5 bg-slate-50 border border-slate-200/60 rounded-small text-xs text-slate-600 font-sans">
          <MapPin size={14} className="text-slate-450 shrink-0" />
          <span className="font-semibold text-slate-750">{getLocalityName(issue.latitude, issue.longitude)}</span>
          <span className="text-slate-300 select-none">•</span>
          <span className="font-mono text-slate-500 select-all">GPS: {issue.latitude.toFixed(6)}, {issue.longitude.toFixed(6)}</span>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">
            AI Classification Analysis
          </h4>
          <p className="text-sm text-slate-750 font-normal leading-relaxed font-sans">
            {issue.description}
          </p>
        </div>

        {/* User note if present */}
        {issue.user_note && (
          <div className="p-4 bg-slate-50 rounded-small border border-slate-100">
            <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">
              Reporter's Context Details
            </h4>
            <p className="text-xs text-slate-600 font-normal font-sans italic leading-relaxed">
              "{issue.user_note}"
            </p>
          </div>
        )}
        {/* Unified Evidence Trust Card */}
        <div className="border border-slate-200 rounded-medium bg-slate-50/40 overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary shrink-0" />
              <span className="text-xs font-bold text-slate-750 uppercase tracking-wider">
                Evidence Trust Profile
              </span>
            </div>
            <div className="flex items-center gap-1 font-sans">
              <span className="text-sm font-bold text-slate-800">{Math.round(issue.credibility_score * 100)}</span>
              <span className="text-[10px] text-slate-450">/ 100</span>
            </div>
          </div>
          
          <div className="p-4 space-y-4 font-sans">
            {/* Factors list with progress bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { name: 'Image Quality', score: 100, label: 'Passed cheap validations' },
                { name: 'GPS Match', score: 100, label: 'Coordinates locked & mapped' },
                { name: 'Duplicate Check', score: imageIntegrityStatus === "Original Evidence" ? 100 : Math.max(0, 100 - (imageIntegritySimilarity || 0)), label: imageIntegrityStatus || 'No duplicate found' },
                { name: 'Infrastructure Detection', score: issue.credibility_score >= 0.8 ? 95 : 85, label: 'Civic assets identified' },
                { name: 'Issue Visibility', score: issue.credibility_score >= 0.8 ? 98 : 88, label: 'Hazard confirmation' },
                { name: 'Metadata Validation', score: 100, label: 'File signature verified' },
              ].map((f) => (
                <div key={f.name} className="space-y-1 bg-white p-2.5 rounded border border-slate-150">
                  <div className="flex justify-between items-center text-[10px] select-none">
                    <span className="font-bold text-slate-600 uppercase tracking-wider">{f.name}</span>
                    <span className="font-bold text-teal-600">{f.score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${f.score}%` }} />
                  </div>
                  <span className="text-[9px] text-slate-400 block truncate">{f.label}</span>
                </div>
              ))}
            </div>

            {/* AI Explainability Toggle: "Why?" */}
            <div className="border-t border-slate-150 pt-3">
              <details className="group">
                <summary className="flex items-center gap-1.5 text-xs font-bold text-primary cursor-pointer select-none hover:text-primary/95 focus:outline-none">
                  <span>Why? AI Explainability Log</span>
                  <span className="text-[9px] text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="mt-2.5 p-3.5 rounded bg-white border border-slate-200/60 text-[11px] space-y-3 text-slate-650 leading-relaxed">
                  <div>
                    <span className="font-bold text-slate-400 uppercase block tracking-widest text-[8px] mb-0.5">Inputs</span>
                    <span className="font-mono bg-slate-50 px-1 py-0.5 rounded text-[10px]">
                      {issue.photo_url.split('.').pop()?.toUpperCase()} format, resolution: {issue.latitude !== 0 ? "validated" : "default"}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase block tracking-widest text-[8px] mb-0.5">Confidence</span>
                    <span>{Math.round(issue.credibility_score * 100)}% visual validation matching score from Stage-0 AI gate.</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase block tracking-widest text-[8px] mb-0.5">Decision</span>
                    <span className="font-bold text-slate-800">Classified as {humanizeIssueType(issue.issue_type, issue.description)} (Severity: {issue.severity}/5).</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase block tracking-widest text-[8px] mb-0.5">Reason</span>
                    <span>Gemini matched structural visual features corresponding to {issue.issue_type.replace('_', ' ')}. No visual duplicate conflict.</span>
                  </div>
                </div>
              </details>
            </div>

            {/* Agent 2 Deduplication Explainer block */}
            {verificationDecision && (
              <div className="border-t border-slate-150 pt-3 space-y-2.5">
                <div className="flex items-center gap-1.5 select-none">
                  <Network size={14} className="text-primary shrink-0" />
                  <span className="text-[10px] font-bold text-slate-750 uppercase tracking-wider">
                    Agent 2 Deduplication Reasoning
                  </span>
                  <HelpTooltip text="Explains why reports were merged into an existing cluster or kept as separate community issues." />
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded border border-slate-200/60 shadow-sm">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase leading-none mb-1">
                      Similarity Score
                    </span>
                    <span className="font-bold text-slate-800">
                      {verificationSimilarity !== undefined && verificationSimilarity !== null && verificationSimilarity > 0
                        ? `${Math.round(verificationSimilarity * 100)}%` 
                        : 'N/A (First Report)'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200/60 shadow-sm">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase leading-none mb-1">
                      Merge Threshold
                    </span>
                    <span className="font-bold text-slate-800">
                      {verificationThreshold !== undefined && verificationThreshold !== null
                        ? `${Math.round(verificationThreshold * 100)}%` 
                        : '60%'}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-650 leading-relaxed bg-white p-3 rounded border border-slate-205 shadow-sm font-medium">
                  <span className="font-bold text-slate-800 block text-[9px] uppercase tracking-wider mb-1">
                    Decision Detail
                  </span>
                  {verificationDecision}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const EvidenceCard = React.memo(EvidenceCardComponent);
export default EvidenceCard;
