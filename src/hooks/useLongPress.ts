import React, { useRef, useCallback } from 'react';

interface UseLongPressOptions {
  onShortPress: () => void;
  onLongPress: () => void;
  longPressThreshold?: number;
}

export function useLongPress({
  onShortPress,
  onLongPress,
  longPressThreshold = 500,
}: UseLongPressOptions) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressActive = useRef(false);
  const isInteractionActive = useRef(false);

  const start = useCallback((e: React.SyntheticEvent) => {
    isInteractionActive.current = true;
    isLongPressActive.current = false;
    
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      if (isInteractionActive.current) {
        onLongPress();
        isLongPressActive.current = true;
      }
    }, longPressThreshold);
  }, [onLongPress, longPressThreshold]);

  const cancel = useCallback(() => {
    isInteractionActive.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const stop = useCallback((e: React.SyntheticEvent) => {
    if (!isInteractionActive.current) return;
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    if (!isLongPressActive.current) {
      onShortPress();
    }
    
    isInteractionActive.current = false;
    isLongPressActive.current = false;
  }, [onShortPress]);

  return {
    onPointerDown: start,
    onPointerUp: stop,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  };
}
