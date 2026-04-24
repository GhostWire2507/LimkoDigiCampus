import { useEffect, useRef, useState } from "react";

export function useLoad(loader, dependency, initialState = []) {
  const [state, setState] = useState(initialState);
  const loaderRef = useRef(loader);
  const initialStateRef = useRef(initialState);

  loaderRef.current = loader;
  initialStateRef.current = initialState;

  useEffect(() => {
    let active = true;

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
