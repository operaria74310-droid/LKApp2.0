import React, { useState, useEffect } from 'react';
import { CheckCircle2, Calendar, DollarSign, Landmark, X, MessageSquare, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { Client, PaymentRecord, SuggestionStore } from '../types';
import { getTodayISO, addMonthsPreservingDay, formatBRL, formatDateBR } from '../utils/date';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  suggestions: SuggestionStore;
  onConfirmPayment: (data: {
    client: Client;
    paymentAmount: number;
    paymentBank: string;
    paymentDate: string;
    nextDueDate: string;
    advanceMonths: number;
    notes?: string;
    openWhatsApp?: boolean;
  }) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  client,
  suggestions,
  onConfirmPayment,
}) => {
  const [paymentDate, setPaymentDate] = useState(getTodayISO());
  const [amount, setAmount] = useState<number>(35);
  const [bank, setBank] = useState<string>('Nubank');
  const [nextDueDate, setNextDueDate] = useState<string>('');
  const [advanceMonths, setAdvanceMonths] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [sendWhatsApp, setSendWhatsApp] = useState<boolean>(true);

  // When client changes or modal opens
  useEffect(() => {
    if (client) {
      setPaymentDate(getTodayISO());
      setAdvanceMonths(1);
      setAmount(client.price || 35);
      setBank(client.bank || 'Nubank');
      const baseDate = client.dueDate || getTodayISO();
      setNextDueDate(addMonthsPreservingDay(baseDate, 1));
      setNotes('');
    }
  }, [client]);

  // When advanceMonths changes
  const handleSelectAdvanceMonths = (months: number) => {
    if (!client) return;
    setAdvanceMonths(months);
    const baseDate = client.dueDate || getTodayISO();
    const newNextDate = addMonthsPreservingDay(baseDate, months);
    setNextDueDate(newNextDate);
    // Suggest proportional amount
    setAmount((client.price || 35) * months);
    if (months > 1) {
      setNotes(`Adiantamento de ${months} meses confirmado`);
    } else {
      setNotes('');
    }
  };

  if (!isOpen || !client) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    onConfirmPayment({
      client,
      paymentAmount: Number(amount) || client.price,
      paymentBank: bank.trim() || client.bank,
      paymentDate,
      nextDueDate: nextDueDate || addMonthsPreservingDay(client.dueDate, advanceMonths),
      advanceMonths,
      notes: notes.trim(),
      openWhatsApp: sendWhatsApp && Boolean(client.phone),
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

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Confirmar Recebimento</span>
              {advanceMonths > 1 && (
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                  Adiantamento ({advanceMonths}m)
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              Renovação mensal ou adiantamento de múltiplas parcelas
            </p>
          </div>
        </div>

        {/* Client Info Banner */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 mb-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white">{client.name}</span>
            <span className="text-xs font-mono text-cyan-400">
              {client.server} · {client.app}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Vencimento base: <strong className="text-slate-300 font-mono">{formatDateBR(client.dueDate)}</strong></span>
            <span>{client.accessCount} {client.accessCount === 1 ? 'tela/acesso' : 'telas/acessos'} {client.hasPmd ? '· PMD Ativo' : ''}</span>
          </div>
        </div>

        {/* Advance Payment Options (Adiantamento) */}
        <div className="mb-4 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-pink-400" />
              <span>Período / Adiantamento de Pagamento:</span>
            </span>
            <span className="text-[11px] text-cyan-400 font-medium">
              {advanceMonths === 1 ? '1 Mensalidade' : `${advanceMonths} Meses Adiantados`}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { months: 1, label: '1 Mês' },
              { months: 2, label: '2 Meses' },
              { months: 3, label: '3 Meses' },
              { months: 6, label: '6 Meses' },
              { months: 12, label: '1 Ano' },
            ].map((opt) => (
              <button
                key={opt.months}
                type="button"
                onClick={() => handleSelectAdvanceMonths(opt.months)}
                className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  advanceMonths === opt.months
                    ? 'bg-gradient-to-r from-pink-500/20 to-cyan-500/20 border-cyan-400 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form to alter value, date, bank and next date */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payment Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-pink-400" />
                <span>Data do Recebimento</span>
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>

            {/* Received Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Valor Recebido (R$)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>
          </div>

          {/* Receiving Bank */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-cyan-400" />
              <span>Banco em que Recebeu</span>
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
              list="bank-suggestions"
              required
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              placeholder="Digite ou selecione o banco"
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
            />
            <datalist id="bank-suggestions">
              {suggestions.banks.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>

          {/* Next Due Date (Auto + advanceMonths) */}
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3.5">
            <label className="block text-xs font-semibold text-cyan-300 mb-1.5 flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5" />
              <span>
                {advanceMonths > 1
                  ? `Novo Vencimento (+${advanceMonths} Meses Adiantados)`
                  : 'Próximo Vencimento (Mês Seguinte)'}
              </span>
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              Agendado para <strong className="text-white font-mono">{formatDateBR(nextDueDate)}</strong>. Você pode ajustar a data livremente se desejar:
            </p>
            <input
              type="date"
              required
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Observação do Pagamento (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Recebido via PIX, comprovante enviado"
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* WhatsApp Confirmation Toggle */}
          {client.phone && (
            <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/40 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={sendWhatsApp}
                onChange={(e) => setSendWhatsApp(e.target.checked)}
                className="w-4 h-4 rounded text-pink-500 focus:ring-pink-500 bg-slate-900 border-slate-700"
              />
              <span className="text-xs text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enviar comprovante/recibo no WhatsApp do cliente</span>
              </span>
            </label>
          )}

          {/* Action Buttons */}
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
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 transition-all rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {advanceMonths > 1
                  ? `Confirmar Adiantamento (+${advanceMonths} Meses)`
                  : 'Confirmar & Renovar (+1 Mês)'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
