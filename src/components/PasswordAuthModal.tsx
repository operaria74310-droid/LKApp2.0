import React, { useState } from 'react';
import { Lock, AlertCircle, X, ShieldAlert } from 'lucide-react';
import { verifyAdminPassword } from '../utils/storage';

interface PasswordAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  dangerLevel?: 'warning' | 'danger';
  onSuccess: () => void;
}

export const PasswordAuthModal: React.FC<PasswordAuthModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel = 'Confirmar Operação',
  dangerLevel = 'warning',
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Por favor, digite a senha de segurança.');
      return;
    }

    if (verifyAdminPassword(password)) {
      setError(null);
      setPassword('');
      onSuccess();
      onClose();
    } else {
      setError('Senha de segurança incorreta. Ação não autorizada.');
      setPassword('');
    }
  };

  const handleClose = () => {
    setPassword('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div
            className={`p-3 rounded-xl ${
              dangerLevel === 'danger'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            {dangerLevel === 'danger' ? <ShieldAlert className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{title}</h3>
            <span className="text-xs text-slate-400">Autenticação de Segurança</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-5">
          {description}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Digite a Senha de Segurança
            </label>
            <div className="relative">
              <input
                type="password"
                autoFocus
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 font-mono tracking-widest"
              />
            </div>
            {error && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-all shadow-sm ${
                dangerLevel === 'danger'
                  ? 'bg-rose-600 hover:bg-rose-500 active:scale-95'
                  : 'bg-amber-600 hover:bg-amber-500 active:scale-95'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
