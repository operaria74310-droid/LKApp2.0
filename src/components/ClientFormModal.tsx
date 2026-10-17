import React, { useState, useEffect } from 'react';
import { User, Server, Smartphone, Key, Hash, DollarSign, Landmark, ShieldCheck, Calendar, Phone, FileText, X } from 'lucide-react';
import { Client, SuggestionStore } from '../types';
import { getTodayISO } from '../utils/date';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit: Client | null;
  suggestions: SuggestionStore;
  onSave: (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => void;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  onClose,
  clientToEdit,
  suggestions,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [server, setServer] = useState('SFL');
  const [app, setApp] = useState('XCIPTV');
  const [mac, setMac] = useState('');
  const [key, setKey] = useState('');
  const [accessCount, setAccessCount] = useState<number>(1);
  const [price, setPrice] = useState<number>(35);
  const [bank, setBank] = useState('Nubank');
  const [hasPmd, setHasPmd] = useState<boolean>(false);
  const [dueDate, setDueDate] = useState(getTodayISO());
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name || '');
      setServer(clientToEdit.server || 'SFL');
      setApp(clientToEdit.app || 'XCIPTV');
      setMac(clientToEdit.mac || '');
      setKey(clientToEdit.key || '');
      setAccessCount(clientToEdit.accessCount || 1);
      setPrice(clientToEdit.price || 35);
      setBank(clientToEdit.bank || 'Nubank');
      setHasPmd(Boolean(clientToEdit.hasPmd));
      setDueDate(clientToEdit.dueDate || getTodayISO());
      setPhone(clientToEdit.phone || '');
      setNotes(clientToEdit.notes || '');
    } else {
      setName('');
      setServer(suggestions.servers[0] || 'SFL');
      setApp(suggestions.apps[0] || 'XCIPTV');
      setMac('');
      setKey('');
      setAccessCount(1);
      setPrice(35);
      setBank('Nubank');
      setHasPmd(false);
      setDueDate(getTodayISO());
      setPhone('');
      setNotes('');
    }
  }, [clientToEdit, isOpen, suggestions]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave(
      {
        name: name.trim(),
        server: server.trim().toUpperCase(),
        app: app.trim(),
        mac: mac.trim(),
        key: key.trim(),
        accessCount: Number(accessCount) || 1,
        price: Number(price) || 0,
        bank: bank.trim(),
        hasPmd,
        dueDate,
        phone: phone.trim(),
        notes: notes.trim(),
      },
      clientToEdit?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {clientToEdit ? 'Editar Cadastro de Cliente' : 'Novo Cadastro de Mensalista'}
            </h3>
            <p className="text-xs text-slate-400">
              Preencha os dados de acesso e agendamento de cobrança
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Client Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-pink-400" />
                <span>Nome do Cliente *</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Carlos Eduardo Silva"
                className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp / Celular (Opcional)</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: 11999887766 (com DDD)"
                className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Section 2: Server & App with Suggestions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Server */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                <span>Servidor</span>
              </label>
              {/* Quick Suggestion Pills */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {['SFL', 'LVU', 'SP4'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setServer(s)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                      server.toUpperCase() === s
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <input
                type="text"
                list="server-suggestions"
                required
                value={server}
                onChange={(e) => setServer(e.target.value)}
                placeholder="Ex: SFL, LVU, SP4"
                className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white uppercase focus:outline-none focus:border-cyan-400 font-mono"
              />
              <datalist id="server-suggestions">
                {suggestions.servers.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>

            {/* Application */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-pink-400" />
                <span>Aplicativo</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {['XCIPTV', 'TiviMate', 'IBO Player'].map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setApp(a)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                      app.toLowerCase() === a.toLowerCase()
                        ? 'bg-pink-500/20 text-pink-300 border-pink-500/50'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <input
                type="text"
                list="app-suggestions"
                required
                value={app}
                onChange={(e) => setApp(e.target.value)}
                placeholder="Ex: XCIPTV, IPTV Smarters..."
                className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-pink-500"
              />
              <datalist id="app-suggestions">
                {suggestions.apps.map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Section 3: MAC & Key */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Key / Chave de Acesso</span>
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Ex: 123456"
                className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          {/* Section 4: Access Count, Value & PMD */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Access Count */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nº de Acessos / Telas
              </label>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setAccessCount(count)}
                    className={`flex-1 py-1 text-xs font-semibold rounded border transition-colors ${
                      accessCount === count
                        ? 'bg-slate-700 text-white border-pink-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={accessCount}
                onChange={(e) => setAccessCount(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-1.5 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Valor Cobrança (R$)</span>
              </label>
              <div className="flex gap-1 mb-2">
                {[30, 35, 40, 50].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPrice(val)}
                    className={`flex-1 py-1 text-xs font-semibold rounded border transition-colors ${
                      price === val
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* PMD Toggle */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Possui PMD?</span>
              </label>
              <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800 h-10">
                <button
                  type="button"
                  onClick={() => setHasPmd(true)}
                  className={`flex-1 h-full rounded text-xs font-bold transition-all ${
                    hasPmd
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SIM
                </button>
                <button
                  type="button"
                  onClick={() => setHasPmd(false)}
                  className={`flex-1 h-full rounded text-xs font-bold transition-all ${
                    !hasPmd
                      ? 'bg-slate-800 text-slate-200 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  NÃO
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: Receiving Bank & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Receiving Bank */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-cyan-400" />
                <span>Banco de Recebimento</span>
              </label>
              <div className="flex gap-1.5 mb-2">
                {['Nubank', 'PicPay'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBank(b)}
                    className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors ${
                      bank.toLowerCase() === b.toLowerCase()
                        ? 'bg-purple-900/40 text-purple-200 border-purple-500/60'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <input
                type="text"
                list="bank-suggestions-client"
                required
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                placeholder="Ex: Nubank, PicPay..."
                className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
              <datalist id="bank-suggestions-client">
                {suggestions.banks.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>

            {/* Due Date (agendamento de cobrança) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-pink-400" />
                <span>Data de Vencimento / Cobrança</span>
              </label>
              <div className="flex gap-1.5 mb-2">
                <button
                  type="button"
                  onClick={() => setDueDate(getTodayISO())}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-800 text-slate-300 border border-slate-700 hover:text-white"
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 30);
                    setDueDate(d.toISOString().split('T')[0]);
                  }}
                  className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-800 text-slate-300 border border-slate-700 hover:text-white"
                >
                  +30 Dias
                </button>
              </div>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-pink-500 font-mono"
              />
            </div>
          </div>

          {/* Section 6: Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Observações (Opcional)</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Dispositivo na sala, enviar link do app se precisar..."
              className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 active:scale-95 transition-all rounded-lg shadow-sm"
            >
              {clientToEdit ? 'Salvar Alterações' : 'Cadastrar Mensalista'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
