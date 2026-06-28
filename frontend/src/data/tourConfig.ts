// ─── Tour Step Schema ──────────────────────────────────────────────────────────

export interface TourStep {
  id: string;
  route: string;
  targetId: string;
  selector?: string;
  title: string;
  description: string;
  whyItMatters: string;
  expectedAction: string;
  validation?: () => boolean;
  // Legacy fields kept for backward compat — may be empty string
  whatIsThis?: string;
  whyIsUseful?: string;
  howImproveAccountability?: string;
  footerNote?: string;
}

// ─── Evaluation Phases ─────────────────────────────────────────────────────────

export interface TourPhase {
  number: number;
  name: string;
}

export const getStepPhase = (stepId: string): TourPhase => {
  switch (stepId) {
    case 'scenario':
    case 'upload':
      return { number: 1, name: 'Submit Report' };
    case 'ai-pipeline':
    case 'evidence-integrity':
    case 'timeline':
      return { number: 2, name: 'AI Verification' };
    case 'tracker':
    case 'dashboard':
    case 'ai-insights':
    case 'silence-ledger':
    case 'ward-pattern':
    case 'maps':
      return { number: 3, name: 'Platform Intelligence' };
    case 'community-verification':
    case 'complaint-draft':
    case 'ai-recommendations':
    case 'government-tracker':
      return { number: 4, name: 'Complaint Workspace' };
    case 'save-pdf':
    case 'send-email':
      return { number: 5, name: 'Dispatch & Accountability' };
    default:
      return { number: 1, name: 'Submit Report' };
  }
};

export const tourPhases: TourPhase[] = [
  { number: 1, name: 'Submit Report' },
  { number: 2, name: 'AI Verification' },
  { number: 3, name: 'Platform Intelligence' },
  { number: 4, name: 'Complaint Workspace' },
  { number: 5, name: 'Dispatch & Accountability' },
];

// ─── Feature Explorer Items ───────────────────────────────────────────────────

export interface FeatureExplorerItem {
  id: string;
  label: string;
  stepId: string;
}

export const explorerFeatures: FeatureExplorerItem[] = [
  { id: 'submit_report', label: 'Submit Report', stepId: 'scenario' },
  { id: 'ai_pipeline', label: 'AI Pipeline', stepId: 'ai-pipeline' },
  { id: 'tracker', label: 'Tracker', stepId: 'tracker' },
  { id: 'maps', label: 'Maps', stepId: 'maps' },
  { id: 'ai_insights', label: 'AI Civic Insights', stepId: 'ai-insights' },
  { id: 'silence_ledger', label: 'Silence Ledger', stepId: 'silence-ledger' },
  { id: 'ward_intelligence', label: 'Ward Intelligence', stepId: 'ward-pattern' },
  { id: 'evidence_integrity', label: 'Evidence Integrity', stepId: 'evidence-integrity' },
  { id: 'community_verification', label: 'Community Verification', stepId: 'community-verification' },
  { id: 'complaint_draft', label: 'Complaint Draft', stepId: 'complaint-draft' },
  { id: 'timeline', label: 'Timeline', stepId: 'timeline' },
  { id: 'pdf', label: 'PDF', stepId: 'save-pdf' },
  { id: 'email', label: 'Email', stepId: 'send-email' }
];

// ─── Steps ────────────────────────────────────────────────────────────────────

