import React from 'react';
import {
  Wallet,
  Calendar,
  Landmark,
  RotateCcw,
  Trash2,
  ClipboardCheck,
  Server,
  Smartphone,
  TrendingUp,
  TrendingDown,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { BankSummary } from '../types';
import { formatBRL } from '../utils/date';

interface FinancialSummaryProps {
  monthlyTotal: number; // Net
  dailyTotal: number; // Net
  monthlyIncome: number;
  monthlyExpense: number;
  serverExpenseMonthly: number;
  appExpenseMonthly: number;
  dailyIncome: number;
  dailyExpense: number;
  bankSummaries: BankSummary[];
  monthLabel: string;
  onOpenPayServer: () => void;
  onOpenPayApp: () => void;
  onOpenConference: () => void;
  onRequestResetMonth: () => void;
  onRequestRemoveAll: () => void;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  monthlyTotal,
  dailyTotal,
  monthlyIncome,
  monthlyExpense,
  serverExpenseMonthly,
  appExpenseMonthly,
  dailyIncome,
  dailyExpense,
  bankSummaries,
  monthLabel,
  onOpenPayServer,
  onOpenPayApp,
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
      };
    }
    if (lower.includes('picpay')) {
      return {
        border: 'border-emerald-500/30',
        bg: 'bg-emerald-950/20',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      };
    }
    if (lower.includes('inter')) {
      return {
        border: 'border-orange-500/30',
        bg: 'bg-orange-950/20',
        badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      };
    }
    if (lower.includes('mercado')) {
      return {
        border: 'border-sky-500/30',
        bg: 'bg-sky-950/20',
        badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      };
    }
    return {
      border: 'border-slate-700/50',
      bg: 'bg-slate-900/40',
      badge: 'bg-slate-800 text-slate-300 border-slate-700',
    };
  };

  return (
    <section className="space-y-4">
      {/* Top Header with title and management buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Wallet className="w-4 h-4 text-pink-500" />
            <span>Fluxo de Caixa & Saldos</span>
            <span className="text-xs font-normal text-slate-400 capitalize">({monthLabel})</span>
          </h2>
          <p className="text-xs text-slate-400">
            Controle de recebimentos de clientes, pagamentos de servidores e licenças de aplicativos.
          </p>
        </div>

        {/* Action Buttons: Pay Server, Pay App, Conference, and Resets */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Quick Expense Buttons */}
          <button
            type="button"
            onClick={onOpenPayServer}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-orange-200 bg-orange-950/50 hover:bg-orange-900/60 border border-orange-700/60 rounded-lg transition-all shadow-sm active:scale-95"
          >
            <Server className="w-3.5 h-3.5 text-orange-400" />
            <span>Pagar Servidor</span>
          </button>

          <button
            type="button"
            onClick={onOpenPayApp}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-200 bg-purple-950/50 hover:bg-purple-900/60 border border-purple-700/60 rounded-lg transition-all shadow-sm active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-400" />
            <span>Pagar Aplicativo</span>
          </button>

          <button
            type="button"
            onClick={onOpenConference}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 rounded-lg transition-colors shadow-sm"
          >
            <ClipboardCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Conferência / Extrato</span>
          </button>

          <button
            type="button"
            onClick={onRequestResetMonth}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/30 hover:bg-amber-900/40 border border-amber-800/50 rounded-lg transition-colors"
            title="Reiniciar valores do mês mediante senha"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar Mês</span>
          </button>

          <button
            type="button"
            onClick={onRequestRemoveAll}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/50 rounded-lg transition-colors"
            title="Remover totalmente todos os valores de todas as contas mediante senha"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Zerar Todas as Contas</span>
          </button>
        </div>
      </div>

      {/* Main KPI Cards Grid (3 cards: Saldo Líquido Mês, Saldo Diário, Total de Despesas) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Saldo Líquido do Mês */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Saldo do Mês (Líquido)
              </span>
              <div
                className={`mt-1 text-2xl lg:text-3xl font-extrabold font-mono tabular-nums tracking-tight ${
                  monthlyTotal >= 0 ? 'text-white' : 'text-rose-400'
                }`}
              >
                {formatBRL(monthlyTotal)}
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>+{formatBRL(monthlyIncome)}</span>
                </span>
                <span className="text-rose-400 flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3" />
                  <span>-{formatBRL(monthlyExpense)}</span>
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 shrink-0 ml-3">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 2: Saldo Diário Total */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Saldo Diário (Hoje)
              </span>
              <div
                className={`mt-1 text-2xl lg:text-3xl font-extrabold font-mono tabular-nums tracking-tight ${
                  dailyTotal >= 0 ? 'text-cyan-300' : 'text-rose-400'
                }`}
              >
                {formatBRL(dailyTotal)}
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  <span>+{formatBRL(dailyIncome)}</span>
                </span>
                <span className="text-rose-400 flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3" />
                  <span>-{formatBRL(dailyExpense)}</span>
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0 ml-3">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 3: Despesas do Mês (Servidores + Aplicativos) */}
        <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-900/50 p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total de Saídas / Despesas
              </span>
              <div className="mt-1 text-2xl lg:text-3xl font-extrabold text-rose-400 font-mono tabular-nums tracking-tight">
                {formatBRL(monthlyExpense)}
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-orange-400 flex items-center gap-1" title="Gastos com Servidor">
                  <Server className="w-3 h-3" />
                  <span>Serv: {formatBRL(serverExpenseMonthly)}</span>
                </span>
                <span className="text-purple-400 flex items-center gap-1" title="Gastos com Aplicativo">
                  <Smartphone className="w-3 h-3" />
                  <span>App: {formatBRL(appExpenseMonthly)}</span>
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0 ml-3">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Individual Bank Accounts Breakdown */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-cyan-400" />
            <span>Saldos das Contas Individuais (Entradas e Saídas no Mês)</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            Calculados separadamente por banco de recebimento e retirada
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                    {summary.count} {summary.count === 1 ? 'mov' : 'movs'}
                  </span>
                </div>

                <div className="mt-1">
                  <div
                    className={`text-base font-bold font-mono tabular-nums ${
                      summary.netMonthly >= 0 ? 'text-white' : 'text-rose-400'
                    }`}
                  >
                    {formatBRL(summary.netMonthly)}
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-emerald-400 font-medium" title="Entradas">
                      +{formatBRL(summary.incomeMonthly)}
                    </span>
                    <span className="text-rose-400 font-medium" title="Saídas">
                      -{formatBRL(summary.expenseMonthly)}
                    </span>
                  </div>

                  <div className="mt-1 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                    <span>Hoje (líq.):</span>
                    <span className={summary.netDaily >= 0 ? 'text-cyan-300' : 'text-rose-400'}>
                      {formatBRL(summary.netDaily)}
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
