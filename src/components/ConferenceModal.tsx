import React, { useState, useMemo } from 'react';
import { ClipboardCheck, Search, Filter, Trash2, Download, X, Calendar, Landmark, DollarSign } from 'lucide-react';
import { PaymentRecord } from '../types';
import { formatBRL, formatDateBR } from '../utils/date';

interface ConferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  payments: PaymentRecord[];
  onDeletePayment: (paymentId: string) => void;
}

export const ConferenceModal: React.FC<ConferenceModalProps> = ({
  isOpen,
  onClose,
  payments,
  onDeletePayment,
}) => {
  const [search, setSearch] = useState('');
  const [selectedBank, setSelectedBank] = useState('all');
  const [filterMonth, setFilterMonth] = useState('');

  // Extract unique banks
  const availableBanks = useMemo(() => {
    return Array.from(new Set(payments.map((p) => p.bank))).filter(Boolean);
  }, [payments]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments
      .filter((p) => {
        const matchesSearch =
          p.clientName.toLowerCase().includes(search.toLowerCase()) ||
          (p.notes || '').toLowerCase().includes(search.toLowerCase()) ||
          (p.server || '').toLowerCase().includes(search.toLowerCase());
        const matchesBank = selectedBank === 'all' || p.bank === selectedBank;
        const matchesMonth = !filterMonth || p.paymentDate.startsWith(filterMonth);
        return matchesSearch && matchesBank && matchesMonth;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [payments, search, selectedBank, filterMonth]);

  const totalFilteredAmount = useMemo(() => {
    return filteredPayments.reduce((acc, p) => acc + p.amount, 0);
  }, [filteredPayments]);

  if (!isOpen) return null;

  const exportCSV = () => {
    const headers = ['ID', 'Data Pagamento', 'Cliente', 'Servidor', 'Aplicativo', 'Banco', 'Valor (R$)', 'Observações'];
    const rows = filteredPayments.map((p) => [
      p.id,
      formatDateBR(p.paymentDate),
      `"${p.clientName}"`,
      p.server || '',
      p.app || '',
      p.bank,
      p.amount.toFixed(2),
      `"${p.notes || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Conferencia_Caixa_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <h3 className="text-base font-bold text-white">Conferência de Caixa & Recebimentos</h3>
              <p className="text-xs text-slate-400">
                Auditoria detalhada de todos os lançamentos recebidos
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
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar cliente, servidor, nota..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Bank Filter */}
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">Todos os Bancos</option>
              {availableBanks.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Quick Summary Pill */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Total listado: <strong className="text-white font-mono">{filteredPayments.length}</strong>
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-lg">
              {formatBRL(totalFilteredAmount)}
            </span>
          </div>
        </div>

        {/* Table View */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <ClipboardCheck className="w-10 h-10 mx-auto mb-2 text-slate-600 opacity-60" />
              <p className="text-sm font-medium">Nenhum lançamento encontrado para os filtros selecionados.</p>
              <p className="text-xs mt-1">Os recebimentos confirmados aparecerão aqui automaticamente.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Servidor / App</th>
                  <th className="py-2.5 px-3">Banco</th>
                  <th className="py-2.5 px-3 text-right">Valor</th>
                  <th className="py-2.5 px-3">Notas</th>
                  <th className="py-2.5 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 text-slate-300 font-mono">
                      {formatDateBR(p.paymentDate)}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {p.clientName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">
                      {p.server || '—'} · {p.app || '—'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-medium">
                        {p.bank}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400 tabular-nums">
                      {formatBRL(p.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">
                      {p.notes || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Deseja excluir o lançamento de ${formatBRL(p.amount)} de ${p.clientName}?`)) {
                            onDeletePayment(p.id);
                          }
                        }}
                        title="Excluir este lançamento"
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
            Dica: Utilize a conferência para bater centavo por centavo com o extrato dos bancos.
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
