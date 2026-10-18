import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar as CalendarIcon,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { getTodayISO, formatDateBR } from '../utils/date';

interface CalendarPickerProps {
  value: string; // YYYY-MM-DD
  onChange: (newDate: string) => void;
  label?: string;
  allowPast?: boolean;
  className?: string;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  value,
  onChange,
  label,
  allowPast = true,
  className = '',
}) => {
  // Parse initial date or default to today
  const initialDate = value ? parseDate(value) : new Date();
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth()); // 0-indexed
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (value) {
      const d = parseDate(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  function parseDate(dateStr: string): Date {
    const parts = dateStr.split('-').map(Number);
    if (parts.length === 3) {
      return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    }
    return new Date();
  }

  function formatISO(year: number, month: number, day: number): string {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  }

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handlePrevYear = () => {
    setViewYear(viewYear - 1);
  };

  const handleNextYear = () => {
    setViewYear(viewYear + 1);
  };

  const handleSelectDay = (day: number) => {
    const newDateStr = formatISO(viewYear, viewMonth, day);
    onChange(newDateStr);
    setIsOpen(false);
  };

  // Quick jump shortcuts including past months
  const handleQuickPastMonth = (monthsAgo: number) => {
    const base = value ? parseDate(value) : new Date();
    base.setMonth(base.getMonth() - monthsAgo);
    const y = base.getFullYear();
    const m = base.getMonth();
    const d = base.getDate();
    const iso = formatISO(y, m, d);
    setViewYear(y);
    setViewMonth(m);
    onChange(iso);
  };

  const handleQuickNextMonth = (monthsAhead: number) => {
    const base = value ? parseDate(value) : new Date();
    base.setMonth(base.getMonth() + monthsAhead);
    const y = base.getFullYear();
    const m = base.getMonth();
    const d = base.getDate();
    const iso = formatISO(y, m, d);
    setViewYear(y);
    setViewMonth(m);
    onChange(iso);
  };

  const handleQuickToday = () => {
    const today = new Date();
    const iso = getTodayISO();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    onChange(iso);
  };

  // Calculate calendar days grid
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const todayStr = getTodayISO();
  const selectedStr = value || todayStr;

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>{label}</span>
          </span>
          <span className="text-[11px] font-mono text-cyan-300">
            {formatDateBR(value)}
          </span>
        </label>
      )}

      {/* Main Trigger / Input Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="date"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              if (e.target.value) {
                const d = parseDate(e.target.value);
                setViewYear(d.getFullYear());
                setViewMonth(d.getMonth());
              }
            }}
            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-400"
          />
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 shrink-0 ${
            isOpen
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
              : 'bg-slate-800 text-slate-200 border-slate-700 hover:text-white hover:border-slate-600'
          }`}
          title="Abrir calendário completo com meses passados e futuros"
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>{isOpen ? 'Fechar' : 'Calendário'}</span>
        </button>
      </div>

      {/* Popover Calendar Grid */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-2 p-3.5 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl backdrop-blur-md animate-fadeIn">
          {/* Quick Shortcuts Bar (Past months, Today, Future months) */}
          <div className="mb-3 pb-2.5 border-b border-slate-800 flex flex-wrap gap-1 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickPastMonth(2)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700"
              title="Voltar 2 meses"
            >
              -2 Meses
            </button>
            <button
              type="button"
              onClick={() => handleQuickPastMonth(1)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700"
              title="Voltar 1 mês"
            >
              -1 Mês (Passado)
            </button>
            <button
              type="button"
              onClick={handleQuickToday}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700 font-semibold"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => handleQuickNextMonth(1)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700"
            >
              +1 Mês
            </button>
            <button
              type="button"
              onClick={() => handleQuickNextMonth(2)}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700"
            >
              +2 Meses
            </button>
          </div>

          {/* Month / Year Navigation */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevYear}
                title="Ano anterior"
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handlePrevMonth}
                title="Mês anterior"
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs font-bold text-white font-mono flex items-center gap-1">
              <span>{MONTH_NAMES[viewMonth]}</span>
              <span className="text-cyan-400">{viewYear}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleNextMonth}
                title="Próximo mês"
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextYear}
                title="Próximo ano"
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1">
            {WEEKDAY_NAMES.map((w) => (
              <div key={w} className="py-1">
                {w}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-xs font-mono">
            {/* Prev month days padding */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => {
              const dayNum = daysInPrevMonth - firstDayOfWeek + idx + 1;
              return (
                <div
                  key={`prev-${idx}`}
                  className="py-1.5 text-center text-slate-600 select-none text-[11px]"
                >
                  {dayNum}
                </div>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInCurrentMonth }).map((_, idx) => {
              const day = idx + 1;
              const dateIso = formatISO(viewYear, viewMonth, day);
              const isSelected = dateIso === selectedStr;
              const isToday = dateIso === todayStr;
              const isPast = dateIso < todayStr;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`py-1.5 rounded text-center transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-pink-500 to-cyan-500 text-slate-950 font-bold shadow-md'
                      : isToday
                      ? 'bg-slate-800 text-cyan-300 font-bold border border-cyan-500/50'
                      : isPast
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                  }`}
                  title={`${day} de ${MONTH_NAMES[viewMonth]} de ${viewYear}${isPast ? ' (Passado)' : ''}`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Você pode selecionar qualquer mês passado</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Concluído
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
