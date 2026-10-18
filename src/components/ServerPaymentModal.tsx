import React, { useState } from 'react';
import { Server, Calendar, DollarSign, Landmark, X, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { SuggestionStore } from '../types';
import { getTodayISO, formatBRL } from '../utils/date';

interface ServerPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: SuggestionStore;
  onConfirmServerPayment: (data: {
    server: string;
    amount: number;
    date: string;
    bank: string;
    notes?: string;
  }) => void;
}

export const ServerPaymentModal: React.FC<ServerPaymentModalProps> = ({
  isOpen,
  onClose,
  suggestions,
  onConfirmServerPayment,
}) => {
  const [server, setServer] = useState<string>('SFL');
  const [amount, setAmount] = useState<number>(50);
  const [date, setDate] = useState<string>(getTodayISO());
  const [bank, setBank] = useState<string>('Nubank');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!server.trim()) return;

    onConfirmServerPayment({
      server: server.trim().toUpperCase(),
      amount: Number(amount) || 0,
      date: date || getTodayISO(),
      bank: bank.trim() || 'Nubank',
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Registrar Pagamento de Servidor</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">
                SAÍDA
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Pagamento de créditos ou recarga de painel de servidor
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Server Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-orange-400" />
              <span>Qual Servidor está sendo pago? *</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {['SFL', 'LVU', 'SP4'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setServer(s)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
                    server.toUpperCase() === s
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <input
              type="text"
              list="server-expense-suggestions"
              required
              value={server}
              onChange={(e) => setServer(e.target.value)}
              placeholder="Digite ou selecione o servidor"
              className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white uppercase focus:outline-none focus:border-orange-500 font-mono"
            />
            <datalist id="server-expense-suggestions">
              {suggestions.servers.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-rose-400" />
                <span>Valor Pago (R$) *</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-pink-400" />
                <span>Data do Pagamento *</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>
          </div>

          {/* Withdrawal Account (Conta de Retirada) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-cyan-400" />
              <span>Conta de Retirada do Valor *</span>
            </label>
            <div className="flex gap-2 mb-2">
              {['Nubank', 'PicPay'].map((quickBank) => (
                <button
                  key={quickBank}
                  type="button"
                  onClick={() => setBank(quickBank)}
                  className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
                    bank.toLowerCase() === quickBank.toLowerCase()
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {quickBank}
                </button>
              ))}
            </div>
            <input
              type="text"
              list="bank-expense-suggestions"
              required
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              placeholder="Digite de qual conta/banco saiu o dinheiro"
              className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            />
            <datalist id="bank-expense-suggestions">
              {suggestions.banks.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Observação / Descrição (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Compra de 20 créditos, recarga mensal"
              className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Warning Summary banner */}
          <div className="rounded-xl border border-orange-500/20 bg-orange-950/20 p-3 text-xs text-slate-300 flex items-center justify-between">
            <span>
              Retirada de <strong className="text-white font-mono">{formatBRL(amount)}</strong> da conta <strong className="text-cyan-400">{bank}</strong>
            </span>
            <span className="text-orange-400 font-semibold">{server.toUpperCase()}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:scale-95 transition-all rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar Pagamento de Servidor</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
