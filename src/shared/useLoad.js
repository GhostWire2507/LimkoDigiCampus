import { useEffect, useRef, useState } from "react";

// Loads async screen data and avoids setting state after the component unmounts.
export function useLoad(loader, dependency, initialState = []) {
  const [state, setState] = useState(initialState);
  const loaderRef = useRef(loader);
  const initialStateRef = useRef(initialState);

  loaderRef.current = loader;
  initialStateRef.current = initialState;

  useEffect(() => {
    let active = true;

    // Keep cached content visible while a fresh request runs in the background.
    setState((current) => (Array.isArray(current) && current.length ? current : initialStateRef.current));

    loaderRef.current()
      .then((result) => {
        if (active) {
          setState(result);
        }
      })
      .catch(() => {
        if (active) {
          setState(initialStateRef.current);
        }
      });

    return () => {
      active = false;
    };
  }, [dependency]);

  return [state, setState];
}
