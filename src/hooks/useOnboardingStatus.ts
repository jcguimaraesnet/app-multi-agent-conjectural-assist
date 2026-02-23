'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

export type OnboardingStage = 'stage1' | 'stage2' | 'stage3';

const STAGE_COLUMNS: Record<OnboardingStage, string> = {
  stage1: 'has_completed_onboarding_stage1',
  stage2: 'has_completed_onboarding_stage2',
  stage3: 'has_completed_onboarding_stage3',
};

type StageStatuses = Record<OnboardingStage, boolean>;

const DEFAULT_STATUSES: StageStatuses = { stage1: true, stage2: true, stage3: true };

let cachedStatuses: StageStatuses | null = null;
let cachedUserId: string | null = null;

// Notify all hook instances when any instance updates statuses
const listeners = new Set<(statuses: StageStatuses) => void>();

const ALL_COLUMNS = Object.values(STAGE_COLUMNS).join(',');

export function useOnboardingStatus() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [supabase] = useState(() => createClient());

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
      const { data, error } = await supabase
        .from('profiles')
        .select(ALL_COLUMNS)
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- columns not yet in generated Supabase types
      const row = data as Record<string, unknown> | null;
      const fetched: StageStatuses = {
        stage1: (row?.has_completed_onboarding_stage1 as boolean) ?? false,
        stage2: (row?.has_completed_onboarding_stage2 as boolean) ?? false,
        stage3: (row?.has_completed_onboarding_stage3 as boolean) ?? false,
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
  }, [user?.id, isAuthLoading, supabase]);

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

      const column = STAGE_COLUMNS[stage];

      try {
        const { error } = await supabase
          .from('profiles')
          .update({ [column]: true })
          .eq('id', user.id);

        if (error) throw error;

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
    [user?.id, supabase],
  );

  return {
    stageCompleted: statuses,
    isLoading,
    completeStage,
  };
}
