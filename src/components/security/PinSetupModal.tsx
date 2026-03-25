import { useState, useEffect } from 'react';
import { KeyRound, Delete, X, CheckCircle2 } from 'lucide-react';
import { usePinSetup } from '../../hooks/usePinSetup';

interface PinSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PinSetupModal({ isOpen, onClose, onSuccess }: PinSetupModalProps) {
  const { step, error, isSuccess, submitPin, resetSetup } = usePinSetup();
  const [currentPin, setCurrentPin] = useState('');

  // Auto-submissão ao atingir 4 dígitos
  useEffect(() => {
    if (currentPin.length === 4) {
      submitPin(currentPin);
      setCurrentPin(''); // Limpa o buffer visual para o próximo passo
    }
  }, [currentPin, submitPin]);

  // Efeito de sucesso: Mostra o check verde e fecha sozinho após 1.5s
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        handleClose();
        if (onSuccess) onSuccess();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onSuccess]);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (currentPin.length < 4 && !isSuccess) {
      setCurrentPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setCurrentPin(prev => prev.slice(0, -1));
  };

  const handleClose = () => {
    resetSetup();
    setCurrentPin('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-between pb-12 pt-16 animate-in slide-in-from-bottom-full duration-300">
      
      {/* Header com botão de fechar */}
      <div className="absolute top-4 right-4 animate-in fade-in delay-200">
        <button onClick={handleClose} className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-200 transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex flex-col items-center mt-8 px-6 text-center">
        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 transition-colors duration-500 shadow-xl ${isSuccess ? 'bg-emerald-500/20 text-emerald-400 shadow-emerald-500/20' : 'bg-indigo-500/10 text-indigo-500 shadow-indigo-500/10'}`}>
          {isSuccess ? <CheckCircle2 size={32} /> : <KeyRound size={32} />}
        </div>
        
        <h1 className="text-2xl font-black tracking-tight text-white mb-2">
          {isSuccess ? 'PIN Configurado!' : 'Bloqueio por PIN'}
        </h1>
        
        <p className={`text-sm h-5 font-medium ${error ? 'text-rose-500 animate-bounce' : 'text-slate-400'}`}>
          {error 
            ? 'Os PINs não conferem. Tente novamente.' 
            : step === 'CREATE' 
              ? 'Crie um PIN de 4 dígitos' 
              : 'Confirme o seu novo PIN'}
        </p>

        {/* Indicadores Visuais (Bolinhas) */}
        <div className="flex gap-6 mt-10">
          {[0, 1, 2, 3].map((index) => (
            <div 
              key={index}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                isSuccess 
                  ? 'bg-emerald-500 scale-110 shadow-lg shadow-emerald-500/50' 
                  : currentPin.length > index 
                    ? 'bg-indigo-500 scale-110 shadow-lg shadow-indigo-500/50' 
                    : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Teclado Numérico (Thumb-Driven) */}
      <div className="w-full max-w-[320px] grid grid-cols-3 gap-4 px-6 pointer-events-auto">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <button
            key={num}
            disabled={isSuccess}
            onClick={() => handleKeyPress(num)}
            className="h-[72px] rounded-[24px] bg-slate-800 hover:bg-slate-700 active:bg-slate-600 active:scale-95 text-2xl font-bold text-slate-100 transition-all flex items-center justify-center disabled:opacity-50"
          >
            {num}
          </button>
        ))}
        <div />
        <button
          disabled={isSuccess}
          onClick={() => handleKeyPress('0')}
          className="h-[72px] rounded-[24px] bg-slate-800 hover:bg-slate-700 active:bg-slate-600 active:scale-95 text-2xl font-bold text-slate-100 transition-all flex items-center justify-center disabled:opacity-50"
        >
          0
        </button>
        <button
          disabled={isSuccess || currentPin.length === 0}
          onClick={handleDelete}
          className="h-[72px] rounded-[24px] text-slate-400 hover:text-slate-200 active:bg-slate-800 active:scale-95 transition-all flex items-center justify-center disabled:opacity-30 disabled:scale-100"
        >
          <Delete size={28} />
        </button>
      </div>
    </div>
  );
}
