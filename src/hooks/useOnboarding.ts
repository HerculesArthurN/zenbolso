import { useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';
import { seedService } from '../services/seedService';

export function useOnboarding() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isInjecting, setIsInjecting] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      const hasSeen = await settingsService.getOnboardingFlag();
      setShowOnboarding(!hasSeen);
      setIsLoading(false);
    }
    checkStatus();
  }, []);

  const completeOnboarding = async () => {
    await settingsService.setOnboardingFlag(true);
    setShowOnboarding(false);
  };

  const generateSeedDataAndComplete = async () => {
    setIsInjecting(true);
    await seedService.injectMockData();
    await settingsService.setOnboardingFlag(true);
    setShowOnboarding(false);
    setIsInjecting(false);
  };

  return { 
    isLoading, 
    showOnboarding, 
    isInjecting,
    completeOnboarding, 
    generateSeedDataAndComplete 
  };
}
