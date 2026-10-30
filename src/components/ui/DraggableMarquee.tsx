'use client';

import React, { useRef, useState, useEffect } from 'react';

interface DraggableMarqueeProps {
  children: React.ReactNode;
  speed?: number; // pixels per second (slowed down, e.g. 25-30)
  className?: string;
  pauseOnHover?: boolean;
}

export function DraggableMarquee({
  children,
  speed = 28,
  className = '',
  pauseOnHover = true,
}: DraggableMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Auto-scrolling loop using requestAnimationFrame
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const loop = (currentTime: number) => {
      if (lastTimeRef.current !== null && !isPaused && !isDragging) {
        const deltaSeconds = (currentTime - lastTimeRef.current) / 1000;
        const movement = speed * deltaSeconds;
        container.scrollLeft += movement;

        // Infinite loop wrap check (half of total scrollable width)
        const halfWidth = container.scrollWidth / 2;
        if (halfWidth > 0) {
          if (container.scrollLeft >= halfWidth) {
            container.scrollLeft -= halfWidth;
          } else if (container.scrollLeft <= 0) {
            container.scrollLeft += halfWidth;
          }
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

  // Mouse Drag Events
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    setIsDragging(true);
    hasMovedRef.current = false;
    startXRef.current = e.pageX - container.offsetLeft;
    startScrollLeftRef.current = container.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const container = containerRef.current;
    if (!container) return;
    e.preventDefault();

    const currentX = e.pageX - container.offsetLeft;
    const walk = (currentX - startXRef.current) * 1.5;
    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
    }
    container.scrollLeft = startScrollLeftRef.current - walk;

    // Wrap around while dragging
    const halfWidth = container.scrollWidth / 2;
    if (halfWidth > 0) {
      if (container.scrollLeft >= halfWidth) {
        container.scrollLeft -= halfWidth;
        startScrollLeftRef.current -= halfWidth;
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft += halfWidth;
        startScrollLeftRef.current += halfWidth;
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Prevent accidental link activation after dragging
  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      hasMovedRef.current = false;
    }
  };

  return (
    <div
      ref={containerRef}
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
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => {
        setTimeout(() => setIsPaused(false), 1200);
      }}
      onClickCapture={handleClickCapture}
      className={`overflow-x-auto select-none no-scrollbar cursor-grab active:cursor-grabbing w-full flex [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] ${className}`}
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div className="flex shrink-0 items-center w-max py-2">
        {/* Set 1 */}
        <div className="flex shrink-0 items-center gap-4">
          {children}
        </div>
        {/* Spacer between sets to preserve exact gap */}
        <div className="w-4 shrink-0" aria-hidden="true" />
        {/* Set 2 (Cloned for seamless infinite wrap) */}
        <div className="flex shrink-0 items-center gap-4" aria-hidden="true">
          {children}
        </div>
        <div className="w-4 shrink-0" aria-hidden="true" />
      </div>
    </div>
  );
}
