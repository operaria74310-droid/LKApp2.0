import React, { useRef, useState } from 'react';
import { Download, Upload, Database, AlertCircle, CheckCircle, RefreshCw, X, ShieldAlert } from 'lucide-react';
import { exportBackupData, importBackupData, INITIAL_CLIENTS, saveClients, savePayments, saveSuggestions, DEFAULT_SUGGESTIONS } from '../utils/storage';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      const json = exportBackupData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const now = new Date().toISOString().split('T')[0];
      const link = document.createElement('a');
      link.href = url;
      link.download = `LK-Clientes_Backup_${now}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setImportStatus({
        type: 'success',
        message: 'Arquivo de backup baixado com sucesso para o seu dispositivo!',
      });
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: `Erro ao exportar backup: ${err.message}`,
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) {
        setImportStatus({ type: 'error', message: 'Arquivo vazio ou ilegível.' });
        return;
      }

      const result = importBackupData(content, importMode);
      if (result.success) {
        setImportStatus({
          type: 'success',
          message: `${result.message} (${result.clientCount} clientes, ${result.paymentCount} recebimentos, ${result.expenseCount ?? 0} pagamentos/saídas)`,
        });
        onDataRestored();
      } else {
        setImportStatus({ type: 'error', message: result.message });
      }
    };
    reader.onerror = () => {
      setImportStatus({ type: 'error', message: 'Falha ao ler o arquivo selecionado.' });
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResetToDemo = () => {
    if (window.confirm('Deseja recarregar os dados de demonstração iniciais? Isso substituirá seus dados atuais.')) {
      saveClients(INITIAL_CLIENTS);
      saveSuggestions(DEFAULT_SUGGESTIONS);
      onDataRestored();
      setImportStatus({
        type: 'success',
        message: 'Dados de demonstração restaurados com sucesso!',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Backup & Restauração de Dados</h3>
            <p className="text-xs text-slate-400">
              Exporte seus cadastros e histórico para segurança ou transfira para outro aparelho
            </p>
          </div>
        </div>

        {importStatus && (
          <div
            className={`p-3 rounded-xl mb-4 flex items-center gap-2.5 text-xs ${
              importStatus.type === 'success'
                ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50'
                : 'bg-rose-950/40 text-rose-300 border border-rose-800/50'
            }`}
          >
            {importStatus.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Card 1: Export */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Exportar Backup (Download JSON)</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Gera um arquivo seguro contendo todos os clientes, histórico financeiro, servidores e contas salvas.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExport}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:scale-95 transition-all rounded-lg shadow-sm whitespace-nowrap shrink-0"
              >
                Baixar Backup
              </button>
            </div>
          </div>

          {/* Card 2: Import */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
              <Upload className="w-4 h-4 text-pink-400" />
              <span>Importar Arquivo de Backup</span>
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Selecione um arquivo de backup (.json) exportado anteriormente pelo LK-Clientes.
            </p>

            {/* Import Mode Radio */}
            <div className="flex items-center gap-4 mb-3.5 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="text-pink-500 focus:ring-pink-500 bg-slate-900 border-slate-700"
                />
                <span>Substituir tudo (Recomendado)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                <input
                  type="radio"
                  name="importMode"
                  value="merge"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="text-pink-500 focus:ring-pink-500 bg-slate-900 border-slate-700"
                />
                <span>Mesclar com existentes</span>
              </label>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4 text-pink-400" />
              <span>Escolher Arquivo .JSON do Computador</span>
            </button>
          </div>

          {/* Card 3: Reset to Demo */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80">
            <span>Precisa recarregar os exemplos?</span>
            <button
              type="button"
              onClick={handleResetToDemo}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Carregar Dados Demonstrativos</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end mt-5 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
