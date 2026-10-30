'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Actor, Organisation } from '@/types';
import { SEED_PERSONAS, SEED_ORGANISATIONS } from '@/server/dal/seed';

interface PersonaContextType {
  actor: Actor;
  currentPersonaKey: string;
  setPersona: (key: string) => void;
  activeTenant: Organisation | null;
  setActiveTenantId: (tenantId: string) => void;
  availableOrganisations: Organisation[];
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [currentPersonaKey, setCurrentPersonaKey] = useState<string>('public');
  const [actor, setActor] = useState<Actor>(SEED_PERSONAS.public);

  useEffect(() => {
    const saved = localStorage.getItem('azentio_current_persona');
    if (saved && SEED_PERSONAS[saved]) {
      setCurrentPersonaKey(saved);
      setActor(SEED_PERSONAS[saved]);
    }
  }, []);

  const setPersona = (key: string) => {
    if (SEED_PERSONAS[key]) {
      const base = { ...SEED_PERSONAS[key] };
      setCurrentPersonaKey(key);
      setActor(base);
      localStorage.setItem('azentio_current_persona', key);
    }
  };

  const setActiveTenantId = (tenantId: string) => {
    setActor((prev) => {
      const updated = { ...prev, activeTenantId: tenantId };
      return updated;
    });
  };

  const activeTenant = actor.activeTenantId
    ? SEED_ORGANISATIONS.find((o) => o.id === actor.activeTenantId) || null
    : null;

  return (
    <PersonaContext.Provider
      value={{
        actor,
        currentPersonaKey,
        setPersona,
        activeTenant,
        setActiveTenantId,
        availableOrganisations: SEED_ORGANISATIONS,
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

