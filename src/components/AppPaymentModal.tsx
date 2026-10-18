import React, { useState } from 'react';
import { Smartphone, User, Hash, Key, DollarSign, Calendar, Landmark, X, CheckCircle2 } from 'lucide-react';
import { Client, SuggestionStore } from '../types';
import { getTodayISO, formatBRL } from '../utils/date';
import { CalendarPicker } from './CalendarPicker';

interface AppPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  suggestions: SuggestionStore;
  onConfirmAppPayment: (data: {
    clientName: string;
    app: string;
    mac: string;
    key: string;
    amount: number;
    date: string;
    bank: string;
    notes?: string;
  }) => void;
}

export const AppPaymentModal: React.FC<AppPaymentModalProps> = ({
  isOpen,
  onClose,
  clients,
  suggestions,
  onConfirmAppPayment,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [app, setApp] = useState<string>('IBO Player');
  const [mac, setMac] = useState<string>('');
  const [key, setKey] = useState<string>('');
  const [amount, setAmount] = useState<number>(15);
  const [date, setDate] = useState<string>(getTodayISO());
  const [bank, setBank] = useState<string>('Nubank');
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  // When user picks an existing client from dropdown, autofill!
  const handleSelectExistingClient = (clientId: string) => {
    setSelectedClientId(clientId);
    const found = clients.find((c) => c.id === clientId);
    if (found) {
      setClientName(found.name);
      if (found.app) setApp(found.app);
      if (found.mac) setMac(found.mac);
      if (found.key) setKey(found.key);
      if (found.bank) setBank(found.bank);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !app.trim()) return;

    onConfirmAppPayment({
      clientName: clientName.trim(),
      app: app.trim(),
      mac: mac.trim(),
      key: key.trim(),
      amount: Number(amount) || 0,
      date: date || getTodayISO(),
      bank: bank.trim() || 'Nubank',
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Registrar Pagamento de Aplicativo</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                SAÍDA
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Pagamento de licença ou ativação de aplicativo para cliente
            </p>
          </div>
        </div>

        {/* Optional quick client autofill */}
        {clients.length > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Preencher dados a partir de um cliente já cadastrado (Opcional):
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => handleSelectExistingClient(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="">-- Selecionar mensalista para preencher MAC/Key --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.app} · MAC: {c.mac || 'S/ MAC'})
                </option>
              ))}
            </select>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cliente & Aplicativo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cliente */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-pink-400" />
                <span>Cliente *</span>
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Carlos Eduardo Silva"
                className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Aplicativo */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                <span>Aplicativo *</span>
              </label>
              <input
                type="text"
                list="app-expense-suggestions"
                required
                value={app}
                onChange={(e) => setApp(e.target.value)}
                placeholder="Ex: IBO Player, TiviMate..."
                className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              />
              <datalist id="app-expense-suggestions">
                {suggestions.apps.map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
            </div>
          </div>

          {/* MAC & Key */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* MAC */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-amber-400" />
                <span>Endereço MAC</span>
              </label>
              <input
                type="text"
                value={mac}
                onChange={(e) => setMac(e.target.value)}
                placeholder="Ex: 00:1A:79:XX:XX:XX"
                className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white uppercase font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Key */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Key / Chave</span>
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Ex: 123456 ou chave de ativação"
                className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Valor & Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Valor */}
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
                className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Data */}
            <div>
              <CalendarPicker
                label="Data do Pagamento (Aceita meses passados)"
                value={date}
                onChange={(d) => setDate(d)}
              />
            </div>
          </div>

          {/* Conta de Retirada do Valor */}
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
              list="bank-app-expense-suggestions"
              required
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              placeholder="Digite de qual conta/banco saiu o dinheiro"
              className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
            />
            <datalist id="bank-app-expense-suggestions">
              {suggestions.banks.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Observações (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Licença anual IBO Player, ativação automática"
              className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Warning Summary banner */}
          <div className="rounded-xl border border-purple-500/20 bg-purple-950/20 p-3 text-xs text-slate-300 flex items-center justify-between">
            <span>
              Retirada de <strong className="text-white font-mono">{formatBRL(amount)}</strong> da conta <strong className="text-cyan-400">{bank}</strong>
            </span>
            <span className="text-purple-400 font-semibold">{app}</span>
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
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 transition-all rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar Pagamento do App</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
