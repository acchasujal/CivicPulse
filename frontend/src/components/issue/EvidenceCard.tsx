import React from 'react';
import { Camera, AlertCircle } from 'lucide-react';
import type { Issue } from '@/api/types';
import { getStaticUrl } from '@/api/client';
import { cn } from '@/lib/utils';

interface EvidenceCardProps {
  issue: Issue;
  className?: string;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ issue, className }) => {
  const humanizeIssueType = (type: string) => {
    switch (type) {
      case 'road_damage': return 'Road Damage';
      case 'lighting': return 'Street Lighting';
      case 'water': return 'Water Supply / Leakage';
      case 'waste': return 'Waste / Garbage';
      default: return 'Other Civic Issue';
    }
  };

  const getSeverityColor = (sev: number) => {
    if (sev >= 4) return 'bg-rose-500 text-white';
    if (sev >= 3) return 'bg-amber-500 text-white';
    return 'bg-emerald-500 text-white';
  };

  return (
    <div className={cn('border border-secondary-border bg-white rounded-large overflow-hidden shadow-subtle flex flex-col md:flex-row gap-6 p-6', className)}>
      {/* Evidence Photo */}
      <div className="w-full md:w-72 shrink-0 h-48 md:h-56 relative rounded-medium overflow-hidden border border-slate-100 bg-slate-50">
        <img
          src={getStaticUrl(issue.photo_url)}
          alt={humanizeIssueType(issue.issue_type)}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-[10px] text-white px-2.5 py-1 rounded-small font-semibold tracking-wide uppercase font-sans">
          Evidence Photo
        </div>
      </div>

      {/* Details Area */}
      <div className="flex-1 flex flex-col justify-between py-1 space-y-4">
        <div className="space-y-3">
          {/* Header row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded bg-slate-100 text-slate-700 shrink-0">
                <Camera size={16} />
              </span>
              <h3 className="text-lg font-bold text-secondary-foreground font-sans">
                {humanizeIssueType(issue.issue_type)}
              </h3>
            </div>
            
            {/* Severity block indicator */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                Severity
              </span>
              {Array.from({ length: 5 }).map((_, idx) => {
                const step = idx + 1;
                const isActive = step <= issue.severity;
                return (
                  <span
                    key={step}
                    className={cn(
                      'w-5 h-5 rounded-small flex items-center justify-center text-[10px] font-bold border transition-colors select-none',
                      isActive 
                        ? getSeverityColor(issue.severity)
                        : 'bg-slate-50 text-slate-300 border-slate-200'
                    )}
                  >
                    {step}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              AI Vision Description
            </h4>
            <p className="text-sm text-slate-600 font-normal leading-relaxed font-sans">
              {issue.description}
            </p>
          </div>

          {/* User note if present */}
          {issue.user_note && (
            <div className="space-y-1 bg-slate-50/50 p-3 rounded-small border border-slate-100">
              <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Reporter's Additional Note
              </h4>
              <p className="text-xs text-slate-500 font-normal font-sans italic">
                "{issue.user_note}"
              </p>
            </div>
          )}
        </div>

        {/* Credibility Score Banner (with required disclaimer label) */}
        <div className="flex items-start gap-2 p-3 bg-slate-50 border border-secondary-border rounded-small select-none animate-fade group">
          <AlertCircle size={15} className="text-slate-400 mt-0.5 shrink-0" />
          <div className="space-y-0.5 leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Confidence Assessment:
              </span>
              <span className="text-xs font-bold text-primary">
                {(issue.credibility_score * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-normal leading-snug">
              Image quality and classification confidence (AI-assessed)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EvidenceCard;
