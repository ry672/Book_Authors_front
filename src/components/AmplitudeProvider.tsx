import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { initAmplitude } from '../lib/analytics-ui/amplitude';

interface AmplitudeProviderProps {
  children: ReactNode;
}

export function AmplitudeProvider({ children }: AmplitudeProviderProps) {
  useEffect(() => {
    initAmplitude();
  }, []);

  return <>{children}</>;
}

export default AmplitudeProvider;
