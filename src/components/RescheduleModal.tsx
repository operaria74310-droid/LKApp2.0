import React, { useState, useEffect } from 'react';
import { Calendar, Clock, X, ArrowRight } from 'lucide-react';
import { Client } from '../types';
import { getTodayISO, formatDateBR, addDays, addOneMonthPreservingDay } from '../utils/date';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onReschedule: (clientId: string, newDueDate: string, notes?: string) => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  isOpen,
  onClose,
  client,
  onReschedule,
}) => {
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (client) {
      setNewDueDate(client.dueDate || getTodayISO());
      setNotes('');
    }
  }, [client]);

  if (!isOpen || !client) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDueDate) return;
    onReschedule(client.id, newDueDate, notes.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Reagendar Vencimento</h3>
            <p className="text-xs text-slate-400">Alterar data de cobrança do cliente</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 mb-5">
          <div className="text-sm font-semibold text-white">{client.name}</div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>Vencimento atual:</span>
            <span className="font-mono text-pink-400 font-bold">{formatDateBR(client.dueDate)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Atalhos Rápidos de Reagendamento
            </label>
            <div className="grid grid-cols-3 gap-1.5 mb-2.5">
              <button
                type="button"
                onClick={() => setNewDueDate(getTodayISO())}
                className="py-1.5 px-2 text-xs font-medium rounded-md bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:border-slate-600"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => setNewDueDate(addDays(getTodayISO(), 3))}
                className="py-1.5 px-2 text-xs font-medium rounded-md bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:border-slate-600"
              >
                +3 Dias
              </button>
              <button
                type="button"
                onClick={() => setNewDueDate(addDays(getTodayISO(), 7))}
                className="py-1.5 px-2 text-xs font-medium rounded-md bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:border-slate-600"
              >
                +7 Dias
              </button>
              <button
                type="button"
                onClick={() => setNewDueDate(addDays(getTodayISO(), 15))}
                className="py-1.5 px-2 text-xs font-medium rounded-md bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:border-slate-600"
              >
                +15 Dias
              </button>
              <button
                type="button"
                onClick={() => setNewDueDate(addOneMonthPreservingDay(client.dueDate))}
                className="py-1.5 px-2 text-xs font-medium rounded-md bg-slate-800 text-slate-300 border border-slate-700 hover:text-white hover:border-slate-600 col-span-2"
              >
                +1 Mês ({formatDateBR(addOneMonthPreservingDay(client.dueDate))})
              </button>
            </div>

            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Nova Data Selecionada</span>
            </label>
            <input
              type="date"
              required
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Motivo ou Nota (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Pediu prazo até sexta-feira"
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
            />
          </div>

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
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:scale-95 transition-all rounded-lg shadow-sm flex items-center gap-1.5"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Salvar Nova Data</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
