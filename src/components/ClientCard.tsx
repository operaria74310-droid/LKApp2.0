import React, { useState } from 'react';
import {
  Calendar,
  DollarSign,
  Landmark,
  ShieldCheck,
  ShieldX,
  Server,
  Smartphone,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  Edit2,
  Trash2,
  MessageSquare,
  Zap,
  Phone,
} from 'lucide-react';
import { Client } from '../types';
import { formatBRL, formatDateBR, getDateDiffInfo } from '../utils/date';

interface ClientCardProps {
  client: Client;
  onConfirmPayment: (client: Client) => void;
  onReschedule: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string, clientName: string) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({
  client,
  onConfirmPayment,
  onReschedule,
  onEdit,
  onDelete,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const dateInfo = getDateDiffInfo(client.dueDate);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusBadge = () => {
    if (dateInfo.status === 'today') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-pink-500/25 text-pink-300 border border-pink-500/50 animate-pulse">
          <Clock className="w-3.5 h-3.5 text-pink-400" />
          <span>Vence Hoje!</span>
        </span>
      );
    }
    if (dateInfo.status === 'overdue') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-md bg-rose-950/60 text-rose-300 border border-rose-800/60">
          <Clock className="w-3 h-3 text-rose-400" />
          <span>{dateInfo.label}</span>
        </span>
      );
    }
    if (dateInfo.status === 'upcoming') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-amber-950/40 text-amber-300 border border-amber-800/40">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>{dateInfo.label}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-slate-800 text-slate-400 border border-slate-700">
        <Clock className="w-3 h-3 text-slate-500" />
        <span>{dateInfo.label}</span>
      </span>
    );
  };

  // WhatsApp Billing Link generator
  const getWhatsAppLink = () => {
    if (!client.phone) return '#';
    const cleanPhone = client.phone.replace(/\D/g, '');
    const phoneWithDDI = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
    
    let greeting = 'Olá ' + client.name + '!';
    let messageText = `${greeting} Passando para lembrar da mensalidade do seu plano (${client.server} - ${client.app}).\n\n`;
    messageText += `🗓️ Vencimento: ${formatDateBR(client.dueDate)}\n`;
    messageText += `💰 Valor: ${formatBRL(client.price)}\n`;
    messageText += `🏦 Banco de recebimento: ${client.bank}\n\n`;
    messageText += `Aceitamos também pagamento adiantado caso queira renovar múltiplos meses com desconto! Envie o comprovante por aqui assim que efetuar o pagamento. Obrigado!`;

    return `https://wa.me/${phoneWithDDI}?text=${encodeURIComponent(messageText)}`;
  };

  return (
    <div
      className={`relative rounded-xl border transition-all duration-200 bg-slate-900/90 hover:bg-slate-900 p-4 shadow-sm flex flex-col justify-between ${
        dateInfo.status === 'today'
          ? 'border-pink-500/70 shadow-[0_0_20px_rgba(236,72,153,0.15)] ring-1 ring-pink-500/40'
          : dateInfo.status === 'overdue'
          ? 'border-rose-800/60'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Card Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="min-w-0 flex-1">
            <h4 className="text-base font-bold text-white truncate tracking-tight">
              {client.name}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
              <span className="font-mono text-cyan-400 font-semibold">{client.server}</span>
              <span>·</span>
              <span className="truncate">{client.app}</span>
              <span>·</span>
              <span>{client.accessCount} {client.accessCount === 1 ? 'tela' : 'telas'}</span>
            </div>
          </div>

          <div className="shrink-0">{getStatusBadge()}</div>
        </div>

        {/* Technical Data (MAC & KEY) */}
        <div className="my-3 py-2 px-3 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1.5 text-xs font-mono">
          {client.mac && (
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 text-[11px]">MAC:</span>
              <div className="flex items-center gap-1.5">
                <span className="select-all font-semibold text-slate-200">{client.mac}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(client.mac, 'mac')}
                  title="Copiar MAC"
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  {copiedField === 'mac' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          )}

          {client.key && (
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 text-[11px]">KEY:</span>
              <div className="flex items-center gap-1.5">
                <span className="select-all font-semibold text-amber-300">{client.key}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(client.key, 'key')}
                  title="Copiar Key"
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  {copiedField === 'key' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          )}

          {/* PMD badge and Bank */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
            <div className="flex items-center gap-1 text-slate-400">
              {client.hasPmd ? (
                <span className="text-cyan-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>PMD Ativo</span>
                </span>
              ) : (
                <span className="text-slate-400 flex items-center gap-1">
                  <ShieldX className="w-3.5 h-3.5" />
                  <span>Sem PMD</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <Landmark className="w-3 h-3 text-cyan-400" />
              <span>{client.bank}</span>
            </div>
          </div>
        </div>

        {/* Due date and Value */}
        <div className="flex items-center justify-between py-1 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-pink-400" />
            <span>Vencimento:</span>
            <strong className="text-white font-mono">{formatDateBR(client.dueDate)}</strong>
          </div>

          <div className="text-sm font-bold text-emerald-400 font-mono tabular-nums">
            {formatBRL(client.price)}
          </div>
        </div>

        {client.notes && (
          <p className="mt-1 text-[11px] text-slate-400 truncate italic">
            "{client.notes}"
          </p>
        )}
      </div>

      {/* Action Toolbar */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-1.5">
        {/* Left: Confirm / Advance Payment Button */}
        <button
          type="button"
          onClick={() => onConfirmPayment(client)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 transition-all rounded-lg shadow-sm"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Confirmar / Adiantar</span>
        </button>

        {/* Quick Date Reschedule Button */}
        <button
          type="button"
          onClick={() => onReschedule(client)}
          title="Trocar data / Reagendar cobrança"
          className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors"
        >
          <Calendar className="w-4 h-4 text-cyan-400" />
        </button>

        {/* WhatsApp Button */}
        {client.phone ? (
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            title="Cobrar via WhatsApp"
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-emerald-950 border border-slate-700 hover:border-emerald-600 rounded-lg transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </a>
        ) : (
          <button
            type="button"
            disabled
            title="Sem telefone cadastrado"
            className="p-2 text-slate-600 bg-slate-800/40 border border-slate-800/60 rounded-lg cursor-not-allowed"
          >
            <MessageSquare className="w-4 h-4 text-slate-600" />
          </button>
        )}

        {/* Edit Button */}
        <button
          type="button"
          onClick={() => onEdit(client)}
          title="Editar dados do cliente"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>

        {/* Delete Button */}
        <button
          type="button"
          onClick={() => onDelete(client.id, client.name)}
          title="Excluir cadastro"
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
