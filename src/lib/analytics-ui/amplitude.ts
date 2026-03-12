import * as amplitude from '@amplitude/analytics-browser';

const API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY || '16f180df4e12994267da1ed7496ab556';

export function initAmplitude() {
  if (typeof window !== 'undefined') {
    amplitude.init(API_KEY, {
      autocapture: true,
    });
  }
}

export default amplitude;