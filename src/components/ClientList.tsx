import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  UserPlus,
  LayoutGrid,
  List,
  ArrowUpDown,
  Clock,
  AlertTriangle,
  Calendar,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Client, FilterStatus, SortOption } from '../types';
import { ClientCard } from './ClientCard';
import { getTodayISO, getDateDiffInfo, formatBRL, formatDateBR } from '../utils/date';

interface ClientListProps {
  clients: Client[];
  currentFilter: FilterStatus;
  onChangeFilter: (filter: FilterStatus) => void;
  onAddNewClient: () => void;
  onConfirmPayment: (client: Client) => void;
  onReschedule: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string, clientName: string) => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  currentFilter,
  onChangeFilter,
  onAddNewClient,
  onConfirmPayment,
  onReschedule,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('dueDate-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Counts for each tab
  const counts = useMemo(() => {
    let today = 0;
    let overdue = 0;
    let upcoming = 0;
    let pmd = 0;

    clients.forEach((c) => {
      const info = getDateDiffInfo(c.dueDate);
      if (info.status === 'today') today += 1;
      if (info.status === 'overdue') overdue += 1;
      if (info.status === 'upcoming') upcoming += 1;
      if (c.hasPmd) pmd += 1;
    });

    return { all: clients.length, today, overdue, upcoming, pmd };
  }, [clients]);

  // Filtered and sorted clients
  const filteredClients = useMemo(() => {
    return clients
      .filter((client) => {
        // Filter by tab
        const dateInfo = getDateDiffInfo(client.dueDate);
        if (currentFilter === 'today' && dateInfo.status !== 'today') return false;
        if (currentFilter === 'overdue' && dateInfo.status !== 'overdue') return false;
        if (currentFilter === 'upcoming' && dateInfo.status !== 'upcoming') return false;
        if (currentFilter === 'pmd' && !client.hasPmd) return false;

        // Search term
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          client.name.toLowerCase().includes(q) ||
          (client.server || '').toLowerCase().includes(q) ||
          (client.app || '').toLowerCase().includes(q) ||
          (client.mac || '').toLowerCase().includes(q) ||
          (client.key || '').toLowerCase().includes(q) ||
          (client.bank || '').toLowerCase().includes(q) ||
          (client.phone || '').includes(q)
        );
      })
      .sort((a, b) => {
        if (sortOption === 'dueDate-asc') {
          return a.dueDate.localeCompare(b.dueDate);
        }
        if (sortOption === 'dueDate-desc') {
          return b.dueDate.localeCompare(a.dueDate);
        }
        if (sortOption === 'name-asc') {
          return a.name.localeCompare(b.name);
        }
        if (sortOption === 'price-desc') {
          return b.price - a.price;
        }
        return 0;
      });
  }, [clients, currentFilter, searchTerm, sortOption]);

  const totalFilteredValue = useMemo(() => {
    return filteredClients.reduce((acc, c) => acc + c.price, 0);
  }, [filteredClients]);

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => onChangeFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 ${
              currentFilter === 'all'
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            Todos ({counts.all})
          </button>

          <button
            type="button"
            onClick={() => onChangeFilter('today')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentFilter === 'today'
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-sm'
                : 'text-pink-400 hover:bg-pink-950/20'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Vencem Hoje ({counts.today})</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeFilter('overdue')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentFilter === 'overdue'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-rose-400 hover:bg-rose-950/20'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Atrasados ({counts.overdue})</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeFilter('upcoming')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentFilter === 'upcoming'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-amber-400 hover:bg-amber-950/20'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Próximos 7 Dias ({counts.upcoming})</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeFilter('pmd')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentFilter === 'pmd'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-cyan-400 hover:bg-cyan-950/20'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Com PMD ({counts.pmd})</span>
          </button>
        </div>

        {/* Search, Sort and View Mode */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cliente, MAC, server, app..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-pink-500"
          >
            <option value="dueDate-asc">Data (Mais Próximo)</option>
            <option value="dueDate-desc">Data (Mais Distante)</option>
            <option value="name-asc">Nome (A-Z)</option>
            <option value="price-desc">Maior Valor</option>
          </select>

          {/* View toggle (Grid / Table) */}
          <div className="hidden sm:flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Visualização em Cards"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Visualização em Tabela"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sub-header info showing result count and total value */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Exibindo <strong className="text-white font-mono">{filteredClients.length}</strong> mensalistas
        </span>
        <span>
          Total da lista: <strong className="text-emerald-400 font-mono font-bold">{formatBRL(totalFilteredValue)}</strong>
        </span>
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 p-12 text-center bg-slate-950/40">
          <Users className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-white">Nenhum mensalista encontrado</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? `Nenhum resultado para a busca "${searchTerm}". Tente outros termos.`
              : 'Você ainda não possui clientes cadastrados nesta categoria.'}
          </p>
          <button
            type="button"
            onClick={onAddNewClient}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-pink-600 hover:bg-pink-500 rounded-lg shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Cadastrar Primeiro Mensalista</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid of Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onConfirmPayment={onConfirmPayment}
              onReschedule={onReschedule}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3.5">Cliente</th>
                <th className="py-3 px-3">Servidor / App</th>
                <th className="py-3 px-3">MAC / KEY</th>
                <th className="py-3 px-3">Banco</th>
                <th className="py-3 px-3">PMD</th>
                <th className="py-3 px-3">Vencimento</th>
                <th className="py-3 px-3 text-right">Valor</th>
                <th className="py-3 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredClients.map((client) => {
                const dateInfo = getDateDiffInfo(client.dueDate);
                return (
                  <tr key={client.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3.5 font-semibold text-white">
                      <div>{client.name}</div>
                      {client.phone && <div className="text-[11px] text-slate-400 font-mono">{client.phone}</div>}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-300">
                      <span className="text-cyan-400 font-semibold">{client.server}</span> · {client.app}
                      <span className="block text-[11px] text-slate-400">{client.accessCount} telas</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                      <div>{client.mac || '—'}</div>
                      <div className="text-amber-400">{client.key || ''}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                        {client.bank}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {client.hasPmd ? (
                        <span className="text-cyan-400 font-semibold text-[11px]">SIM</span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">NÃO</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <span
                        className={
                          dateInfo.status === 'today'
                            ? 'text-pink-400 font-bold'
                            : dateInfo.status === 'overdue'
                            ? 'text-rose-400 font-bold'
                            : 'text-slate-200'
                        }
                      >
                        {formatDateBR(client.dueDate)}
                      </span>
                      <div className="text-[10px] text-slate-400">{dateInfo.label}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400 tabular-nums">
                      {formatBRL(client.price)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onConfirmPayment(client)}
                          className="px-2 py-1 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded shadow-sm"
                        >
                          Receber
                        </button>
                        <button
                          type="button"
                          onClick={() => onReschedule(client)}
                          title="Trocar data"
                          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                        >
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(client)}
                          title="Editar"
                          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(client.id, client.name)}
                          title="Excluir"
                          className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
