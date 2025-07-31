import { useEffect, useCallback, useRef } from "react";

export function useConnectionMonitor(onReconnect: () => void) {
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const handleOnline = useCallback(() => {
    console.log("Connection restored");
    // Debounce reconnection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectTimeoutRef.current = setTimeout(onReconnect, 1000);
  }, [onReconnect]);

  useEffect(() => {
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [handleOnline]);
}
