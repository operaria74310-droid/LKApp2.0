import React, { useRef, useState } from 'react';
import {
  Download,
  Upload,
  Database,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  X,
  Lock,
  FolderDown,
  ShieldCheck,
  FolderOpen,
} from 'lucide-react';
import {
  exportBackupData,
  importBackupData,
  verifyAdminPassword,
  INITIAL_CLIENTS,
  saveClients,
  saveSuggestions,
  DEFAULT_SUGGESTIONS,
} from '../utils/storage';

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

  // Password authentication state for import
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Export backup into Downloads folder
  const handleExport = async () => {
    try {
      const json = exportBackupData();
      const now = new Date().toISOString().split('T')[0];
      const filename = `LK-Clientes_Backup_${now}.json`;

      // Try File System Access API with startIn: 'downloads'
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: filename,
            startIn: 'downloads',
            types: [
              {
                description: 'Backup LK-Clientes JSON',
                accept: { 'application/json': ['.json'] },
              },
            ],
          });
          const writable = await handle.createWritable();
          await writable.write(json);
          await writable.close();

          setImportStatus({
            type: 'success',
            message: `Arquivo "${filename}" salvo na pasta Downloads com sucesso!`,
          });
          return;
        } catch (pickerErr: any) {
          if (pickerErr.name === 'AbortError') return;
          // Fallback to download anchor below
        }
      }

      // Standard browser download (automatically directed to Downloads folder)
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setImportStatus({
        type: 'success',
        message: `Arquivo "${filename}" exportado para a pasta Downloads do seu computador!`,
      });
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: `Erro ao exportar backup: ${err.message}`,
      });
    }
  };

  // 2. Password verification for Import
  const handleVerifyPasswordAndOpenDownloads = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) {
      setPasswordError('Digite a senha de segurança para liberar a importação.');
      return;
    }

    if (verifyAdminPassword(passwordInput)) {
      setPasswordError(null);
      setIsPasswordUnlocked(true);
      setPasswordInput('');

      // Once unlocked, automatically search/open Downloads folder!
      triggerOpenFilePicker();
    } else {
      setPasswordError('Senha de segurança incorreta. Acesso negado.');
      setPasswordInput('');
    }
  };

  // 3. Open File Picker directly in Downloads
  const triggerOpenFilePicker = async () => {
    // If showOpenFilePicker is available, open specifically pointing to Downloads folder
    if ('showOpenFilePicker' in window) {
      try {
        const [fileHandle] = await (window as any).showOpenFilePicker({
          startIn: 'downloads',
          types: [
            {
              description: 'Backup JSON LK-Clientes',
              accept: { 'application/json': ['.json'] },
            },
          ],
          multiple: false,
        });

        const file = await fileHandle.getFile();
        const text = await file.text();
        applyImportedContent(text, file.name);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        // fallback to input
      }
    }

    // Fallback: trigger standard input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const applyImportedContent = (content: string, filename?: string) => {
    const result = importBackupData(content, importMode);
    if (result.success) {
      setImportStatus({
        type: 'success',
        message: `${result.message} ${filename ? `("${filename}")` : ''} - (${result.clientCount} clientes, ${result.paymentCount} recebimentos, ${result.expenseCount ?? 0} pagamentos)`,
      });
      onDataRestored();
    } else {
      setImportStatus({ type: 'error', message: result.message });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) {
        setImportStatus({ type: 'error', message: 'Arquivo vazio ou ilegível.' });
        return;
      }
      applyImportedContent(content, file.name);
    };
    reader.onerror = () => {
      setImportStatus({ type: 'error', message: 'Falha ao ler o arquivo selecionado na pasta Downloads.' });
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

  const handleClose = () => {
    setPasswordInput('');
    setPasswordError(null);
    setIsPasswordUnlocked(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <button
          type="button"
          onClick={handleClose}
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
              Salvar na pasta Downloads ou restaurar com proteção de senha
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
          {/* Card 1: Export (Salvar na pasta Downloads) */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FolderDown className="w-4 h-4 text-cyan-400" />
                  <span>Exportar Backup (Salvar na pasta Downloads)</span>
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Gera e baixa o arquivo completo contendo todos os clientes, recebimentos e pagamentos diretamente na sua pasta <strong>Downloads</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExport}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:scale-95 transition-all rounded-lg shadow-sm whitespace-nowrap shrink-0 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Salvar em Downloads</span>
              </button>
            </div>
          </div>

          {/* Card 2: Import (Solicitar Senha 74310 e buscar na pasta Downloads) */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
              <Upload className="w-4 h-4 text-pink-400" />
              <span>Importar Backup (Buscar na pasta Downloads)</span>
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Por segurança, a importação de dados requer autorização por senha confidencial.
            </p>

            {/* Hidden file input for fallback */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".json,application/json"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {!isPasswordUnlocked ? (
              /* Password Gate */
              <form onSubmit={handleVerifyPasswordAndOpenDownloads} className="space-y-3 p-3.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                  <Lock className="w-4 h-4 text-pink-400" />
                  <span>Digite a Senha de Segurança para Importar:</span>
                </div>

                <div className="relative">
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      if (passwordError) setPasswordError(null);
                    }}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-700 rounded-lg text-white font-mono tracking-widest focus:outline-none focus:border-pink-500"
                  />
                </div>

                {passwordError && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-400">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    Ao confirmar, o sistema procurará o arquivo na pasta Downloads.
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-pink-600 hover:bg-pink-500 active:scale-95 transition-all rounded-lg shadow-sm flex items-center gap-1.5 shrink-0"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Verificar Senha & Buscar na Downloads</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Password Unlocked - Choose file in Downloads */
              <div className="space-y-3 p-3.5 rounded-lg bg-slate-900 border border-emerald-500/30">
                <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Senha confirmada com sucesso!</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsPasswordUnlocked(false)}
                    className="text-[11px] text-slate-400 hover:text-white"
                  >
                    Bloquear
                  </button>
                </div>

                {/* Import Mode Radio */}
                <div className="flex items-center gap-4 text-xs pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="importModeUnlocked"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-pink-500 focus:ring-pink-500 bg-slate-900 border-slate-700"
                    />
                    <span>Substituir tudo</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="radio"
                      name="importModeUnlocked"
                      value="merge"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="text-pink-500 focus:ring-pink-500 bg-slate-900 border-slate-700"
                    />
                    <span>Mesclar com existentes</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={triggerOpenFilePicker}
                  className="w-full py-2.5 px-4 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
                >
                  <FolderOpen className="w-4 h-4 text-slate-950" />
                  <span>Selecionar Arquivo .JSON na Pasta Downloads</span>
                </button>
              </div>
            )}
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
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
