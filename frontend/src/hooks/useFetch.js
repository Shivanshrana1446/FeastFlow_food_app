import { useCallback, useEffect, useState } from 'react';
import { errorMessage } from './useToast';

/**
 * Runs an async fetcher on mount and whenever `deps` change. Understands the
 * `{ data, meta }` shape returned by paginated endpoints as well as plain payloads.
 */
export function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, meta: null, error: null, loading: true });

  const run = useCallback(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetcher()
      .then((result) => {
        if (cancelled) return;
        if (result && typeof result === 'object' && 'data' in result && 'meta' in result) {
          setState({ data: result.data, meta: result.meta, error: null, loading: false });
        } else {
          setState({ data: result, meta: null, error: null, loading: false });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ data: null, meta: null, error: errorMessage(err), loading: false });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => run(), [run]);

  return { ...state, refetch: run };
}