export const tourSteps: TourStep[] = [
  // ── 1. Submission ────────────────────────────────────────────────────────
  {
    id: 'scenario',
    route: '/',
    targetId: 'demo-scenario',
    selector: '#demo-scenario-select',
    title: 'Choose a Demo Scenario',
    description: 'Pick any preset scenario to load realistic civic evidence instantly.',
    whyItMatters: 'Loads a complete evidence package in one click — no photo sourcing needed.',
    expectedAction: 'Select any scenario from the dropdown above.',
    validation: () => {
      return !!document.querySelector('img[alt="Evidence preview"]') ||
        !!document.querySelector('[data-photo-loaded]') ||
        !!document.querySelector('#photo-uploader-container img');
    },
  },
  {
    id: 'upload',
    route: '/',
    targetId: 'photo-uploader',
    selector: '#photo-uploader-container',
    title: 'Upload Evidence',
    description: 'Photo evidence drives the entire AI pipeline. Any infrastructure photo works.',
    whyItMatters: 'The AI cannot classify or draft without verified visual proof.',
    expectedAction: 'A demo scenario photo should already be loaded. Proceed to the next step.',
    validation: () => {
      return !!document.querySelector('img[alt="Evidence preview"]') ||
        !!document.querySelector('#photo-uploader-container img');
    },
  },
  {
    id: 'ai-pipeline',
    route: '/',
    targetId: 'ai-pipeline',
    selector: '#intake-pipeline-container',
    title: 'AI Processing Pipeline',
    description: 'Submit the report to run Agent 1 (Classification) and Agent 2 (Deduplication).',
    whyItMatters: 'Every output traces to this step — no human classification, no fabricated scores.',
    expectedAction: 'Click "Submit to Operations Center" to submit the report.',
    validation: () => {
      return window.location.pathname.startsWith('/issue/') &&
        !window.location.pathname.includes(':id');
    },
  },

  // ── 2. Platform Intelligence ─────────────────────────────────────────────
  {
    id: 'tracker',
    route: '/tracker',
    targetId: 'tracker-header',
    selector: '.bg-slate-900',
    title: 'Operations Center',
    description: 'The public dashboard aggregates all citizen-submitted evidence.',
    whyItMatters: 'Creates a transparent public ledger of unresolved municipal failures.',
    expectedAction: 'Click "Tracker" in the sidebar to open the Operations Center.',
    validation: () => window.location.pathname === '/tracker',
  },
  {
    id: 'dashboard',
    route: '/tracker',
    targetId: 'transparency-dashboard',
    selector: '#transparency-dashboard-stats',
    title: 'Transparency Dashboard',
    description: 'Live platform metrics — reports, verified count, escalations. All from real data.',
    whyItMatters: 'Every metric is evidence-grounded and survives judge cross-examination.',
    expectedAction: 'Review the dashboard stats panel on the Tracker page.',
    validation: () => {
      return window.location.pathname === '/tracker' &&
        !!document.querySelector('#transparency-dashboard-stats');
    },
  },
  {
    id: 'ai-insights',
    route: '/tracker',
    targetId: 'ai-insights',
    selector: '#ai-civic-insights-card',
    title: 'AI Civic Insights',
    description: 'Deterministic spatial intelligence derived from actual submitted reports.',
    whyItMatters: 'Identifies infrastructure failure patterns without fabricating any scores.',
    expectedAction: 'Scroll down to see the AI Civic Insights card.',
    validation: () => {
      const el = document.querySelector('#ai-civic-insights-card');
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    },
  },
  {
    id: 'silence-ledger',
    route: '/tracker',
    targetId: 'silence-ledger',
    selector: '#silence-ledger-container',
    title: 'Silence Ledger',
    description: 'Tracks cumulative waiting days for unresolved issues — forcing transparency on delay.',
    whyItMatters: 'Exposes exactly how long government has ignored each reported problem.',
    expectedAction: 'Scroll to the Cross-Issue Silence Ledger section.',
    validation: () => {
      const el = document.querySelector('#silence-ledger-container');
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    },
  },
  {
    id: 'ward-pattern',
    route: '/tracker',
    targetId: 'ward-pattern',
    selector: '#ward-pattern-container',
    title: 'Ward Pattern Intelligence',
    description: 'Shows issue distribution by ward — systemic failures, not isolated incidents.',
    whyItMatters: 'Enables policy-level intervention by revealing concentrated infrastructure deficits.',
    expectedAction: 'Scroll to the Ward Pattern Intelligence section. Click any ward to filter.',
    validation: () => {
      const el = document.querySelector('#ward-pattern-container');
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    },
  },

  // ── 3. Maps ──────────────────────────────────────────────────────────────
  {
    id: 'maps',
    route: '/tracker',
    targetId: 'operations-map',
    selector: '#operations-map-container',
    title: 'Google Maps GIS Engine',
    description: 'Geolocated reports with dynamic clustering and risk-coded markers.',
    whyItMatters: 'Cluster density helps officials prioritize systemic hotspots over isolated fixes.',
    expectedAction: 'Scroll to the map on the Tracker page.',
    validation: () => {
      const el = document.querySelector('#operations-map-container');
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      const gmStyle = el.querySelector('.gm-style');
      return rect.width > 100 && rect.height > 100 && !!gmStyle;
    },
  },

  // ── 4. Case File ─────────────────────────────────────────────────────────
  {
    id: 'evidence-integrity',
    route: '/issue/:id',
    targetId: 'evidence-integrity',
    selector: '#evidence-integrity-badge',
    title: 'Evidence Integrity Badge',
    description: 'Perceptual hashing flags visual duplicates automatically.',
    whyItMatters: 'Prevents spam while keeping genuine nearby reports — no manual review needed.',
    expectedAction: 'Click any report in the Tracker to open its Case File.',
    validation: () => {
      return window.location.pathname.startsWith('/issue/') &&
        !window.location.pathname.includes(':id');
    },
  },
  {
    id: 'community-verification',
    route: '/issue/:id',
    targetId: 'community-verification',
    selector: '#community-verification-container',
    title: 'Community Verification',
    description: 'Residents can corroborate reports with photos and comments.',
    whyItMatters: 'Crowdsourced validation builds consensus and strengthens escalation credibility.',
    expectedAction: 'Scroll to the Community Corroboration section in the Case File.',
    validation: () => {
      const el = document.querySelector('#community-verification-container');
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    },
  },
  {
    id: 'timeline',
    route: '/issue/:id',
    targetId: 'agent-timeline',
    selector: '#agent-timeline-container',
    title: 'Agent Processing Timeline',
    description: '5-agent reasoning trail from intake to brief compilation.',
    whyItMatters: 'Complete auditability — every AI decision is visible and traceable.',
    expectedAction: 'Review the AI Agent Processing Pipeline in Section 02.',
    validation: () => {
      const el = document.querySelector('#agent-timeline-container');
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    },
  },
  {
    id: 'complaint-draft',
    route: '/issue/:id',
    targetId: 'complaint-draft',
    selector: '#complaint-draft-workspace',
    title: 'Complaint Draft Workspace',
    description: 'AI-generated complaint and RTI briefs — editable before submission.',
    whyItMatters: 'Citizens stay in control. AI drafts, humans authorize. No bypassing the gate.',
    expectedAction: 'Scroll to Section 05: Accountability Action Drafts.',
    validation: () => {
      const el = document.querySelector('#complaint-draft-workspace');
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    },
  },
  {
    id: 'ai-recommendations',
    route: '/issue/:id',
    targetId: 'ai-recommendations',
    selector: '#ai-recommendations-container',
    title: 'AI Recommendations',
    description: 'Suggests target department, priority level, and escalation timeline.',
    whyItMatters: 'Routes complaints to the correct authority using regulatory frameworks.',
    expectedAction: 'Review the AI Recommendations panel at the top of the Case File.',
    validation: () => {
      return window.location.pathname.startsWith('/issue/') &&
        !window.location.pathname.includes(':id') &&
        !!document.querySelector('#ai-recommendations-container');
    },
  },
  {
    id: 'government-tracker',
    route: '/issue/:id',
    targetId: 'government-tracker',
    selector: '#government-response-tracker',
    title: 'Government Response Tracker',
    description: 'Tracks statutory response windows (e.g. 30-day RTI cycle).',
    whyItMatters: 'Alerts citizens when response deadlines expire — creating legal accountability.',
    expectedAction: 'Scroll to the accountability timeline section.',
    validation: () => {
      const el = document.querySelector('#government-response-tracker') ||
        document.querySelector('#accountability-timeline-container');
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    },
  },

  // ── 5. Actions ──────────────────────────────────────────────────────────
  {
    id: 'save-pdf',
    route: '/issue/:id',
    targetId: 'btn-save-pdf',
    selector: '#tour-btn-save-pdf',
    title: 'PDF Export',
    description: 'Compiles the complaint brief into an official PDF for print or filing.',
    whyItMatters: 'Bridges digital evidence with a tangible, portable document for officials.',
    expectedAction: 'Click "Generate PDF" inside the Complaint Draft Workspace.',
    validation: () => {
      const dialog = document.querySelector('[data-escalation-dialog]');
      const pdfActive = document.querySelector('[data-method="pdf_export"]');
      return !!dialog || !!pdfActive ||
        !!document.querySelector('.escalation-dialog-open[data-method="pdf_export"]');
    },
  },
  {
    id: 'send-email',
    route: '/issue/:id',
    targetId: 'btn-send-email',
    selector: '#tour-btn-send-email',
    title: 'Email Dispatch',
    description: 'Sends the complaint package to the ward officer via SendGrid HTTP API.',
    whyItMatters: 'A real external action — demonstrably connects AI output to official channels.',
    expectedAction: 'Click "Send Email" inside the Complaint Draft Workspace.',
    validation: () => {
      const dialog = document.querySelector('[data-escalation-dialog]');
      const emailActive = document.querySelector('[data-method="email"]');
      return !!dialog || !!emailActive;
    },
  },
];
