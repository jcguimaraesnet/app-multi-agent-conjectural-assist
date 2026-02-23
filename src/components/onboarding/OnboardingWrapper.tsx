"use client";

import { useMemo } from 'react';
import { OnbordaProvider, Onborda } from 'onborda';
import { usePathname } from 'next/navigation';
import { getOnboardingTours } from '@/constants/onboarding-steps';
import { useProject } from '@/contexts/ProjectContext';
import { useOnboardingStatus, type OnboardingStage } from '@/hooks/useOnboardingStatus';
import TourCard from './TourCard';
import OnboardingManager from './OnboardingManager';

const TOUR_STAGE_MAP: Record<string, OnboardingStage> = {
  'home-tour': 'stage1',
  'settings-tour': 'stage2',
  'projects-tour': 'stage3',
};

export default function OnboardingWrapper({ children }: { children: React.ReactNode }) {
  const { projects } = useProject();
  const { stageCompleted, isLoading } = useOnboardingStatus();
  const pathname = usePathname();

  const steps = useMemo(() => {
    if (isLoading) return [];

    const allTours = getOnboardingTours(projects.length > 0);

    return allTours.filter((tour) => {
      const stage = TOUR_STAGE_MAP[tour.tour];
      return stage ? !stageCompleted[stage] : true;
    });
  }, [projects.length > 0, stageCompleted, isLoading]);

  return (
    <OnbordaProvider key={pathname}>
      <Onborda
        steps={steps}
        showOnborda={true}
        shadowRgb="0,0,0"
        shadowOpacity="0.8"
        cardComponent={TourCard}
      >
        <OnboardingManager stageCompleted={stageCompleted} isOnboardingLoading={isLoading} />
        {children}
      </Onborda>
    </OnbordaProvider>
  );
}
