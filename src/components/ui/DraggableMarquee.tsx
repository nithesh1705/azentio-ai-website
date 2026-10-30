'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

interface DraggableMarqueeProps {
  children: React.ReactNode;
  speed?: number; // pixels per second (e.g. 24 for a slow, elegant pace)
  className?: string;
  pauseOnHover?: boolean;
}

export function DraggableMarquee({
  children,
  speed = 24,
  className = '',
  pauseOnHover = true,
}: DraggableMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Exact sub-pixel scroll accumulator
  const scrollPosRef = useRef<number>(0);
  const startXRef = useRef<number>(0);
  const startScrollLeftRef = useRef<number>(0);
  const hasMovedRef = useRef<boolean>(false);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const touchResumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync scroll position whenever container scrolls (touch gestures, wheel, drag)
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Only sync if user is manually scrolling (dragging, touching, wheel)
    if (isDragging || isPaused) {
      scrollPosRef.current = container.scrollLeft;
    }
  }, [isDragging, isPaused]);

  // Main Auto-Scroll Animation Frame Loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initialize scroll position from current DOM state
    scrollPosRef.current = container.scrollLeft;

    const loop = (currentTime: number) => {
      if (lastTimeRef.current !== null) {
        const deltaSeconds = (currentTime - lastTimeRef.current) / 1000;

        // Auto-advance if not paused and not being dragged
        if (!isPaused && !isDragging) {
          scrollPosRef.current += speed * deltaSeconds;

          // Seamless loop boundary: half of the total scrollable content
          const halfWidth = container.scrollWidth / 2;
          if (halfWidth > 0) {
            if (scrollPosRef.current >= halfWidth) {
              scrollPosRef.current -= halfWidth;
            } else if (scrollPosRef.current < 0) {
              scrollPosRef.current += halfWidth;
            }
          }

          container.scrollLeft = scrollPosRef.current;
        }
      }

      lastTimeRef.current = currentTime;
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPaused, isDragging, speed]);

  // ── MOUSE DRAG HANDLERS ──────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    setIsDragging(true);
    hasMovedRef.current = false;
    startXRef.current = e.pageX - container.offsetLeft;
    startScrollLeftRef.current = container.scrollLeft;
    scrollPosRef.current = container.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const container = containerRef.current;
    if (!container) return;
    e.preventDefault();

    const currentX = e.pageX - container.offsetLeft;
    const walk = (currentX - startXRef.current) * 1.4;

    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
    }

    let targetScroll = startScrollLeftRef.current - walk;
    const halfWidth = container.scrollWidth / 2;

    if (halfWidth > 0) {
      if (targetScroll >= halfWidth) {
        targetScroll -= halfWidth;
        startScrollLeftRef.current -= halfWidth;
      } else if (targetScroll < 0) {
        targetScroll += halfWidth;
        startScrollLeftRef.current += halfWidth;
      }
    }

    container.scrollLeft = targetScroll;
    scrollPosRef.current = targetScroll;
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      const container = containerRef.current;
      if (container) {
        scrollPosRef.current = container.scrollLeft;
      }
    }
  };

  // Prevent click on children if mouse was actively dragged
  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      hasMovedRef.current = false;
    }
  };

  // ── TOUCH HANDLERS (Mobile & Touchscreen Laptops) ─────────────────────────
  const handleTouchStart = () => {
    if (touchResumeTimeoutRef.current) {
      clearTimeout(touchResumeTimeoutRef.current);
      touchResumeTimeoutRef.current = null;
    }
    setIsPaused(true);
    const container = containerRef.current;
    if (container) {
      scrollPosRef.current = container.scrollLeft;
    }
  };

  const handleTouchEnd = () => {
    const container = containerRef.current;
    if (container) {
      scrollPosRef.current = container.scrollLeft;
    }
    // Resume auto-scroll after a short delay so the user can inspect
    touchResumeTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 1200);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        handleMouseUp();
        if (pauseOnHover) setIsPaused(false);
      }}
      onMouseEnter={() => {
        if (pauseOnHover) setIsPaused(true);
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClickCapture={handleClickCapture}
      className={`overflow-x-auto select-none no-scrollbar cursor-grab active:cursor-grabbing w-full flex [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] ${className}`}
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div className="flex shrink-0 items-center w-max py-2">
        {/* Render 4 duplicates to guarantee complete visual continuity on any screen width */}
        <div className="flex shrink-0 items-center gap-4">{children}</div>
        <div className="w-4 shrink-0" aria-hidden="true" />
        <div className="flex shrink-0 items-center gap-4">{children}</div>
        <div className="w-4 shrink-0" aria-hidden="true" />
        <div className="flex shrink-0 items-center gap-4" aria-hidden="true">{children}</div>
        <div className="w-4 shrink-0" aria-hidden="true" />
        <div className="flex shrink-0 items-center gap-4" aria-hidden="true">{children}</div>
        <div className="w-4 shrink-0" aria-hidden="true" />
      </div>
    </div>
  );
}
