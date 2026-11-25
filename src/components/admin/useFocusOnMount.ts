import { useEffect, useRef } from 'react';

/** Moves focus to the element (typically a form heading with tabIndex -1) when it appears. */
export function useFocusOnMount<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return ref;
}
