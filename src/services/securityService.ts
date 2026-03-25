// Utilitário interno para gerar o Hash SHA-256 nativo
async function hashPin(pin: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const PIN_KEY = '@zenbolso:pin_hash';

export const securityService = {
  hasPinSetup: async (): Promise<boolean> => {
    return Promise.resolve(!!localStorage.getItem(PIN_KEY));
  },

  setupPin: async (pin: string): Promise<boolean> => {
    if (pin.length !== 4) return false;
    const hash = await hashPin(pin);
    localStorage.setItem(PIN_KEY, hash);
    return true;
  },

  verifyPin: async (pin: string): Promise<boolean> => {
    const storedHash = localStorage.getItem(PIN_KEY);
    if (!storedHash) return false;
    
    const inputHash = await hashPin(pin);
    return inputHash === storedHash;
  },

  removePin: async (): Promise<boolean> => {
    localStorage.removeItem(PIN_KEY);
    return true;
  }
};
