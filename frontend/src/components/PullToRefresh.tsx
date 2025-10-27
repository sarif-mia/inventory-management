import React, { useState, useRef, useCallback } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { usePullToRefresh } from '../hooks/useTouchGestures';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  disabled?: boolean;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80,
  disabled = false,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRefresh = useCallback(async () => {
    if (disabled || isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  }, [onRefresh, disabled, isRefreshing]);

  const bind = usePullToRefresh(handleRefresh, threshold);

  const handleDrag = useCallback((event: any) => {
    if (disabled || isRefreshing) return;

    const distance = Math.max(0, event.movement[1]);
    const maxDistance = threshold * 1.5;
    const clampedDistance = Math.min(distance, maxDistance);

    setPullDistance(clampedDistance);
  }, [disabled, isRefreshing, threshold]);

  const handleDragEnd = useCallback(() => {
    setPullDistance(0);
  }, []);

  const progress = Math.min((pullDistance / threshold) * 100, 100);
  const opacity = Math.min(pullDistance / threshold, 1);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        touchAction: 'pan-y', // Allow vertical scrolling but prevent horizontal
      }}
      {...bind()}
      onPointerMove={handleDrag}
      onPointerUp={handleDragEnd}
      onPointerCancel={handleDragEnd}
    >
      {/* Pull indicator */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: pullDistance,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'primary.main',
          color: 'white',
          zIndex: 1000,
          transform: `translateY(${Math.max(-pullDistance, -threshold)}px)`,
          transition: isRefreshing ? 'none' : 'transform 0.2s ease-out',
          opacity,
        }}
      >
        {isRefreshing ? (
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress size={20} color="inherit" />
            <Typography variant="body2">Refreshing...</Typography>
          </Box>
        ) : pullDistance > threshold * 0.5 ? (
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress
              size={20}
              color="inherit"
              variant="determinate"
              value={progress}
            />
            <Typography variant="body2">Release to refresh</Typography>
          </Box>
        ) : (
          <Typography variant="body2">Pull to refresh</Typography>
        )}
      </Box>

      {/* Content */}
      <Box
        sx={{
          transform: `translateY(${pullDistance}px)`,
          transition: isRefreshing ? 'none' : 'transform 0.2s ease-out',
          height: '100%',
          overflow: pullDistance > 0 ? 'hidden' : 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default PullToRefresh;