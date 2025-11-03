
import React, { useState } from 'react';
import { LockIcon } from './Icons';

interface LoginScreenProps {
    onLogin: (password: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(password);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-200">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <div className="flex flex-col items-center">
                    <div className="p-3 bg-brand-primary rounded-full text-white">
                       <LockIcon />
                    </div>
                    <h1 className="text-2xl font-bold text-center text-brand-dark mt-4">Acceso Protegido</h1>
                    <p className="text-center text-brand-secondary">Por favor, introduce la contraseña para continuar.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="sr-only">Contraseña</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                            placeholder="Contraseña"
                        />
                    </div>
                    <button
                        type="submit"
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginScreen;
