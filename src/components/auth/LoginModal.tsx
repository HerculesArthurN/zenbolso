import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Info, Loader2 } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const { signInWithOtp } = useAuth();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        setError(null);

        try {
            const { error: otpError } = await signInWithOtp(email);
            if (otpError) throw otpError;
            setIsSent(true);
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar link mágico.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Entrar no ZenBolso">
            <div className="space-y-6 pt-4">
                {/* Info Box */}
                <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <Info size={20} className="shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed font-medium">
                        Nota: Ao entrar, você acessará sua conta na nuvem. Seus dados de 'Modo Visitante' permanecerão salvos neste dispositivo, mas separados da nuvem.
                    </p>
                </div>

                {!isSent ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="modal-email" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                                E-mail
                            </label>
                            <input
                                id="modal-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl border border-rose-100 dark:border-rose-900/30">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Mail size={18} />
                            )}
                            {isLoading ? 'Enviando...' : 'Enviar Link Mágico'}
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-6 space-y-4">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                            <Mail size={32} />
                        </div>
                        <h3 className="text-xl font-bold">Link Enviado!</h3>
                        <p className="text-sm text-slate-500">Verifique seu e-mail para acessar o ZenBolso.</p>
                        <button
                            onClick={() => setIsSent(false)}
                            className="text-sm font-bold text-indigo-600 hover:underline"
                        >
                            Tentar outro e-mail
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
};
