import React from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reportCount: number;
  areaLabel: string;
  recipientEmail: string;
  isSubmitting?: boolean;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  reportCount,
  areaLabel,
  recipientEmail,
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none animate-fade">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog Content */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white border border-secondary-border rounded-large shadow-premium max-w-md w-full p-6 space-y-6 overflow-hidden z-10 pointer-events-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Warning Icon & Title */}
        <div className="flex items-center gap-3 text-amber-600">
          <div className="p-2 bg-amber-50 rounded-full shrink-0">
            <AlertTriangle size={22} />
          </div>
          <h3 className="text-base font-bold text-secondary-foreground font-sans">
            Authorise Escalation Draft
          </h3>
        </div>

        {/* Consequential Copy */}
        <div className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            You are authorizing a real civic escalation package on behalf of{' '}
            <strong className="text-slate-900">{reportCount} community reports</strong> for{' '}
            <strong className="text-slate-900">"{areaLabel}"</strong>.
          </p>
          
          <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-small space-y-1">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              Real-World Action
            </span>
            <p className="text-[11px] text-amber-700 leading-normal font-sans">
              Approving this draft authorizes the platform to queue this brief for escalation. Once approved, the document will be ready to be dispatched to:
            </p>
            <p className="text-xs font-semibold text-slate-800 font-sans pt-1 break-all">
              {recipientEmail}
            </p>
          </div>

          <p className="text-[10px] text-slate-400 leading-snug">
            This represents a binding authorization checkpoint. Ensure all evidence classifications are correct and no official performance parameters have been fabricated.
          </p>
        </div>

        {/* Buttons Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-3.5 py-2 border border-secondary-border bg-white text-xs font-semibold text-slate-600 rounded-small hover:bg-slate-50 disabled:opacity-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-small shadow-sm transition-all disabled:opacity-50 active:scale-[0.98] cursor-pointer"
          >
            <ShieldCheck size={14} className={cn(isSubmitting && 'animate-spin')} />
            <span>{isSubmitting ? 'Approving...' : 'Confirm & Authorise'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default ApprovalModal;
