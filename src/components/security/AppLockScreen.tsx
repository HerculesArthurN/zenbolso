import { useState, useEffect } from 'react';
import { Lock, Delete, TriangleAlert } from 'lucide-react';
import { useAppLock } from '../../hooks/useAppLock';
import { useGhostProtocol } from '../../hooks/useGhostProtocol';

export function AppLockScreen() {
  const { isLocked, isChecking, unlockApp } = useAppLock();
  const { executeWipeout } = useGhostProtocol();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [showNuclearModal, setShowNuclearModal] = useState(false);

  // Auto-submissão quando chegar a 4 dígitos
  useEffect(() => {
    if (pin.length === 4) {
      handleVerify();
    }
  }, [pin]);

  if (isChecking || !isLocked) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      setError(false);
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setError(false);
    setPin(prev => prev.slice(0, -1));
  };

  const handleVerify = async () => {
    const success = await unlockApp(pin);
    if (!success) {
      setError(true);
      setPin(''); // Reseta em caso de erro
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-between pb-12 pt-24 animate-in fade-in">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-6">
          <Lock size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Zenbolso Bloqueado</h1>
        <p className={`text-sm ${error ? 'text-rose-500 animate-bounce' : 'text-slate-400'}`}>
          {error ? 'PIN incorreto. Tente novamente.' : 'Digite seu PIN de 4 dígitos'}
        </p>

        {/* Indicadores Visuais do PIN */}
        <div className="flex gap-4 mt-8">
          {[0, 1, 2, 3].map((index) => (
            <div 
              key={index}
              className={`w-4 h-4 rounded-full transition-colors ${
                pin.length > index ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Teclado Numérico (Thumb-Driven) */}
      <div className="w-full max-w-[320px] grid grid-cols-3 gap-4 px-6">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num)}
            className="h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-2xl font-semibold text-slate-100 transition-colors flex items-center justify-center"
          >
            {num}
          </button>
        ))}
        <div /> {/* Espaço vazio inferior esquerdo */}
        <button
          onClick={() => handleKeyPress('0')}
          className="h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-2xl font-semibold text-slate-100 transition-colors flex items-center justify-center"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="h-16 rounded-2xl text-slate-400 hover:text-slate-200 active:bg-slate-800 transition-colors flex items-center justify-center"
        >
          <Delete size={28} />
        </button>
      </div>

      <button 
        onClick={() => setShowNuclearModal(true)}
        className="text-slate-500 hover:text-slate-300 text-sm font-bold tracking-wide uppercase transition-colors mb-6"
      >
        Esqueci meu PIN
      </button>

      {/* MODAL NUCLEAR (Protocolo Fantasma) */}
      {showNuclearModal && (
        <div className="absolute inset-0 z-[110] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-6 animate-in zoom-in-95 duration-200">
          <div className="bg-slate-800 border border-rose-500/30 rounded-3xl p-8 max-w-[340px] text-center shadow-2xl flex flex-col gap-6">
            <div className="w-16 h-16 bg-rose-500/10 rounded-[20px] flex items-center justify-center text-rose-500 mx-auto shadow-xl shadow-rose-500/20">
              <TriangleAlert size={32} />
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-100 mb-2 uppercase tracking-widest">Atenção Extrema</h2>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Como o Zenbolso é 100% offline e focado em privacidade, <strong className="text-rose-400">não temos como recuperar sua senha</strong>. A única forma de voltar a usar o app é <strong className="text-rose-400">apagando todos os seus dados atuais</strong>. Deseja destruir tudo e recomeçar?
                </p>
            </div>
            <div className="flex flex-col gap-3">
              <button 
                onClick={executeWipeout}
                className="w-full py-4 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold tracking-widest uppercase text-xs rounded-2xl transition-all shadow-lg shadow-rose-500/20"
              >
                Sim, Apagar Tudo
              </button>
              <button 
                onClick={() => setShowNuclearModal(false)}
                className="w-full py-4 bg-slate-700 hover:bg-slate-600 active:scale-95 text-slate-200 font-bold tracking-widest uppercase text-xs rounded-2xl transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
