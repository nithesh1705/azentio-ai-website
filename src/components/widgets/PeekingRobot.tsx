'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X } from 'lucide-react';

export function PeekingRobot() {
  const router = useRouter();
  const pathname = usePathname();

  // Only show on public pages (not internal portals or sign-in)
  const isPortalArea =
    pathname.startsWith('/client') ||
    pathname.startsWith('/employee') ||
    pathname.startsWith('/moderation') ||
    pathname.startsWith('/publisher') ||
    pathname.startsWith('/admin') ||
    pathname === '/signin' ||
    pathname === '/sign-in' ||
    pathname === '/demo-request' ||
    pathname === '/request-demo';

  const [isHovered, setIsHovered] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Blinking eyes animation interval
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  if (isPortalArea) return null;

  // Single click navigates to demo; double click hides the robot
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (clickTimeoutRef.current) {
      // If a timeout was already pending, this is a double click!
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      handleDoubleClick();
      return;
    }

    clickTimeoutRef.current = setTimeout(() => {
      clickTimeoutRef.current = null;
      router.push('/demo-request');
    }, 280);
  };

  const handleDoubleClick = () => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }
    setIsHidden(true);
  };

  return (
    <>
      {/* Minimized Pill to summon robot back if dismissed */}
      <AnimatePresence>
        {isHidden && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={() => setIsHidden(false)}
            title="Click to summon Azentio AI Robot"
            className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-emerald-600 hover:bg-emerald-500 text-white pl-2 pr-1 py-3 rounded-l-xl shadow-lg flex items-center justify-center group cursor-pointer transition-all"
            aria-label="Show Demo Assistant"
          >
            <div className="flex flex-col items-center gap-1">
              {/* <span className="text-xs group-hover:scale-125 transition-transform">🤖</span> */}
              <span className="text-[9px] font-bold uppercase [writing-mode:vertical-rl] tracking-widest text-emerald-100">
                Demo
              </span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Peeking Robot */}
      <AnimatePresence>
        {!isHidden && (
          <div
            className="fixed right-0 top-1/2 -translate-y-1/2 z-40 select-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Animated Speech Bubble */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, x: 15 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.85, x: 15 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 26 }}
                  onClick={handleClick}
                  className="absolute right-full mr-3 top-1/2 -translate-y-1/2 w-64 p-3.5 rounded-2xl bg-card/95 backdrop-blur-md border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 cursor-pointer group"
                >
                  {/* Speech Bubble Arrow */}
                  <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-card" />

                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-foreground flex items-center gap-1">
                        <span>👋 Hey there!</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        Would you like to request an interactive enterprise demo?
                      </p>
                      <div className="pt-1 flex items-center justify-between text-[10px]">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 group-hover:underline flex items-center gap-0.5">
                          Request Demo <ArrowRight className="w-2.5 h-2.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                        <span className="text-muted-foreground/60 text-[9px]">
                          2x click hides me
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cute Robot Container */}
            <motion.div
              onClick={handleClick}
              onDoubleClick={handleDoubleClick}
              animate={{
                x: isHovered ? -16 : 0,
                y: [0, -4, 0],
              }}
              transition={{
                x: { type: 'spring', stiffness: 350, damping: 22 },
                y: { repeat: Infinity, duration: 3.2, ease: 'easeInOut' },
              }}
              whileTap={{ scale: 0.94 }}
              title="Click to request demo • Double-click to dismiss"
              className="cursor-pointer group relative flex items-center"
            >
              {/* Little dismiss button visible on hover */}
              {isHovered && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsHidden(true);
                  }}
                  title="Hide robot"
                  className="absolute -top-3 -left-3 w-5 h-5 rounded-full bg-muted/90 hover:bg-destructive hover:text-white text-muted-foreground flex items-center justify-center text-[10px] shadow border border-border transition-colors z-10"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              {/* Peeking Robot SVG Character */}
              <div className="relative w-16 h-24 flex items-center justify-end overflow-visible">
                <svg
                  width="72"
                  height="96"
                  viewBox="0 0 72 96"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="drop-shadow-lg filter transition-transform duration-300"
                >
                  <defs>
                    {/* Metal body gradient */}
                    <linearGradient id="botBody" x1="0" y1="0" x2="72" y2="96" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="60%" stopColor="#059669" />
                      <stop offset="100%" stopColor="#047857" />
                    </linearGradient>

                    {/* Visor gradient */}
                    <linearGradient id="visorGrad" x1="0" y1="20" x2="60" y2="60" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#0f172a" />
                      <stop offset="100%" stopColor="#1e293b" />
                    </linearGradient>

                    {/* Cyan Eye Glow */}
                    <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="60%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#0284c7" />
                    </radialGradient>

                    {/* Antenna light */}
                    <radialGradient id="antennaGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#a7f3d0" />
                      <stop offset="40%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#059669" />
                    </radialGradient>
                  </defs>

                  {/* Antenna stem */}
                  <path
                    d="M32 20 L28 10"
                    stroke="#10b981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Antenna bulb */}
                  <circle
                    cx="26"
                    cy="8"
                    r="5"
                    fill="url(#antennaGlow)"
                    className="animate-pulse"
                  />

                  {/* Robot Head (Rounded Pill tilted peeking) */}
                  <rect
                    x="8"
                    y="18"
                    width="62"
                    height="56"
                    rx="22"
                    fill="url(#botBody)"
                    stroke="#34d399"
                    strokeWidth="2"
                  />

                  {/* Metallic Ear/Bolt on Left */}
                  <rect
                    x="4"
                    y="36"
                    width="5"
                    height="18"
                    rx="2.5"
                    fill="#047857"
                  />

                  {/* Face Screen / Visor */}
                  <rect
                    x="16"
                    y="28"
                    width="52"
                    height="36"
                    rx="14"
                    fill="url(#visorGrad)"
                    stroke="#047857"
                    strokeWidth="1.5"
                  />

                  {/* Glowing Digital Eyes */}
                  {isBlinking ? (
                    // Blinking line eyes
                    <>
                      <line x1="26" y1="44" x2="36" y2="44" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="44" y1="44" x2="54" y2="44" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
                    </>
                  ) : (
                    // Wide cheerful round eyes
                    <>
                      <circle cx="31" cy="43" r="5" fill="url(#eyeGlow)" />
                      <circle cx="32.5" cy="41.5" r="1.5" fill="#ffffff" />

                      <circle cx="49" cy="43" r="5" fill="url(#eyeGlow)" />
                      <circle cx="50.5" cy="41.5" r="1.5" fill="#ffffff" />
                    </>
                  )}

                  {/* Cheerful Robot Mouth (Arc) */}
                  <path
                    d="M36 54 Q40 58 44 54"
                    stroke="#34d399"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Rosy Cheeks */}
                  <circle cx="23" cy="50" r="2.5" fill="#f43f5e" opacity="0.6" />
                  <circle cx="57" cy="50" r="2.5" fill="#f43f5e" opacity="0.6" />

                  {/* Peeking Hand Waving over screen edge */}
                  <g className="transition-transform duration-300 origin-bottom-left group-hover:-rotate-12">
                    {/* Little robotic palm */}
                    <circle cx="14" cy="74" r="7" fill="url(#botBody)" stroke="#34d399" strokeWidth="1.5" />
                    {/* Fingers gripping edge */}
                    <circle cx="9" cy="71" r="2" fill="#047857" />
                    <circle cx="9" cy="76" r="2" fill="#047857" />
                    <circle cx="12" cy="80" r="2" fill="#047857" />
                  </g>

                  {/* Body bottom hint */}
                  <rect
                    x="20"
                    y="74"
                    width="50"
                    height="20"
                    rx="10"
                    fill="url(#botBody)"
                    opacity="0.9"
                  />
                </svg>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

