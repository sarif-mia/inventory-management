import { useGesture } from '@use-gesture/react';
import { useCallback, useRef } from 'react';

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  swipeThreshold?: number;
  longPressDelay?: number;
}

export const useTouchGestures = (options: TouchGestureOptions) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onDoubleTap,
    onLongPress,
    swipeThreshold = 50,
    longPressDelay = 500,
  } = options;

  const lastTapRef = useRef<number>(0);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const bind = useGesture({
    onDrag: ({ down, movement: [mx, my], direction: [xDir, yDir], cancel, tap }) => {
      if (tap) {
        // Handle tap gestures
        const now = Date.now();
        const timeDiff = now - lastTapRef.current;

        if (timeDiff < 300 && timeDiff > 0) {
          // Double tap
          onDoubleTap?.();
          lastTapRef.current = 0;
        } else {
          // Single tap
          onTap?.();
          lastTapRef.current = now;
        }
        return;
      }

      if (down) {
        // Start long press timer
        if (!longPressTimeoutRef.current) {
          longPressTimeoutRef.current = setTimeout(() => {
            onLongPress?.();
            cancel();
          }, longPressDelay);
        }
      } else {
        // Clear long press timer
        if (longPressTimeoutRef.current) {
          clearTimeout(longPressTimeoutRef.current);
          longPressTimeoutRef.current = null;
        }

        // Handle swipe gestures
        const absX = Math.abs(mx);
        const absY = Math.abs(my);

        if (absX > swipeThreshold || absY > swipeThreshold) {
          if (absX > absY) {
            // Horizontal swipe
            if (xDir > 0) {
              onSwipeRight?.();
            } else {
              onSwipeLeft?.();
            }
          } else {
            // Vertical swipe
            if (yDir > 0) {
              onSwipeDown?.();
            } else {
              onSwipeUp?.();
            }
          }
        }
      }
    },
    onDragEnd: () => {
      // Clear long press timer on drag end
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
        longPressTimeoutRef.current = null;
      }
    },
  });

  return bind;
};

// Hook for pull-to-refresh functionality
export const usePullToRefresh = (onRefresh: () => void, threshold: number = 80) => {
  const bind = useGesture({
    onDrag: ({ down, movement: [mx, my], cancel }) => {
      if (down && my > threshold) {
        onRefresh();
        cancel();
      }
    },
  });

  return bind;
};

// Hook for pinch-to-zoom functionality
export const usePinchToZoom = (onZoom: (scale: number) => void) => {
  const bind = useGesture({
    onPinch: ({ offset: [scale] }) => {
      onZoom(scale);
    },
  });

  return bind;
};

// Hook for card swipe gestures (like Tinder)
export const useCardSwipe = (
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  threshold: number = 100
) => {
  const bind = useGesture({
    onDrag: ({ down, movement: [mx], cancel }) => {
      if (!down) {
        if (mx > threshold) {
          onSwipeRight();
          cancel();
        } else if (mx < -threshold) {
          onSwipeLeft();
          cancel();
        }
      }
    },
  });

  return bind;
};