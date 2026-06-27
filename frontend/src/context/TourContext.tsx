import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { tourSteps } from '@/data/tourConfig';
import type { TourStep } from '@/data/tourConfig';

export type TourFsmState =
  | 'IDLE'
  | 'CLEANUP'
  | 'NAVIGATING'
  | 'WAITING_FOR_ROUTE'
  | 'WAITING_FOR_SUSPENSE'
  | 'WAITING_FOR_RENDER'
  | 'WAITING_FOR_TARGET'
  | 'SCROLLING'
  | 'MEASURING'
  | 'HIGHLIGHTING'
  | 'TOOLTIP_VISIBLE'
  | 'COMPLETED'
  | 'FAILED_RECOVERY';

export type TourStatus = 'idle' | 'welcome' | 'loading' | 'active' | 'error';
export type StepState = 'waiting-route' | 'waiting-target' | 'ready';

interface TourContextType {
  // Granular FSM State
  fsmState: TourFsmState;
  
  // Backward compatibility fields
  status: TourStatus;
  stepState: StepState;
  currentStepIndex: number;
  steps: TourStep[];
  isActive: boolean;
  showWelcome: boolean;
  
  // Target registry
  registerTourTarget: (id: string, el: HTMLElement | null) => void;
  targetRegistry: React.MutableRefObject<Map<string, HTMLElement>>;

  // Overlay state coordinates & styles
  highlightStyle: React.CSSProperties | null;
  toastMessage: string | null;

  // Route transition state
  isTransitioning: boolean;
  transitionMessage: string | null;

  // Issue dynamic tracking
  resolvedIssueId: string | null;
  onIssueSubmitted: (id: string) => void;

  // Controls
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  dontShowAgain: () => void;
  restartTour: () => void;
  errorMsg: string | null;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const stepsConfig = tourSteps; // Backward-compatible export alias

export const TourProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [fsmState, setFsmState] = useState<TourFsmState>('IDLE');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState<string | null>(null);
  const [resolvedIssueId, setResolvedIssueId] = useState<string | null>(null);
  const [errorMsg] = useState<string | null>(null);

  // Refs for tracking mutable states without re-triggering effects
  const targetRegistry = useRef<Map<string, HTMLElement>>(new Map());
  const recentlySubmittedIssueIdRef = useRef<string | null>(null);

  const step = tourSteps[currentStepIndex];

  // Helper: check if dismissed on mount
  useEffect(() => {
    const dismissed = localStorage.getItem('civicpulse-tour-dismissed');
    if (dismissed === 'true') {
      setFsmState('IDLE');
    } else {
      setFsmState('IDLE'); // start idle, but overlay will show welcome if status is mapped to welcome
    }
  }, []);

  // Listen to path changes to automatically capture submitted issue IDs
  useEffect(() => {
    const pathMatch = location.pathname.match(/\/issue\/([^/]+)/);
    if (pathMatch && pathMatch[1] && pathMatch[1] !== ':id') {
      recentlySubmittedIssueIdRef.current = pathMatch[1];
    }
  }, [location.pathname]);

  // Expose manual submission callback
  const onIssueSubmitted = useCallback((id: string) => {
    recentlySubmittedIssueIdRef.current = id;
  }, []);

  // Target registration handler
  const registerTourTarget = useCallback((id: string, el: HTMLElement | null) => {
    if (el) {
      targetRegistry.current.set(id, el);
    } else {
      targetRegistry.current.delete(id);
    }
    // Dispatch a custom event so FSM waiting for target reacts instantly
    window.dispatchEvent(new CustomEvent('tour-target-registered', { detail: { id, element: el } }));
  }, []);

  // Map FSM states to backward compatible fields
  const status: TourStatus =
    fsmState === 'IDLE'
      ? 'idle'
      : fsmState === 'FAILED_RECOVERY'
      ? 'error'
      : fsmState === 'WAITING_FOR_ROUTE' || fsmState === 'NAVIGATING'
      ? 'loading'
      : 'active';

