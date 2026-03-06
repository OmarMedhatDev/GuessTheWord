import React, { createContext, useContext, useEffect, useState } from 'react';
import type { DiscordSDK } from '@discord/embedded-app-sdk';
import type { GuessResult } from '../hooks/useGameState';

export interface ParticipantState {
  userId: string;
  username: string;
  avatarUrl: string | null;
  guesses: GuessResult[];
  status: 'playing' | 'won' | 'lost';
}

interface DiscordContextValue {
  sdk: DiscordSDK | null;
  instanceId: string | null;
  participants: ParticipantState[];
  currentUser: { id: string; username: string; avatarUrl: string | null } | null;
}

const defaultValue: DiscordContextValue = {
  sdk: null,
  instanceId: null,
  participants: [],
  currentUser: null,
};

const DiscordContext = createContext<DiscordContextValue>(defaultValue);

export function useDiscord() {
  return useContext(DiscordContext);
}

/** Placeholder: in production, participant states would come from your backend (keyed by instanceId). */
const MOCK_PARTICIPANTS: ParticipantState[] = [];

interface DiscordProviderProps {
  children: React.ReactNode;
  sdk: DiscordSDK | null;
  currentUser: DiscordContextValue['currentUser'];
}

export function DiscordProvider({ children, sdk, currentUser }: DiscordProviderProps) {
  const [participants, setParticipants] = useState<ParticipantState[]>(MOCK_PARTICIPANTS);
  const [instanceId, setInstanceId] = useState<string | null>(null);

  useEffect(() => {
    if (!sdk) return;
    const sdkRef = sdk;
    setInstanceId(sdkRef.instanceId ?? null);

    async function fetchParticipants() {
      try {
        const res = await sdkRef.commands.getInstanceConnectedParticipants();
        const list = res?.participants ?? [];
        setParticipants(
          list.map((p) => ({
            userId: p.id,
            username: p.global_name ?? p.username ?? 'Player',
            avatarUrl: p.avatar
              ? `https://cdn.discordapp.com/avatars/${p.id}/${p.avatar}.png?size=64`
              : null,
            guesses: [],
            status: 'playing' as const,
          }))
        );
      } catch {
        setParticipants([]);
      }
    }

    fetchParticipants();
    const interval = setInterval(fetchParticipants, 5000);
    return () => clearInterval(interval);
  }, [sdk]);

  const value: DiscordContextValue = {
    sdk,
    instanceId,
    participants,
    currentUser,
  };

  return <DiscordContext.Provider value={value}>{children}</DiscordContext.Provider>;
}
