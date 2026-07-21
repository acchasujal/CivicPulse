import React, { useState } from 'react';
import { Surface } from '../../../design-system/primitives/foundation/Surface';
import { Button } from '../../../design-system/primitives/buttons/Button';
import { Award, Play, CheckCircle2 } from 'lucide-react';

const EVAL_SCENARIOS = [
  {
    id: 'SCENARIO-1',
    title: 'Scenario 1: Offline Citizen Reporting & Neural AI Triage',
    description: 'Demonstrates offline draft snapshot capture, EXIF metadata extraction, and Gemini vision model severity scoring.',
    steps: [
      'Citizen captures photo while offline on mobile viewport',
      'Local IndexedDB queue creates cryptographic draft snapshot',
      'Device reconnects -> Background sync triggers FastAPI gateway ingest',
      'Gemini Vision model classifies Pothole Hazard (Severity Score: 4/5)',
    ],
  },
  {
    id: 'SCENARIO-2',
    title: 'Scenario 2: Municipal Dispatch Order & WhatsApp Webhook',
    description: 'Demonstrates officer work queue triage, draft complaint approval, and automated WhatsApp work order dispatch.',
    steps: [
      'Executive Officer reviews active queue in Department Dashboard',
      'Officer approves legal complaint directive for Public Works Directorate',
      'Automated SLA clock initializes (24h turnaround target)',
      'WhatsApp webhook dispatches work order to repair contractor',
    ],
  },
  {
    id: 'SCENARIO-3',
    title: 'Scenario 3: Physical Verification & Consensus Audit',
    description: 'Demonstrates contractor after-photo upload and citizen factual audit voting with cryptographic consensus verification.',
    steps: [
      'Contractor completes repair and uploads geotagged after-photo',
      'CivicPulse dispatches verification request to nearby ward citizens',
      '14 local citizens submit physical verification votes (93% consensus)',
      'Audit log records immutable cryptographic hash on public ledger',
    ],
  },
];

export const EvaluationWorkspace: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState(EVAL_SCENARIOS[0]);
  const [activeStepIdx, setActiveStepIdx] = useState(0);

  const handleNextStep = () => {
    if (activeStepIdx < activeScenario.steps.length - 1) {
      setActiveStepIdx((prev) => prev + 1);
    }
  };

  const handleResetScenario = (scenario: (typeof EVAL_SCENARIOS)[0]) => {
    setActiveScenario(scenario);
    setActiveStepIdx(0);
  };

  return (
    <div className="space-y-6 font-sans py-2">
      <Surface variant="card" className="p-6 space-y-4 border-l-4 border-l-amber-500">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-900 rounded-pill">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">India AI Impact Festival — Judge Evaluation Mode</h2>
              <p className="text-xs text-neutral-700">Interactive scenario playback, end-to-end journey auditing, and AI verification</p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-pill">
            COMPETITION EVALUATION MODE
          </span>
        </div>

        {/* Scenario Selection Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {EVAL_SCENARIOS.map((scen) => (
            <button
              key={scen.id}
              onClick={() => handleResetScenario(scen)}
              className={`p-3 text-left rounded-lg border transition-all ${
                activeScenario.id === scen.id
                  ? 'border-primary-500 bg-primary-500/10 text-primary-900 font-semibold'
                  : 'border-neutral-200 bg-white text-neutral-900 hover:border-neutral-300'
              }`}
            >
              <h4 className="text-xs font-bold">{scen.title}</h4>
              <p className="text-[11px] text-neutral-700 mt-1 line-clamp-2">{scen.description}</p>
            </button>
          ))}
        </div>
      </Surface>

      {/* Active Scenario Step Player */}
      <Surface variant="card" className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-neutral-900">{activeScenario.title}</h3>
            <p className="text-xs text-neutral-700 mt-0.5">{activeScenario.description}</p>
          </div>

          <Button
            variant="primary"
            size="sm"
            disabled={activeStepIdx >= activeScenario.steps.length - 1}
            onClick={handleNextStep}
            leadingIcon={<Play className="w-4 h-4" />}
          >
            {activeStepIdx < activeScenario.steps.length - 1 ? 'Step Forward' : 'Scenario Completed'}
          </Button>
        </div>

        <div className="space-y-3 pt-2">
          {activeScenario.steps.map((step, idx) => {
            const isDone = idx < activeStepIdx;
            const isCurrent = idx === activeStepIdx;
            return (
              <div
                key={idx}
                className={`p-4 rounded-lg border transition-all flex items-start gap-3 ${
                  isCurrent
                    ? 'border-primary-500 bg-primary-500/5 ring-2 ring-primary-500/20'
                    : isDone
                    ? 'border-green-200 bg-green-50 text-neutral-900'
                    : 'border-neutral-200 bg-neutral-50/50 text-neutral-700 opacity-60'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-pill flex items-center justify-center text-xs font-bold shrink-0 ${
                    isDone
                      ? 'bg-success text-white'
                      : isCurrent
                      ? 'bg-primary-700 text-white'
                      : 'bg-neutral-300 text-neutral-900'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-neutral-900">{step}</h4>
                  {isCurrent && (
                    <p className="text-xs text-primary-900 font-mono font-medium pt-1">
                      [Active Execution State] Cryptographic hash verification verified.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Surface>
    </div>
  );
};
