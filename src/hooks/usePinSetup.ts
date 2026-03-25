import { useState } from 'react';
import { securityService } from '../services/securityService';

type SetupStep = 'CREATE' | 'CONFIRM';

export function usePinSetup() {
  const [step, setStep] = useState<SetupStep>('CREATE');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const submitPin = async (pin: string) => {
    if (step === 'CREATE') {
      setFirstPin(pin);
      setStep('CONFIRM');
      setError(false);
    } else if (step === 'CONFIRM') {
      if (pin === firstPin) {
        await securityService.setupPin(pin);
        setIsSuccess(true);
        setError(false);
      } else {
        // Falha na confirmação: O dedo escorregou. Reseta o processo por segurança.
        setFirstPin('');
        setStep('CREATE');
        setError(true);
      }
    }
  };

  const resetSetup = () => {
    setStep('CREATE');
    setFirstPin('');
    setError(false);
    setIsSuccess(false);
  };

  return { step, error, isSuccess, submitPin, resetSetup };
}
