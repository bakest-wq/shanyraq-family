import AsyncStorage from '@react-native-async-storage/async-storage';

const SETUP_ONBOARDING_KEY = '@shanyraq/setup-onboarding-completed';

export const onboardingService = {
  async isSetupCompleted(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(SETUP_ONBOARDING_KEY);
      return value === 'true';
    } catch {
      return false;
    }
  },

  async markSetupCompleted(): Promise<void> {
    await AsyncStorage.setItem(SETUP_ONBOARDING_KEY, 'true');
  },

  async resetSetup(): Promise<void> {
    await AsyncStorage.removeItem(SETUP_ONBOARDING_KEY);
  },
};
