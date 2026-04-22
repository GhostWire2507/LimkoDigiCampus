import { useEffect, useRef, useState } from "react";

export function useLoad(loader, dependency) {
  const [state, setState] = useState([]);
  const loaderRef = useRef(loader);

  loaderRef.current = loader;

  useEffect(() => {
    let active = true;

    loaderRef.current().then((result) => {
      if (active) {
        setState(result);
      }
    });

    return () => {
      active = false;
    };
  }, [dependency]);

  return [state, setState];
}
