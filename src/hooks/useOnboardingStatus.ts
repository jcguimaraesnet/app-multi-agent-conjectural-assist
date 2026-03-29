'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type OnboardingStage = 'stage1' | 'stage2' | 'stage3';

type StageStatuses = Record<OnboardingStage, boolean>;

const DEFAULT_STATUSES: StageStatuses = { stage1: true, stage2: true, stage3: true };

let cachedStatuses: StageStatuses | null = null;
let cachedUserId: string | null = null;

// Notify all hook instances when any instance updates statuses
const listeners = new Set<(statuses: StageStatuses) => void>();

export function useOnboardingStatus() {
  const { user, isLoading: isAuthLoading } = useAuth();

  const hasCached =
    !!user?.id && user.id === cachedUserId && cachedStatuses !== null;

  const [statuses, setStatuses] = useState<StageStatuses>(
    hasCached ? cachedStatuses! : DEFAULT_STATUSES,
  );
  const [isLoading, setIsLoading] = useState(!hasCached);
  const fetchedForUser = useRef<string | null>(
    hasCached ? user?.id ?? null : null,
  );

  const fetchStatus = useCallback(async () => {
    if (isAuthLoading) return;

    if (!user?.id) {
      cachedStatuses = null;
      cachedUserId = null;
      fetchedForUser.current = null;
      setStatuses(DEFAULT_STATUSES);
      setIsLoading(false);
      return;
    }

    // Already fetched for this user — restore from cache
    if (fetchedForUser.current === user.id) {
      if (cachedStatuses) setStatuses(cachedStatuses);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/profiles/me/onboarding`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch onboarding status');
      }

      const data = await response.json();

      const fetched: StageStatuses = {
        stage1: data.stage1 ?? false,
        stage2: data.stage2 ?? false,
        stage3: data.stage3 ?? false,
      };

      cachedStatuses = fetched;
      cachedUserId = user.id;
      fetchedForUser.current = user.id;
      setStatuses(fetched);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching onboarding status:', err);
      // On error, default to "completed" so tours don't show incorrectly
      setStatuses(DEFAULT_STATUSES);
      setIsLoading(false);
    }
  }, [user?.id, isAuthLoading]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Subscribe to cross-instance updates
  useEffect(() => {
    listeners.add(setStatuses);
    return () => { listeners.delete(setStatuses); };
  }, []);

  const completeStage = useCallback(
    async (stage: OnboardingStage) => {
      if (!user?.id) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/profiles/me/onboarding/${stage}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${user.id}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to complete onboarding ${stage}`);
        }

        const updated: StageStatuses = {
          ...(cachedStatuses ?? DEFAULT_STATUSES),
          [stage]: true,
        };
        cachedStatuses = updated;
        listeners.forEach((setter) => setter(updated));
      } catch (err) {
        console.error(`Error completing onboarding ${stage}:`, err);
      }
    },
    [user?.id],
  );

  return {
    stageCompleted: statuses,
    isLoading,
    completeStage,
  };
}
