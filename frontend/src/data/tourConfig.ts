export interface TourStep {
  id: string;
  route: string;
  targetId: string;
  selector?: string;
  title: string;
  description: string;
  whyItMatters: string;
  whatIsThis: string;
  whyIsUseful: string;
  howImproveAccountability: string;
  footerNote?: string;
  validation?: (element: HTMLElement | null) => boolean;
  beforeEnter?: () => void | Promise<void>;
  afterEnter?: () => void | Promise<void>;
  canAdvance?: () => boolean | Promise<boolean>;
  onMissingTarget?: () => void;
}

export const tourSteps: TourStep[] = [
  {
    id: 'scenario',
    route: '/',
    targetId: 'demo-scenario',
    selector: '#demo-scenario-select',
    title: '1. Choose a Demo Scenario',
    description: 'Start by selecting one of the provided demo scenarios. Each scenario loads realistic civic infrastructure evidence so you can immediately experience the complete CivicPulse workflow.',
    whyItMatters: 'Loads realistic demo data instantly without requiring you to source your own photos.',
    whatIsThis: 'Sensible demo incident templates.',
    whyIsUseful: 'Initiates a realistic workflow in one click.',
    howImproveAccountability: 'Enables immediate evaluation of the processing pipeline.',
    footerNote: 'You may also upload your own image at any time to test the platform.',
    beforeEnter: () => {
      // Auto-trigger default selection when starting the scenario step
      window.dispatchEvent(new CustomEvent('civicpulse-tour-select-default'));
    }
  },
  {
    id: 'upload',
    route: '/',
    targetId: 'photo-uploader',
    selector: '#photo-uploader-container',
    title: '2. Upload Your Own Evidence',
    description: 'Upload any infrastructure photo to test the AI pipeline with your own data. Supported types include road damage, garbage, streetlights, water leaks, footpaths, construction, drainage, trees, and manholes.',
    whyItMatters: 'Allows citizens to either continue with the guided demo scenarios or upload their own real image.',
    whatIsThis: 'Direct file intake uploader.',
    whyIsUseful: 'Allows testing with live real-world evidence.',
    howImproveAccountability: 'Grants citizens direct access to report unique visual proofs.'
  },
  {
    id: 'ai-pipeline',
    route: '/',
    targetId: 'ai-pipeline',
    selector: '#intake-pipeline-container',
    title: '3. AI Processing Pipeline',
    description: 'Follow the AI agent reasoning steps. The system runs Agent 1 (Classification) and Agent 2 (Deduplication) to analyze the uploaded case details.',
    whyItMatters: 'Provides direct visibility into the AI\'s classification and duplicate check logic.',
    whatIsThis: 'AI processing pipeline checklist.',
    whyIsUseful: 'Reveals processing state in real-time.',
    howImproveAccountability: 'Ensures audited, verifiable processing of evidence.'
  },
  {
    id: 'tracker',
    route: '/tracker',
    targetId: 'tracker-header',
    selector: '.bg-slate-900',
    title: '4. Operations Center',
    description: 'Audit active cases from the Operations Center. This public dashboard aggregates citizen-submitted infrastructure evidence.',
    whyItMatters: 'Builds public visibility into all active community issues.',
    whatIsThis: 'Operations Center dashboard landing.',
    whyIsUseful: 'Provides immediate overview of platform audit state.',
    howImproveAccountability: 'Maintains a public audit ledger of municipal failures.'
  },
  {
    id: 'dashboard',
    route: '/tracker',
    targetId: 'transparency-dashboard',
    selector: '#transparency-dashboard-stats',
    title: '5. Public Transparency Dashboard',
    description: 'Displays real-time platform metrics, tracking total reports, AI verification status, and resolutions.',
    whyItMatters: 'Builds public trust by showing the pipeline status of every single submission.',
    whatIsThis: 'Platform-wide metric counter.',
    whyIsUseful: 'Provides high-level audit summary.',
    howImproveAccountability: 'Allows citizens to hold municipal departments accountable.'
  },
  {
    id: 'ai-insights',
    route: '/tracker',
    targetId: 'ai-insights',
    selector: '#ai-civic-insights-card',
    title: '6. AI Civic Insights',
    description: 'Converts raw data into concise, actionable spatial intelligence using deterministic aggregation.',
    whyItMatters: 'Identifies major infrastructure failures across wards automatically.',
    whatIsThis: 'Evidence-based aggregation summaries.',
    whyIsUseful: 'Highlights key operational trends.',
    howImproveAccountability: 'Pinpoints specific wards needing urgent attention.'
  },
  {
    id: 'silence-ledger',
    route: '/tracker',
    targetId: 'silence-ledger',
    selector: '#silence-ledger-container',
    title: '7. Cross-Issue Silence Ledger',
    description: 'Summarizes unresolved issues and tracks cumulative waiting time for notified authorities.',
    whyItMatters: 'Forces transparency on government delay by exposing exactly how long issues remain ignored.',
    whatIsThis: 'Delinquency and waiting time ledger.',
    whyIsUseful: 'Quantifies bureaucratic delays.',
    howImproveAccountability: 'Creates public pressure with evidence-based wait times.'
  },
  {
    id: 'ward-pattern',
    route: '/tracker',
    targetId: 'ward-pattern',
    selector: '#ward-pattern-container',
    title: '8. Ward Pattern Intelligence',
    description: 'Visualizes pattern distributions across active wards to reveal systemic utility failures.',
    whyItMatters: 'Shows that issues are ward-wide infrastructure deficits, not isolated incidents.',
    whatIsThis: 'Evidence aggregation by ward.',
    whyIsUseful: 'Tracks ward-level failure patterns.',
    howImproveAccountability: 'Enables policy-level intervention instead of single fixes.'
  },
  {
    id: 'maps',
    route: '/tracker',
    targetId: 'operations-map',
    selector: '#operations-map-container',
    title: '9. Google Maps GIS Engine',
    description: 'Visualizes geolocated reports with dynamic clustering and color-coded markers based on risk level.',
    whyItMatters: 'Highlights cluster density to help officials prioritize systemic issues.',
    whatIsThis: 'Interactive GIS operations map.',
    whyIsUseful: 'Shows issue hotspots instantly.',
    howImproveAccountability: 'Prevents ignoring concentrated neighborhood failures.',
    validation: (el) => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      if (rect.width < 100 || rect.height < 100) return false;
      
      // Ensure Google Maps internals are fully mounted
      const gmStyle = el.querySelector('.gm-style');
      if (!gmStyle) return false;

      // Ensure some tiles or visual elements have rendered
      const imgs = gmStyle.querySelectorAll('img');
      return imgs.length > 0;
    }
  },
  {
    id: 'evidence-integrity',
    route: '/issue/:id',
    targetId: 'evidence-integrity',
    selector: '#evidence-integrity-badge',
    title: '10. Evidence Integrity Badge',
    description: 'Uses perceptual hashing to verify if an uploaded image is unique or a visual duplicate.',
    whyItMatters: 'Shields the platform from spam while preserving genuine nearby submissions.',
    whatIsThis: 'Perceptual hashing verification.',
    whyIsUseful: 'Automatically flags duplicate spam.',
    howImproveAccountability: 'Guarantees only genuine evidence is escalated.'
  },
  {
    id: 'community-verification',
    route: '/issue/:id',
    targetId: 'community-verification',
    selector: '#community-verification-container',
    title: '11. Community Verification',
    description: 'Allows nearby residents to corroborate reports, upload photos, and add comments.',
    whyItMatters: 'Leverages crowdsourced validation to strengthen and verify the report\'s urgency.',
    whatIsThis: 'Crowdsourced verification panel.',
    whyIsUseful: 'Builds community consensus.',
    howImproveAccountability: 'Mitigates fraud via citizen peer validation.'
  },
  {
    id: 'timeline',
    route: '/issue/:id',
    targetId: 'agent-timeline',
    selector: '#agent-timeline-container',
    title: '12. Agent Processing Timeline',
    description: 'Tracks the backend reasoning steps of the 5-agent pipeline from intake to brief compilation.',
    whyItMatters: 'Provides absolute explainability on how AI analyzed and structured the case details.',
    whatIsThis: '5-agent reasoning history trail.',
    whyIsUseful: 'Reveals decision transparency.',
    howImproveAccountability: 'Ensures the AI reasoning path can be audited.'
  },
  {
    id: 'complaint-draft',
    route: '/issue/:id',
    targetId: 'complaint-draft',
    selector: '#complaint-draft-workspace',
    title: '13. Complaint Draft Workspace',
    description: 'An interactive workspace to edit and preview AI-generated complaints and RTI briefs.',
    whyItMatters: 'Keeps citizens in control, allowing them to refine facts before official submission.',
    whatIsThis: 'Editable document workspace.',
    whyIsUseful: 'Allows human review of AI drafts.',
    howImproveAccountability: 'Secures high-quality legal brief submissions.'
  },
  {
    id: 'ai-recommendations',
    route: '/issue/:id',
    targetId: 'ai-recommendations',
    selector: '#ai-recommendations-container',
    title: '14. AI Recommendations',
    description: 'Suggests target department, priority levels, and escalation timeline based on severity.',
    whyItMatters: 'Guides citizens on the most effective legal and administrative route for resolution.',
    whatIsThis: 'Strategic next-step advisor.',
    whyIsUseful: 'Identifies correct department routes.',
    howImproveAccountability: 'Standardizes escalations using regulatory windows.'
  },
  {
    id: 'government-tracker',
    route: '/issue/:id',
    targetId: 'government-tracker',
    selector: '#government-response-tracker',
    title: '15. Government Response Tracker',
    description: 'Tracks post-submission statutory response windows (e.g. 30-day RTI reply cycle).',
    whyItMatters: 'Notifies citizens when response limits expire, prompting standard next actions.',
    whatIsThis: 'Statutory deadline tracker.',
    whyIsUseful: 'Flags unresponsive officials.',
    howImproveAccountability: 'Enforces statutory timelines on civic entities.'
  },
  {
    id: 'save-pdf',
    route: '/issue/:id',
    targetId: 'btn-save-pdf',
    selector: '#tour-btn-save-pdf',
    title: '16. PDF Export Action',
    description: 'Compiles the authorized complaint brief into an official PDF document for direct print or local storage.',
    whyItMatters: 'Bridges the digital verification trail with a tangible, portable file for direct presentation.',
    whatIsThis: 'PDF compile control.',
    whyIsUseful: 'Creates formal printed records.',
    howImproveAccountability: 'Provides citizens with physical evidence packages.'
  },
  {
    id: 'send-email',
    route: '/issue/:id',
    targetId: 'btn-send-email',
    selector: '#tour-btn-send-email',
    title: '17. Email Dispatch Action',
    description: 'Dispatches the authorized complaint package directly to the responsible ward officer via SendGrid HTTP API.',
    whyItMatters: 'Bridges online verification with formal municipal grievance channels.',
    whatIsThis: 'Email dispatch system.',
    whyIsUseful: 'Sends legal briefs directly in one click.',
    howImproveAccountability: 'Ensures complaints reach authorities with direct accountability tracking.'
  }
];
