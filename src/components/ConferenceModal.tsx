import React, { useState, useMemo } from 'react';
import {
  ClipboardCheck,
  Search,
  Filter,
  Trash2,
  Download,
  X,
  TrendingUp,
  TrendingDown,
  Server,
  Smartphone,
  Landmark,
} from 'lucide-react';
import { PaymentRecord, ExpenseRecord } from '../types';
import { formatBRL, formatDateBR } from '../utils/date';

interface UnifiedTransaction {
  id: string;
  source: 'payment' | 'server_expense' | 'app_expense';
  date: string;
  title: string;
  subDetail: string;
  bank: string;
  amount: number; // positive for income, negative for expense
  rawAmount: number;
  timestamp: number;
  notes?: string;
}

interface ConferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  payments: PaymentRecord[];
  expenses: ExpenseRecord[];
  onDeletePayment: (paymentId: string) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const ConferenceModal: React.FC<ConferenceModalProps> = ({
  isOpen,
  onClose,
  payments,
  expenses,
  onDeletePayment,
  onDeleteExpense,
}) => {
  const [search, setSearch] = useState('');
  const [selectedBank, setSelectedBank] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'server' | 'app'>('all');

  // Build unified transactions
  const unifiedTransactions = useMemo(() => {
    const list: UnifiedTransaction[] = [];

    // 1. Payments received
    payments.forEach((p) => {
      list.push({
        id: p.id,
        source: 'payment',
        date: p.paymentDate,
        title: p.clientName,
        subDetail: `${p.server || ''} · ${p.app || ''}`.trim(),
        bank: p.bank,
        amount: p.amount,
        rawAmount: p.amount,
        timestamp: p.timestamp,
        notes: p.notes,
      });
    });

    // 2. Expenses paid
    expenses.forEach((e) => {
      let subDetail = '';
      if (e.type === 'server') {
        subDetail = `Servidor: ${e.server || ''}`;
      } else {
        const parts = [
          e.clientName ? `Cliente: ${e.clientName}` : '',
          e.app ? `App: ${e.app}` : '',
          e.mac ? `MAC: ${e.mac}` : '',
          e.key ? `Key: ${e.key}` : '',
        ].filter(Boolean);
        subDetail = parts.join(' · ');
      }

      list.push({
        id: e.id,
        source: e.type === 'server' ? 'server_expense' : 'app_expense',
        date: e.date,
        title: e.type === 'server' ? `Servidor ${e.server || ''}` : `App ${e.app || ''}`,
        subDetail,
        bank: e.bank,
        amount: -e.amount,
        rawAmount: e.amount,
        timestamp: e.timestamp,
        notes: e.notes,
      });
    });

    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [payments, expenses]);

  // Extract unique banks across both
  const availableBanks = useMemo(() => {
    const set = new Set<string>();
    payments.forEach((p) => p.bank && set.add(p.bank));
    expenses.forEach((e) => e.bank && set.add(e.bank));
    return Array.from(set);
  }, [payments, expenses]);

  // Filtered transactions
  const filtered = useMemo(() => {
    return unifiedTransactions.filter((item) => {
      // Type filter
      if (typeFilter === 'income' && item.source !== 'payment') return false;
      if (typeFilter === 'server' && item.source !== 'server_expense') return false;
      if (typeFilter === 'app' && item.source !== 'app_expense') return false;

      // Bank filter
      if (selectedBank !== 'all' && item.bank !== selectedBank) return false;

      // Search term
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subDetail.toLowerCase().includes(q) ||
        (item.notes || '').toLowerCase().includes(q) ||
        item.bank.toLowerCase().includes(q)
      );
    });
  }, [unifiedTransactions, typeFilter, selectedBank, search]);

  // Financial sums of filtered list
  const { totalIncome, totalExpense, netTotal } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    filtered.forEach((t) => {
      if (t.amount > 0) inc += t.amount;
      else exp += Math.abs(t.amount);
    });
    return { totalIncome: inc, totalExpense: exp, netTotal: inc - exp };
  }, [filtered]);

  if (!isOpen) return null;

  const exportCSV = () => {
    const headers = ['Tipo', 'Data', 'Identificação / Título', 'Detalhes (Server/App/MAC/Key)', 'Banco (Conta)', 'Valor (R$)', 'Observações'];
    const rows = filtered.map((t) => {
      const typeLabel =
        t.source === 'payment'
          ? 'Recebimento'
          : t.source === 'server_expense'
          ? 'Pagamento Servidor'
          : 'Pagamento App';

      return [
        `"${typeLabel}"`,
        formatDateBR(t.date),
        `"${t.title}"`,
        `"${t.subDetail}"`,
        `"${t.bank}"`,
        t.amount.toFixed(2),
        `"${t.notes || ''}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Extrato_Conferencia_LK-Clientes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (item: UnifiedTransaction) => {
    if (item.source === 'payment') {
      if (window.confirm(`Deseja excluir o recebimento de ${formatBRL(item.rawAmount)} de "${item.title}"?`)) {
        onDeletePayment(item.id);
      }
    } else {
      if (window.confirm(`Deseja excluir o pagamento/saída de ${formatBRL(item.rawAmount)} de "${item.title}"?`)) {
        onDeleteExpense(item.id);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Conferência de Caixa & Extrato Completo</h3>
              <p className="text-xs text-slate-400">
                Auditoria de entradas (clientes) e saídas (servidores e aplicativos)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Exportar CSV</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cliente, servidor, app, MAC..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Type selector */}
            <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  typeFilter === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('income')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  typeFilter === 'income' ? 'bg-emerald-950/60 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Recebimentos (+)
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('server')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  typeFilter === 'server' ? 'bg-orange-950/60 text-orange-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Servidores (-)
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('app')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  typeFilter === 'app' ? 'bg-purple-950/60 text-purple-300 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Apps (-)
              </button>
            </div>

            {/* Bank Filter */}
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">Todas as Contas</option>
              {availableBanks.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* KPI Strip */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-emerald-400 font-semibold" title="Total Recebido">
              +{formatBRL(totalIncome)}
            </span>
            <span className="text-rose-400 font-semibold" title="Total Pago">
              -{formatBRL(totalExpense)}
            </span>
            <span
              className={`px-2 py-0.5 rounded font-bold border ${
                netTotal >= 0
                  ? 'bg-slate-800 text-white border-slate-700'
                  : 'bg-rose-950/50 text-rose-300 border-rose-800/40'
              }`}
              title="Saldo Líquido da lista"
            >
              Líq: {formatBRL(netTotal)}
            </span>
          </div>
        </div>

        {/* Table View */}
        <div className="flex-1 overflow-y-auto p-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <ClipboardCheck className="w-10 h-10 mx-auto mb-2 text-slate-600 opacity-60" />
              <p className="text-sm font-medium">Nenhum lançamento encontrado para os filtros selecionados.</p>
              <p className="text-xs mt-1">Os recebimentos e despesas aparecerão aqui automaticamente.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Identificação / Detalhes</th>
                  <th className="py-2.5 px-3">Conta (Banco)</th>
                  <th className="py-2.5 px-3 text-right">Valor</th>
                  <th className="py-2.5 px-3">Notas</th>
                  <th className="py-2.5 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 text-slate-300 font-mono whitespace-nowrap">
                      {formatDateBR(item.date)}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {item.source === 'payment' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 text-[10px] font-semibold">
                          <TrendingUp className="w-3 h-3" />
                          <span>Recebimento</span>
                        </span>
                      )}
                      {item.source === 'server_expense' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-orange-950/60 text-orange-300 border border-orange-800/50 text-[10px] font-semibold">
                          <Server className="w-3 h-3 text-orange-400" />
                          <span>Pagar Servidor</span>
                        </span>
                      )}
                      {item.source === 'app_expense' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/50 text-[10px] font-semibold">
                          <Smartphone className="w-3 h-3 text-purple-400" />
                          <span>Pagar App</span>
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-white">{item.title}</div>
                      {item.subDetail && (
                        <div className="text-[11px] text-slate-400 font-mono truncate max-w-sm">
                          {item.subDetail}
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                        {item.bank}
                      </span>
                    </td>

                    <td
                      className={`py-2.5 px-3 text-right font-mono font-bold tabular-nums whitespace-nowrap ${
                        item.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {item.amount > 0 ? `+${formatBRL(item.amount)}` : `-${formatBRL(Math.abs(item.amount))}`}
                    </td>

                    <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">
                      {item.notes || '—'}
                    </td>

                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        title="Excluir lançamento"
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors rounded hover:bg-slate-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>
            Exibindo <strong className="text-white font-mono">{filtered.length}</strong> lançamentos registrados
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