  const stepState: StepState =
    fsmState === 'TOOLTIP_VISIBLE'
      ? 'ready'
      : fsmState === 'WAITING_FOR_ROUTE'
      ? 'waiting-route'
      : 'waiting-target';

  const isActive = fsmState !== 'IDLE' && fsmState !== 'COMPLETED';
  const showWelcome = fsmState === 'IDLE' && !localStorage.getItem('civicpulse-tour-dismissed');

  // Resolve dynamic route issue parameter using priority fallback chain
  const resolveDynamicIssueId = async (): Promise<string> => {
    // 1. Recently submitted issue ID
    if (recentlySubmittedIssueIdRef.current) {
      return recentlySubmittedIssueIdRef.current;
    }

    // 2. Currently opened issue ID in pathname
    const pathParts = window.location.pathname.match(/\/issue\/([^/]+)/);
    if (pathParts && pathParts[1] && pathParts[1] !== ':id') {
      return pathParts[1];
    }

    // 3. Cache issues query
    try {
      const cached = queryClient.getQueryData<any>(['issues', {}]);
      if (cached && cached.issues && cached.issues.length > 0) {
        return cached.issues[0].id;
      }
    } catch (e) {}

    // 4. Fetch list directly from API
    try {
      const res = await apiClient.get<any>('/issues');
      if (res.data && res.data.issues && res.data.issues.length > 0) {
        return res.data.issues[0].id;
      }
    } catch (e) {}

    return 'iss-001'; // Seeder default fallback
  };

  const getTargetElement = (targetId: string): HTMLElement | null => {
    const el = targetRegistry.current.get(targetId);
    if (el && el.isConnected) {
      return el;
    }
    
    // Final fallback: query selector from configuration
    const currentStep = tourSteps.find(s => s.targetId === targetId);
    if (currentStep && currentStep.selector) {
      const elFromSelector = document.querySelector(currentStep.selector) as HTMLElement;
      if (elFromSelector) {
        return elFromSelector;
      }
    }
    return null;
  };

  const validateTarget = (el: HTMLElement | null): boolean => {
    if (!el) return false;
    if (!el.isConnected) return false;

    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;

    const style = window.getComputedStyle(el);
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      parseFloat(style.opacity || '1') === 0
    ) {
      return false;
    }

    // Check if the target itself or any child has data-loading attribute (Suspense / Loader)
    if (el.hasAttribute('data-loading') || el.querySelector('[data-loading]')) {
      return false;
    }

