import React from 'react';
import { Wallet, Calendar, Landmark, RotateCcw, Trash2, ClipboardCheck, ArrowUpRight } from 'lucide-react';
import { BankSummary } from '../types';
import { formatBRL } from '../utils/date';

interface FinancialSummaryProps {
  monthlyTotal: number;
  dailyTotal: number;
  bankSummaries: BankSummary[];
  monthLabel: string;
  onOpenConference: () => void;
  onRequestResetMonth: () => void;
  onRequestRemoveAll: () => void;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  monthlyTotal,
  dailyTotal,
  bankSummaries,
  monthLabel,
  onOpenConference,
  onRequestResetMonth,
  onRequestRemoveAll,
}) => {
  // Helper for bank-specific color accents
  const getBankColorStyle = (bankName: string) => {
    const lower = bankName.toLowerCase();
    if (lower.includes('nubank')) {
      return {
        border: 'border-purple-500/30',
        bg: 'bg-purple-950/20',
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        dot: 'bg-purple-400',
      };
    }
    if (lower.includes('picpay')) {
      return {
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-950/20',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        dot: 'bg-emerald-400',
      };
    }
    if (lower.includes('inter')) {
      return {
        border: 'border-orange-500/30',
        bg: 'bg-orange-950/20',
        badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        dot: 'bg-orange-400',
      };
    }
    if (lower.includes('mercado')) {
      return {
        border: 'border-sky-500/30',
        bg: 'bg-sky-950/20',
        badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
        dot: 'bg-sky-400',
      };
    }
    return {
      border: 'border-slate-700/50',
      bg: 'bg-slate-900/40',
      badge: 'bg-slate-800 text-slate-300 border-slate-700',
      dot: 'bg-cyan-400',
    };
  };

  return (
    <section className="space-y-4">
      {/* Top Header with title and management buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Wallet className="w-4 h-4 text-pink-500" />
            <span>Painel Financeiro & Saldos</span>
            <span className="text-xs font-normal text-slate-400">({monthLabel})</span>
          </h2>
          <p className="text-xs text-slate-400">
            Acompanhamento de recebimentos mensais, diários e separação por banco.
          </p>
        </div>

        {/* Security and Conference Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpenConference}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 rounded-lg transition-colors shadow-sm"
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Conferência de Caixa</span>
          </button>

          <button
            type="button"
            onClick={onRequestResetMonth}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/30 hover:bg-amber-900/40 border border-amber-800/50 rounded-lg transition-colors"
            title="Reiniciar valores do mês mediante senha"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar Mês</span>
          </button>

          <button
            type="button"
            onClick={onRequestRemoveAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/50 rounded-lg transition-colors"
            title="Remover totalmente todos os valores de todas as contas mediante senha"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Zerar Todas as Contas</span>
          </button>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Monthly Total Card */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Saldo do Mês Total
              </span>
              <div className="mt-2 text-2xl lg:text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
                {formatBRL(monthlyTotal)}
              </div>
              <span className="inline-block mt-2 text-xs text-slate-400">
                Total acumulado recebido no mês vigente
              </span>
            </div>
            <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Daily Total Card */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Saldo Diário Total
              </span>
              <div className="mt-2 text-2xl lg:text-3xl font-extrabold text-cyan-300 font-mono tabular-nums tracking-tight">
                {formatBRL(dailyTotal)}
              </div>
              <span className="inline-block mt-2 text-xs text-slate-400">
                Recebimentos confirmados hoje
              </span>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Landmark className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Individual Bank Breakdown Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-cyan-400" />
            <span>Saldos das Contas Individuais (Mês)</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            Calculados separadamente por banco
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {bankSummaries.map((summary) => {
            const styles = getBankColorStyle(summary.bank);
            return (
              <div
                key={summary.bank}
                className={`rounded-xl border ${styles.border} ${styles.bg} p-3.5 transition-all hover:border-slate-600/70`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${styles.badge} truncate`}>
                    {summary.bank}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">
                    {summary.count} {summary.count === 1 ? 'pgto' : 'pgtos'}
                  </span>
                </div>

                <div className="mt-1">
                  <div className="text-base font-bold text-white font-mono tabular-nums">
                    {formatBRL(summary.monthlyTotal)}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1 pt-1 border-t border-slate-800/80 font-mono">
                    <span>Hoje:</span>
                    <span className={summary.dailyTotal > 0 ? 'text-cyan-300 font-semibold' : 'text-slate-400'}>
                      {formatBRL(summary.dailyTotal)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
