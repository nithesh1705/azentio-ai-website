'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, Building2, Globe2, ArrowRight } from 'lucide-react';
import { getPresenceOffices } from '@/server/dal/store';

export default function PresencePage() {
  const offices = getPresenceOffices();
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  const regions = ['All', 'Asia Pacific', 'Middle East', 'South Asia', 'Africa', 'Americas'];

  const filteredOffices =
    selectedRegion === 'All'
      ? offices
      : offices.filter((o) => o.region === selectedRegion);

  return (
    <div className="relative overflow-hidden py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-4">
          <Globe2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Global Footprint Across 60+ Countries</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          Our Presence: 19 Global Hubs
        </h1>
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          Headquartered in Singapore, Azentio operates regional offices, innovation centers, and
          dedicated support hubs close to our enterprise customers.
        </p>
      </div>

      {/* Region Filter Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
        {regions.map((reg) => (
          <button
            key={reg}
            onClick={() => setSelectedRegion(reg)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedRegion === reg
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {reg}
          </button>
        ))}
      </div>

      {/* Offices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffices.map((office) => (
          <div
            key={office.id}
            className={`p-6 rounded-2xl border bg-card shadow-sm hover:border-emerald-500/40 hover:shadow-lg transition-all flex flex-col justify-between ${
              office.isHeadquarters ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-muted font-bold text-muted-foreground">
                  {office.region}
                </span>
                {office.isHeadquarters && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                    HQ
                  </span>
                )}
              </div>

              <h3 className="font-extrabold text-xl text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-500" />
                <span>{office.city}</span>
              </h3>
              <div className="text-sm font-semibold text-muted-foreground mt-0.5">
                {office.country}
              </div>

              <div className="mt-4 p-3 rounded-xl bg-muted/30 border border-border/40 text-xs text-muted-foreground leading-relaxed">
                <div className="font-bold text-foreground text-[11px] mb-1">{office.type}</div>
                {office.address || `${office.city} Commercial Financial Hub`}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground font-medium">
                {office.established ? `Established: ${office.established}` : 'Active Operations'}
              </span>
              <Link
                href="/contact"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>Contact Hub</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