    return true;
  };

  const getTransitionMessageForRoute = (route: string): string => {
    if (route === '/') return 'Opening Incident Report Intake...';
    if (route === '/tracker') return 'Loading Operations Tracker...';
    if (route.startsWith('/issue/')) return 'Opening Case Operation File...';
    return 'Navigating...';
  };

  // Centralized Scroll Lock
  const lockScrolling = () => {
    document.body.style.overflow = 'hidden';
  };

  const restoreScrolling = () => {
    document.body.style.overflow = '';
  };

  // Main FSM Controller Effect Loop
  useEffect(() => {
    let active = true;
    let observer: MutationObserver | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let rafId: number | null = null;
    let timerId: any = null;

    const transitionTo = (nextState: TourFsmState) => {
      if (active) {
        setFsmState(nextState);
      }
    };

    const runState = async () => {
      if (!step || fsmState === 'IDLE') {
        setHighlightStyle(null);
        restoreScrolling();
        return;
      }

      switch (fsmState) {
        case 'CLEANUP':
          setHighlightStyle(null);
          restoreScrolling();
          // Resolve dynamic issue route if needed
          if (step.route.includes(':id')) {
            const id = await resolveDynamicIssueId();
            setResolvedIssueId(id);
          } else {
            setResolvedIssueId(null);
          }
          transitionTo('NAVIGATING');
          break;

        case 'NAVIGATING': {
          const targetRoute = step.route.replace(':id', resolvedIssueId || 'iss-001');

          // Custom beforeEnter lifecycle callback
          if (step.beforeEnter) {
            await step.beforeEnter();
          }

          if (location.pathname !== targetRoute) {
            setTransitionMessage(getTransitionMessageForRoute(targetRoute));
            setIsTransitioning(true);
            navigate(targetRoute);
            transitionTo('WAITING_FOR_ROUTE');
          } else {
            transitionTo('WAITING_FOR_SUSPENSE');
          }
          break;
        }

        case 'WAITING_FOR_ROUTE': {
          const targetRoute = step.route.replace(':id', resolvedIssueId || 'iss-001');
          if (location.pathname === targetRoute) {
            // Wait 300ms to allow route transitions and initial layout mounting
            timerId = setTimeout(() => {
              setIsTransitioning(false);
              setTransitionMessage(null);
              transitionTo('WAITING_FOR_SUSPENSE');
            }, 300);
          }
          break;
        }

        case 'WAITING_FOR_SUSPENSE': {
          // Check if dynamic loader / Suspense is active
          const isSuspenseLoading = !!document.querySelector('[data-loading="page"]');
          if (!isSuspenseLoading) {
            transitionTo('WAITING_FOR_RENDER');
          } else {
            observer = new MutationObserver(() => {
              const loading = document.querySelector('[data-loading="page"]');
              if (!loading && active) {
                transitionTo('WAITING_FOR_RENDER');
              }
            });
            observer.observe(document.body, { childList: true, subtree: true });
          }
          break;
        }

        case 'WAITING_FOR_RENDER':
          rafId = requestAnimationFrame(() => {
            timerId = setTimeout(() => {
              transitionTo('WAITING_FOR_TARGET');
            }, 50);
          });
          break;

        case 'WAITING_FOR_TARGET': {
          const el = getTargetElement(step.targetId);
          const isValid = validateTarget(el);

          // Apply custom validation if present in config
          const passCustom = isValid && (!step.validation || step.validation(el));

          if (passCustom) {
            setRetryCount(0);
            setToastMessage(null);
            transitionTo('SCROLLING');
          } else {
            // Target resolution pipeline:
            // MutationObserver -> Event Listener -> requestAnimationFrame -> Timeout
            let resolved = false;

            const check = () => {
              if (resolved) return;
              const currentEl = getTargetElement(step.targetId);
              const isCurrentValid = validateTarget(currentEl);
              const isCustomValid = isCurrentValid && (!step.validation || step.validation(currentEl));

              if (isCustomValid && active) {
                resolved = true;
                setRetryCount(0);
                setToastMessage(null);
                transitionTo('SCROLLING');
              }
            };

            // 1. Mutation Observer for DOM insertions
            observer = new MutationObserver(check);
            observer.observe(document.body, { childList: true, subtree: true });

            // 2. Custom Registration Event listener
            const handleRegisteredEvent = (e: Event) => {
              const detail = (e as CustomEvent).detail;
              if (detail.id === step.targetId) {
                check();
              }
            };
            window.addEventListener('tour-target-registered', handleRegisteredEvent);

            // 3. requestAnimationFrame check
            rafId = requestAnimationFrame(check);

            // 4. Fallback Timeout after 1 second
            timerId = setTimeout(() => {
              window.removeEventListener('tour-target-registered', handleRegisteredEvent);
              if (resolved) return;

              // Check if page loading skeleton is rendering. If so, do not increment retries.
              const isPageLoading = !!document.querySelector('[data-loading]');
              if (isPageLoading) {
                // Pause retry timer and stay in waiting target state
                transitionTo('WAITING_FOR_TARGET');
                return;
              }

              if (retryCount < 3) {
                setRetryCount(prev => prev + 1);
                setToastMessage("Preparing this section...");
                transitionTo('WAITING_FOR_TARGET');
              } else {
                if (step.onMissingTarget) {
                  step.onMissingTarget();
                }
                transitionTo('FAILED_RECOVERY');
              }
            }, 1000);
          }
          break;
        }

        case 'SCROLLING': {
          const el = getTargetElement(step.targetId);
          if (el) {
            lockScrolling();
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });

            timerId = setTimeout(() => {
              transitionTo('MEASURING');
            }, 300);
          } else {
            transitionTo('WAITING_FOR_TARGET');
          }
          break;
        }

        case 'MEASURING': {
          const el = getTargetElement(step.targetId);
          if (el) {
            const rect = el.getBoundingClientRect();
            setHighlightStyle({
              top: `${rect.top + window.scrollY - 8}px`,
              left: `${rect.left + window.scrollX - 8}px`,
              width: `${rect.width + 16}px`,
              height: `${rect.height + 16}px`,
              position: 'absolute',
            });
            transitionTo('HIGHLIGHTING');
          } else {
            transitionTo('WAITING_FOR_TARGET');
          }
          break;
        }

        case 'HIGHLIGHTING':
          transitionTo('TOOLTIP_VISIBLE');
          break;

        case 'TOOLTIP_VISIBLE': {
          const el = getTargetElement(step.targetId);
          if (!el || !validateTarget(el)) {
            // Target disappeared: trigger retry pipeline
            transitionTo('WAITING_FOR_TARGET');
            return;
          }

          // Monitor for resize or relocation
          resizeObserver = new ResizeObserver(() => {
            if (active && el) {
              const rect = el.getBoundingClientRect();
              setHighlightStyle({
                top: `${rect.top + window.scrollY - 8}px`,
                left: `${rect.left + window.scrollX - 8}px`,
                width: `${rect.width + 16}px`,
                height: `${rect.height + 16}px`,
                position: 'absolute',
              });
            }
          });
          if (el) {
            resizeObserver.observe(el);
          }

          // Custom afterEnter callback
          if (step.afterEnter) {
            await step.afterEnter();
          }
          break;
        }

        case 'FAILED_RECOVERY':
          setHighlightStyle(null);
          restoreScrolling();
          setToastMessage("This section is unavailable right now. Continuing the walkthrough...");
          
          timerId = setTimeout(() => {
            setToastMessage(null);
            if (currentStepIndex < tourSteps.length - 1) {
              setCurrentStepIndex(prev => prev + 1);
              setRetryCount(0);
              transitionTo('CLEANUP');
            } else {
              transitionTo('COMPLETED');
            }
          }, 2500);
          break;

        case 'COMPLETED':
          setHighlightStyle(null);
          restoreScrolling();
          break;
      }
    };

    runState();

    return () => {
      active = false;
      if (observer) observer.disconnect();
      if (resizeObserver) resizeObserver.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      if (timerId) clearTimeout(timerId);
    };
  }, [fsmState, currentStepIndex, resolvedIssueId, location.pathname]);

  // Controls API
  const startTour = () => {
    localStorage.removeItem('civicpulse-tour-dismissed');
    setCurrentStepIndex(0);
    setFsmState('CLEANUP');
  };

  const nextStep = async () => {
    // Custom check if step allows advancing
    if (step && step.canAdvance) {
      const allowed = await step.canAdvance();
      if (!allowed) return;
    }

    if (currentStepIndex < tourSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setFsmState('CLEANUP');
    } else {
      setFsmState('COMPLETED');
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setFsmState('CLEANUP');
    }
  };

  const skipTour = () => {
    setFsmState('IDLE');
  };

  const dontShowAgain = () => {
    localStorage.setItem('civicpulse-tour-dismissed', 'true');
    setFsmState('IDLE');
  };

  const restartTour = () => {
    startTour();
  };

  return (
    <TourContext.Provider
      value={{
        fsmState,
        status,
        stepState,
        currentStepIndex,
        steps: tourSteps,
        isActive,
        showWelcome,
        registerTourTarget,
        targetRegistry,
        highlightStyle,
        toastMessage,
        isTransitioning,
        transitionMessage,
        resolvedIssueId,
        onIssueSubmitted,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        dontShowAgain,
        restartTour,
        errorMsg,
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};

export default TourProvider;
