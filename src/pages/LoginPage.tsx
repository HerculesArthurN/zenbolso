import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/ui/BrandLogo';

export const LoginPage: React.FC = () => {
    const { signInWithOtp } = useAuth();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedEmail = email.trim();
        if (!trimmedEmail) return;

        setIsLoading(true);
        setError(null);

        try {
            console.log('Initiating Magic Link login for:', trimmedEmail);
            const { error: otpError } = await signInWithOtp(trimmedEmail);

            if (otpError) {
                console.error('Supabase Auth Error:', otpError);

                // Specific error handling for better UX
                if (otpError.status === 429 || otpError.message?.includes('rate limit')) {
                    setError('Muitas solicitações. Por favor, aguarde alguns minutos antes de tentar novamente.');
                } else if (otpError.status === 400 || otpError.message?.includes('invalid email')) {
                    setError('E-mail inválido. Por favor, verifique o endereço digitado.');
                } else {
                    setError(otpError.message || 'Ocorreu um erro ao enviar o link. Tente novamente.');
                }
                return;
            }

            setIsSent(true);
        } catch (err: any) {
            console.error('Unexpected Login error:', err);

            if (err.message === 'Failed to fetch') {
                setError('Erro de Conexão: Verifique sua internet ou a configuração do Supabase.');
            } else {
                setError('Um erro inesperado ocorreu. Por favor, tente novamente mais tarde.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
            </div>

            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 md:p-10 relative z-10 transition-all">

                <button
                    onClick={() => navigate('/')}
                    className="absolute top-8 left-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="text-center mb-8 pt-4">
                    <div className="mb-6 relative">
                        <div className="w-28 h-28 bg-slate-50 dark:bg-slate-800 rounded-[32px] flex items-center justify-center mx-auto shadow-inner border border-slate-100 dark:border-slate-800">
                            <BrandLogo className="w-20 h-20" variant="color" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-900 p-2 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 animate-bounce">
                            <Mail size={20} className="text-teal-600" />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter mb-2">
                        <span className="text-slate-900 dark:text-white">ZEN</span>
                        <span className="text-teal-600">BOLSO</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                        Economize com calma. Entre no seu cofre digital.
                    </p>
                </div>

                {/* Info Box */}
                <div className="mb-8 flex gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-2xl border border-blue-100 dark:border-blue-900/30 text-left">
                    <Mail size={18} className="shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                    <p className="text-xs leading-relaxed font-medium">
                        Nota: Ao entrar, você acessará sua conta na nuvem. Seus dados de 'Modo Visitante' permanecerão salvos neste dispositivo, mas separados da nuvem.
                    </p>
                </div>

                {!isSent ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">
                                Endereço de e-mail
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="exemplo@email.com"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm py-2 px-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/30">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Enviando...</span>
                                </>
                            ) : (
                                <span>Enviar Link Mágico</span>
                            )}
                        </button>
                    </form>
                ) : (
                    <div className="text-center py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            E-mail enviado!
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">
                            Verifique sua caixa de entrada para o link de login!
                        </p>
                        <button
                            onClick={() => setIsSent(false)}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                        >
                            Não recebeu? Tentar novamente
                        </button>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-400">
                        Sem senhas. Mantemos as coisas simples e seguras.
                    </p>
                </div>
            </div>
        </div>
    );
};
