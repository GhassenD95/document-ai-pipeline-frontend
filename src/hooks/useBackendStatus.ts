import { useState, useEffect, useCallback } from 'react';
import { checkHealth } from '@/services/api';

export type BackendStatus = 'checking' | 'connected' | 'starting' | 'offline';

export function useBackendStatus() {
  const [status, setStatus] = useState<BackendStatus>('checking');

  const poll = useCallback(async () => {
    const ok = await checkHealth();
    if (ok) {
      setStatus('connected');
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const run = async () => {
      const connected = await poll();
      if (cancelled) return;

      if (connected) {
        setStatus('connected');
        return;
      }

      setStatus('starting');

      const retry = async () => {
        if (cancelled) return;
        const ok = await checkHealth();
        if (cancelled) return;
        if (ok) {
          setStatus('connected');
          return;
        }
        timer = setTimeout(retry, 4000);
      };

      timer = setTimeout(retry, 4000);
    };

    run();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [poll]);

  return status;
}
