import React from 'react';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import { Surface } from '../../design-system/primitives/foundation/Surface';
import { Switch } from '../../design-system/primitives/forms/Switch';
import { Button } from '../../design-system/primitives/buttons/Button';
import { useTheme } from '../../core/providers/ThemeProvider';
import { useAccessibility } from '../../core/providers/AccessibilityProvider';
import { useAuth } from '../../core/providers/AuthProvider';

export const SettingsPage: React.FC = () => {
  usePageTitle('Account & Privacy Settings — CivicPulse');
  const { mode, toggleHighContrast } = useTheme();
  const { textScale, setTextScale } = useAccessibility();
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans py-4">
      <h2 className="text-xl font-bold text-neutral-900">Account, Privacy & Accessibility Settings</h2>

      <Surface variant="card" className="p-6 space-y-4">
        <h3 className="text-base font-semibold text-neutral-900">User Identity & Persona</h3>
        <div className="text-xs text-neutral-700 space-y-1">
          <p>Active Persona: <strong className="text-neutral-900">{user?.name}</strong></p>
          <p>System Role: <strong className="text-neutral-900 capitalize">{user?.role}</strong></p>
        </div>
        <Button variant="danger" size="sm" onClick={logout}>
          Reset Identity / Sign Out
        </Button>
      </Surface>

      <Surface variant="card" className="p-6 space-y-4">
        <h3 className="text-base font-semibold text-neutral-900">Accessibility & Visual Contrast</h3>
        <Switch
          label="High Contrast Display Mode"
          description="Enforces maximum text contrast for outdoor daylight reading"
          checked={mode === 'high-contrast'}
          onChange={toggleHighContrast}
        />

        <div className="pt-2 space-y-2">
          <label className="block text-sm font-medium text-neutral-900">Typography Scale</label>
          <div className="flex gap-2">
            {(['standard', 'large', 'extra-large'] as const).map((scale) => (
              <Button
                key={scale}
                variant={textScale === scale ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setTextScale(scale)}
              >
                {scale.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </Surface>
    </div>
  );
};

export default SettingsPage;
