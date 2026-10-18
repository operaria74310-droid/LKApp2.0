import React, { useRef, useState, useEffect } from 'react';
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
  Copy,
  Check,
  HardDrive,
  Save,
  Laptop,
  FileText,
} from 'lucide-react';
import {
  exportBackupData,
  importBackupData,
  verifyAdminPassword,
  saveLocalSnapshot,
  getLocalSnapshotInfo,
  restoreLocalSnapshot,
  LocalSnapshotInfo,
  INITIAL_CLIENTS,
  saveClients,
  saveSuggestions,
  DEFAULT_SUGGESTIONS,
} from '../utils/storage';
import { formatDateBR } from '../utils/date';

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

  // Snapshot info
  const [snapshotInfo, setSnapshotInfo] = useState<LocalSnapshotInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pastedJson, setPastedJson] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSnapshotInfo(getLocalSnapshotInfo());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Export: Choose specific folder (Salvar Como... anywhere in OS)
  const handleExportChooseFolder = async () => {
    try {
      const json = exportBackupData();
      const now = new Date().toISOString().split('T')[0];
      const filename = `LK-Clientes_Backup_${now}.json`;

      if ('showSaveFilePicker' in window) {
        try {
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: filename,
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
            message: `Backup salvo com sucesso no local escolhido (${handle.name || filename})!`,
          });
          return;
        } catch (pickerErr: any) {
          if (pickerErr.name === 'AbortError') return;
        }
      }

      // Fallback
      handleExportToDownloads();
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: `Erro ao escolher pasta: ${err.message}`,
      });
    }
  };

  // 2. Export: Direct to Downloads folder
  const handleExportToDownloads = () => {
    try {
      const json = exportBackupData();
      const now = new Date().toISOString().split('T')[0];
      const filename = `LK-Clientes_Backup_${now}.json`;

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
        message: `Arquivo "${filename}" baixado diretamente na sua pasta Downloads!`,
      });
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: `Erro ao exportar backup: ${err.message}`,
      });
    }
  };

  // 3. Export: Save local snapshot inside browser
  const handleSaveSnapshot = () => {
    const info = saveLocalSnapshot();
    setSnapshotInfo(info);
    setImportStatus({
      type: 'success',
      message: `Ponto de Restauração Local salvo com sucesso (${info.clientCount} clientes, ${info.paymentCount} recebimentos, ${info.expenseCount} saídas)!`,
    });
  };

  // 4. Export: Copy JSON to clipboard
  const handleCopyJson = () => {
    const json = exportBackupData();
    navigator.clipboard.writeText(json);
    setCopied(true);
    setImportStatus({
      type: 'success',
      message: 'Código de backup JSON copiado para a Área de Transferência!',
    });
    setTimeout(() => setCopied(false), 2500);
  };

  // 5. Password verification for Import
  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) {
      setPasswordError('Digite a senha de segurança para liberar a importação.');
      return;
    }

    if (verifyAdminPassword(passwordInput)) {
      setPasswordError(null);
      setIsPasswordUnlocked(true);
      setPasswordInput('');
      setImportStatus({
        type: 'success',
        message: 'Senha autorizada! Agora selecione o arquivo na pasta onde você o armazenou.',
      });
    } else {
      setPasswordError('Senha de segurança incorreta. Acesso negado.');
      setPasswordInput('');
    }
  };

  // 6. Open File Picker anywhere in OS
  const triggerOpenFilePicker = async () => {
    if ('showOpenFilePicker' in window) {
      try {
        const [fileHandle] = await (window as any).showOpenFilePicker({
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
      setImportStatus({ type: 'error', message: 'Falha ao ler o arquivo selecionado.' });
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Restore snapshot
  const handleRestoreSnapshot = () => {
    if (!isPasswordUnlocked) return;
    const res = restoreLocalSnapshot(importMode);
    if (res.success) {
      setImportStatus({
        type: 'success',
        message: 'Ponto de restauração local aplicado com sucesso!',
      });
      onDataRestored();
    } else {
      setImportStatus({ type: 'error', message: res.message });
    }
  };

  // Restore from pasted text
  const handleApplyPastedJson = () => {
    if (!pastedJson.trim()) return;
    applyImportedContent(pastedJson.trim(), 'Texto Colado');
    setPastedJson('');
    setShowPasteModal(false);
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
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
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
            <h3 className="text-base font-bold text-white">Backup & Armazenamento de Dados</h3>
            <p className="text-xs text-slate-400">
              Escolha livremente onde salvar seus arquivos de backup ou restaure seus dados
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
          {/* Card 1: Escolha onde armazenar o Backup */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Onde Deseja Armazenar o Backup?</span>
            </h4>
            <p className="text-xs text-slate-400 mb-3.5">
              Você pode escolher qualquer pasta no seu computador (Pen Drive, Documentos, Área de Trabalho), salvar direto na pasta Downloads ou guardar um ponto de restauração interno.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option A: Choose Folder / Save As */}
              <button
                type="button"
                onClick={handleExportChooseFolder}
                className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-cyan-400 hover:bg-slate-850 transition-all text-left group flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors shrink-0">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Escolher Pasta no Computador
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Permite selecionar Pen Drive, Documentos, Área de Trabalho ou qualquer pasta.
                  </div>
                </div>
              </button>

              {/* Option B: Standard Downloads */}
              <button
                type="button"
                onClick={handleExportToDownloads}
                className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-pink-400 hover:bg-slate-850 transition-all text-left group flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400 group-hover:bg-pink-500/20 transition-colors shrink-0">
                  <FolderDown className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors">
                    Salvar na Pasta Downloads
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Download rápido direto na pasta padrão de downloads do seu navegador.
                  </div>
                </div>
              </button>

              {/* Option C: Browser Snapshot */}
              <button
                type="button"
                onClick={handleSaveSnapshot}
                className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-amber-400 hover:bg-slate-850 transition-all text-left group flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-colors shrink-0">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                    Ponto de Restauração Local
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Salva um snapshot de segurança gravado na memória deste navegador.
                  </div>
                </div>
              </button>

              {/* Option D: Copy JSON */}
              <button
                type="button"
                onClick={handleCopyJson}
                className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-emerald-400 hover:bg-slate-850 transition-all text-left group flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors shrink-0">
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {copied ? 'Copiado com Sucesso!' : 'Copiar Dados (Texto JSON)'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Copia o código do backup para colar no WhatsApp, Bloco de Notas ou E-mail.
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Card 2: Importação com Proteção por Senha */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
              <Upload className="w-4 h-4 text-pink-400" />
              <span>Restaurar / Importar Backup</span>
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Por segurança, a restauração de dados requer confirmação da senha confidencial.
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
              <form onSubmit={handleVerifyPassword} className="space-y-3 p-3.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                  <Lock className="w-4 h-4 text-pink-400" />
                  <span>Digite a Senha de Segurança para Liberar a Restauração:</span>
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
                    A senha autoriza selecionar o arquivo em qualquer pasta.
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-pink-600 hover:bg-pink-500 active:scale-95 transition-all rounded-lg shadow-sm flex items-center gap-1.5 shrink-0"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Verificar Senha & Liberar</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Password Unlocked - Choose file from any folder */
              <div className="space-y-3 p-3.5 rounded-lg bg-slate-900 border border-emerald-500/30">
                <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Acesso Autorizado! Escolha onde está seu backup:</span>
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

                {/* Import Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={triggerOpenFilePicker}
                    className="py-2.5 px-3 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span>Procurar Arquivo no Computador...</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPasteModal(true)}
                    className="py-2.5 px-3 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-pink-400" />
                    <span>Colar Código JSON</span>
                  </button>
                </div>

                {/* Snapshot restore button if exists */}
                {snapshotInfo && (
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-300 font-semibold">Ponto de Restauração Local:</span>
                      <span className="text-slate-400 text-[11px] block">
                        Salvo em {formatDateBR(snapshotInfo.timestamp.split('T')[0])} ({snapshotInfo.clientCount} clientes)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRestoreSnapshot}
                      className="px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/60 rounded-lg transition-colors"
                    >
                      Restaurar Ponto Local
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Paste JSON Modal Drawer */}
          {showPasteModal && (
            <div className="p-3.5 rounded-xl border border-pink-500/30 bg-slate-950/90 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span>Colar Conteúdo JSON do Backup</span>
                <button
                  type="button"
                  onClick={() => setShowPasteModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                rows={4}
                value={pastedJson}
                onChange={(e) => setPastedJson(e.target.value)}
                placeholder='Cole aqui o código {"app":"LK-Clientes", ...}'
                className="w-full p-2.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-pink-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasteModal(false)}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleApplyPastedJson}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-pink-600 hover:bg-pink-500 rounded-lg shadow-sm"
                >
                  Processar e Restaurar
                </button>
              </div>
            </div>
          )}

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
