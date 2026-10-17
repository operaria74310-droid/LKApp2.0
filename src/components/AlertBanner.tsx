import React, { useEffect, useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import { Client } from '../types';
import { formatBRL } from '../utils/date';

interface AlertBannerProps {
  todayClients: Client[];
  overdueClients: Client[];
  onSelectFilter: (filter: 'today' | 'overdue') => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  todayClients,
  overdueClients,
  onSelectFilter,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Play audio chime using Web Audio API synthesized sound
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      osc.frequency.exponentialRampToValueAtTime(1174.66, audioCtx.currentTime + 0.3); // D6

      gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch {
      // AudioContext might be blocked before first interaction
    }
  };

  useEffect(() => {
    if (soundEnabled && (todayClients.length > 0 || overdueClients.length > 0)) {
      playChime();
    }
  }, [soundEnabled, todayClients.length, overdueClients.length]);

  if (dismissed || (todayClients.length === 0 && overdueClients.length === 0)) {
    return null;
  }

  const todayTotal = todayClients.reduce((acc, c) => acc + c.price, 0);
  const overdueTotal = overdueClients.reduce((acc, c) => acc + c.price, 0);

  return (
    <div className="relative overflow-hidden rounded-xl border border-pink-500/30 bg-gradient-to-r from-pink-950/40 via-slate-900/90 to-cyan-950/40 p-4 shadow-lg backdrop-blur-md">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left icon and message */}
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-pink-500/15 border border-pink-500/30 text-pink-400 shrink-0 mt-0.5 md:mt-0 animate-pulse">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold uppercase tracking-wider text-pink-400">
                Alerta de Cobrança
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono font-medium">
                Hoje
              </span>
            </div>
            <p className="text-sm text-slate-200 mt-0.5">
              {todayClients.length > 0 ? (
                <>
                  Você tem <strong className="text-white font-semibold">{todayClients.length}</strong>{' '}
                  {todayClients.length === 1 ? 'cliente que vence hoje' : 'clientes que vencem hoje'}, totalizando{' '}
                  <span className="text-cyan-300 font-mono font-bold">{formatBRL(todayTotal)}</span>.
                </>
              ) : (
                'Nenhum cliente vencendo na data de hoje.'
              )}
              {overdueClients.length > 0 && (
                <span className="ml-1 text-amber-300">
                  Atenção: há <strong>{overdueClients.length}</strong> em atraso ({formatBRL(overdueTotal)}).
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right action buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playChime();
            }}
            title={soundEnabled ? 'Silenciar avisos sonoros' : 'Ativar avisos sonoros'}
            className="p-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {todayClients.length > 0 && (
            <button
              type="button"
              onClick={() => onSelectFilter('today')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-pink-400 hover:bg-pink-300 active:scale-95 transition-all rounded-lg shadow-sm whitespace-nowrap"
            >
              <span>Ver Vencimentos de Hoje</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {overdueClients.length > 0 && todayClients.length === 0 && (
            <button
              type="button"
              onClick={() => onSelectFilter('overdue')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all rounded-lg shadow-sm whitespace-nowrap"
            >
              <span>Ver Atrasados</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded transition-colors"
          >
            Ocultar
          </button>
        </div>
      </div>
    </div>
  );
};
