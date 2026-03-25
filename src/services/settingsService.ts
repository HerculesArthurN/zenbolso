export const settingsService = {
  getOnboardingFlag: async (): Promise<boolean> => {
    // Simulamos uma promise para manter a assinatura assíncrona (preparando para caso vá para o Dexie no futuro)
    return Promise.resolve(localStorage.getItem('@zenbolso:onboarding_completed') === 'true');
  },

  setOnboardingFlag: async (value: boolean): Promise<void> => {
    localStorage.setItem('@zenbolso:onboarding_completed', String(value));
    return Promise.resolve();
  }
};
