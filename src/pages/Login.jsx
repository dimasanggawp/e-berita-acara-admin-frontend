import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Loader2, AlertCircle } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(username, password);
        } catch (err) {
            setError(err.response?.data?.message || 'Username atau password salah');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-white dark:bg-[#020617] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden transition-colors duration-500">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-15%] left-[-15%] w-[60%] sm:w-[40%] h-[60%] sm:h-[40%] bg-sunset/10 dark:bg-sunset/20 rounded-full blur-[80px] sm:blur-[120px]" />
            <div className="absolute bottom-[-15%] right-[-15%] w-[60%] sm:w-[40%] h-[60%] sm:h-[40%] bg-violet/10 dark:bg-violet/20 rounded-full blur-[80px] sm:blur-[120px]" />

            {/* Floating Theme Toggle */}
            <div className="absolute top-6 right-6 z-50">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-[420px] relative z-10 animate-in fade-in zoom-in duration-700">
                <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-100 dark:border-slate-800 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 transition-all duration-300">
                    <div className="text-center mb-10">
                        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sunset/20 to-violet/20 border border-sunset/20 mb-6 group-hover:scale-110 transition-transform">
                            <Lock className="text-sunset" size={28} />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-sunset to-violet bg-clip-text text-transparent mb-3">
                            Portal Admin
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base">Silakan masuk untuk melanjutkan</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 dark:bg-sunset/10 border border-red-500/20 dark:border-sunset/20 text-red-500 dark:text-sunset/90 p-4 rounded-2xl flex items-center gap-3 text-sm animate-shake">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">
                                Nama Pengguna
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sunset transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 pl-11 pr-4 py-3.5 rounded-2xl focus:border-sunset/50 focus:ring-4 focus:ring-sunset/5 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 font-medium"
                                    placeholder="admin"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">
                                Kata Sandi
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sunset transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 pl-11 pr-4 py-3.5 rounded-2xl focus:border-sunset/50 focus:ring-4 focus:ring-sunset/5 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-sunset to-violet text-white font-black py-4 rounded-2xl shadow-lg shadow-sunset/10 hover:shadow-sunset/20 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                        >
                            {isLoading ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : (
                                'Masuk'
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-10 text-slate-400 dark:text-slate-600 text-sm font-bold tracking-tight">
                    &copy; 2026 Sistem Manajemen Ujian
                </p>
            </div>
        </div>
    );
};

export default Login;
