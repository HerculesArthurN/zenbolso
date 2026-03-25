import { useState, useEffect } from 'react';
import { securityService } from '../services/securityService';

export function useAppLock() {
  const [isChecking, setIsChecking] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    async function checkLockStatus() {
      const hasPin = await securityService.hasPinSetup();
      setIsLocked(hasPin);
      setIsChecking(false);
    }
    checkLockStatus();
  }, []);

  const unlockApp = async (pin: string): Promise<boolean> => {
    const isValid = await securityService.verifyPin(pin);
    if (isValid) {
      setIsLocked(false);
    }
    return isValid;
  };

  return { isChecking, isLocked, unlockApp };
}
