'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Actor, Organisation } from '@/types';
import { SEED_PERSONAS, SEED_ORGANISATIONS } from '@/server/dal/seed';

interface PersonaContextType {
  actor: Actor;
  currentPersonaKey: string;
  setPersona: (key: string) => void;
  setCustomActor: (actor: Actor) => void;
  activeTenant: Organisation | null;
  setActiveTenantId: (tenantId: string) => void;
  availableOrganisations: Organisation[];
  refreshOrganisations: () => Promise<void>;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [currentPersonaKey, setCurrentPersonaKey] = useState<string>('public');
  const [actor, setActor] = useState<Actor>(SEED_PERSONAS.public);
  const [availableOrganisations, setAvailableOrganisations] = useState<Organisation[]>(SEED_ORGANISATIONS);

  const refreshOrganisations = async () => {
    try {
      const res = await fetch('/api/admin/orgs');
      if (res.ok) {
        const data = await res.json();
        if (data.organisations) {
          setAvailableOrganisations(data.organisations);
        }
      }
    } catch {
      // fallback to current
    }
  };

  useEffect(() => {
    const savedCustom = localStorage.getItem('azentio_custom_actor');
    if (savedCustom) {
      // A signed-in user session was persisted — restore it
      try {
        const parsed = JSON.parse(savedCustom);
        setActor(parsed);
        setCurrentPersonaKey('custom');
      } catch {
        // Corrupted — clear it and stay as public
        localStorage.removeItem('azentio_custom_actor');
        localStorage.removeItem('azentio_current_persona');
      }
    } else {
      // No signed-in session — restore named persona (or default to public)
      const saved = localStorage.getItem('azentio_current_persona');
      if (saved && SEED_PERSONAS[saved]) {
        setCurrentPersonaKey(saved);
        setActor(SEED_PERSONAS[saved]);
      }
    }
    refreshOrganisations();
  }, []);

  const setPersona = (key: string) => {
    if (SEED_PERSONAS[key]) {
      const base = { ...SEED_PERSONAS[key] };
      setCurrentPersonaKey(key);
      setActor(base);
      // Always clear any custom (signed-in) actor when switching to a seed persona
      localStorage.removeItem('azentio_custom_actor');
      if (key === 'public') {
        // Returning to public — also remove the persona key so fresh loads start clean
        localStorage.removeItem('azentio_current_persona');
      } else {
        localStorage.setItem('azentio_current_persona', key);
      }
    }
  };

  const setCustomActor = (newActor: Actor) => {
    setActor(newActor);
    setCurrentPersonaKey('custom');
    localStorage.setItem('azentio_custom_actor', JSON.stringify(newActor));
  };

  const setActiveTenantId = (tenantId: string) => {
    setActor((prev) => {
      const updated = { ...prev, activeTenantId: tenantId };
      localStorage.setItem('azentio_custom_actor', JSON.stringify(updated));
      return updated;
    });
  };

  const activeTenant = actor.activeTenantId
    ? availableOrganisations.find((o) => o.id === actor.activeTenantId) || null
    : null;

  return (
    <PersonaContext.Provider
      value={{
        actor,
        currentPersonaKey,
        setPersona,
        setCustomActor,
        activeTenant,
        setActiveTenantId,
        availableOrganisations,
        refreshOrganisations,
      }}
    >
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const context = useContext(PersonaContext);
  if (!context) {
    throw new Error('usePersona must be used within a PersonaProvider');
  }
  return context;
}
