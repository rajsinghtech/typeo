import React from "react";

interface MutationObserverProps {
  ref: HTMLElement;
  callback: MutationCallback;
  options?: MutationObserverInit;
}

export default function useMutationObserver({
  ref,
  callback,
  options,
}: MutationObserverProps) {
  React.useEffect(() => {
    if (ref) {
      const observer = new MutationObserver(callback);
      observer.observe(
        ref,
        options || {
          attributes: false,
          characterData: false,
          childList: true,
          subtree: true,
        }
      );
      return () => observer.disconnect();
    }
  }, [callback, options]);
}
