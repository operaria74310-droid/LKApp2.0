import React, { useState, useEffect, useMemo } from 'react';
import {
  UserPlus,
  Database,
  ClipboardCheck,
  RotateCcw,
  Trash2,
  Calendar,
  CheckCircle,
  AlertCircle,
  Info,
  Server,
  Smartphone,
} from 'lucide-react';
import { Client, PaymentRecord, ExpenseRecord, SuggestionStore, FilterStatus } from './types';
import { Logo } from './components/Logo';
import { AlertBanner } from './components/AlertBanner';
import { FinancialSummary } from './components/FinancialSummary';
import { ClientList } from './components/ClientList';
import { ClientFormModal } from './components/ClientFormModal';
import { PaymentModal } from './components/PaymentModal';
import { RescheduleModal } from './components/RescheduleModal';
import { ServerPaymentModal } from './components/ServerPaymentModal';
import { AppPaymentModal } from './components/AppPaymentModal';
import { PasswordAuthModal } from './components/PasswordAuthModal';
import { ConferenceModal } from './components/ConferenceModal';
import { BackupModal } from './components/BackupModal';
import {
  loadClients,
  saveClients,
  loadPayments,
  savePayments,
  loadExpenses,
  saveExpenses,
  loadSuggestions,
  calculateFinancialSummary,
  resetMonthPaymentsAndExpenses,
  removeAllPaymentsAndExpenses,
} from './utils/storage';
import { getTodayISO, getDateDiffInfo, formatDateBR, formatBRL } from './utils/date';

export default function App() {
  const [clients, setClients] = useState<Client[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionStore>({
    servers: [],
    apps: [],
    banks: [],
    prices: [],
    accessCounts: [],
  });

  // Filters & Views
  const [currentFilter, setCurrentFilter] = useState<FilterStatus>('all');

  // Modals state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [clientForPayment, setClientForPayment] = useState<Client | null>(null);

  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [clientForReschedule, setClientForReschedule] = useState<Client | null>(null);

  // New Outgoing Payment Modals
  const [isServerPaymentModalOpen, setIsServerPaymentModalOpen] = useState(false);
  const [isAppPaymentModalOpen, setIsAppPaymentModalOpen] = useState(false);

  const [isConferenceModalOpen, setIsConferenceModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Password-protected action modals
  const [isResetMonthModalOpen, setIsResetMonthModalOpen] = useState(false);
  const [isRemoveAllModalOpen, setIsRemoveAllModalOpen] = useState(false);

  // Toast feedback state
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Load initial state
  const reloadData = () => {
    setClients(loadClients());
    setPayments(loadPayments());
    setExpenses(loadExpenses());
    setSuggestions(loadSuggestions());
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Today and Overdue Clients for Alerts
  const { todayClients, overdueClients } = useMemo(() => {
    const today: Client[] = [];
    const overdue: Client[] = [];

    clients.forEach((c) => {
      const info = getDateDiffInfo(c.dueDate);
      if (info.status === 'today') today.push(c);
      if (info.status === 'overdue') overdue.push(c);
    });

    return { todayClients: today, overdueClients: overdue };
  }, [clients]);

  // Financial calculations
  const financial = useMemo(() => {
    return calculateFinancialSummary(payments, expenses);
  }, [payments, expenses]);

  // Current Month Label (e.g. Outubro 2026)
  const monthLabel = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }, []);

  // Handler: Save Client (Add / Edit)
  const handleSaveClient = (
    clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => {
    let updated: Client[];
    const nowISO = new Date().toISOString();

    if (existingId) {
      updated = clients.map((c) =>
        c.id === existingId
          ? {
              ...c,
              ...clientData,
              updatedAt: nowISO,
            }
          : c
      );
      showToast(`Cliente "${clientData.name}" atualizado com sucesso!`);
    } else {
      const newClient: Client = {
        id: 'c_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
        ...clientData,
        createdAt: nowISO,
        updatedAt: nowISO,
      };
      updated = [newClient, ...clients];
      showToast(`Cliente "${clientData.name}" cadastrado com sucesso!`);
    }

    setClients(updated);
    saveClients(updated);
    setSuggestions(loadSuggestions());
  };

  // Handler: Delete Client
  const handleDeleteClient = (clientId: string, clientName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${clientName}"?`)) {
      const updated = clients.filter((c) => c.id !== clientId);
      setClients(updated);
      saveClients(updated);
      showToast(`Cliente "${clientName}" excluído.`);
    }
  };

  // Handler: Confirm Payment / Advance Payment from Client
  const handleConfirmPayment = (data: {
    client: Client;
    paymentAmount: number;
    paymentBank: string;
    paymentDate: string;
    nextDueDate: string;
    advanceMonths: number;
    notes?: string;
    openWhatsApp?: boolean;
  }) => {
    const { client, paymentAmount, paymentBank, paymentDate, nextDueDate, advanceMonths, notes, openWhatsApp } = data;

    // 1. Create Payment Record
    const newPayment: PaymentRecord = {
      id: 'p_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      clientId: client.id,
      clientName: client.name,
      server: client.server,
      app: client.app,
      amount: paymentAmount,
      bank: paymentBank,
      paymentDate,
      originalDueDate: client.dueDate,
      nextDueDate,
      timestamp: Date.now(),
      notes: notes || (advanceMonths > 1 ? `Adiantamento (${advanceMonths} meses)` : 'Mensalidade'),
    };

    const updatedPayments = [newPayment, ...payments];
    setPayments(updatedPayments);
    savePayments(updatedPayments);

    // 2. Update Client due date and sync bank if altered
    const updatedClients = clients.map((c) => {
      if (c.id === client.id) {
        return {
          ...c,
          dueDate: nextDueDate,
          bank: paymentBank,
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });

    setClients(updatedClients);
    saveClients(updatedClients);

    showToast(
      advanceMonths > 1
        ? `Adiantamento de ${advanceMonths} meses (${formatBRL(paymentAmount)}) confirmado! Próximo vencimento: ${formatDateBR(nextDueDate)}`
        : `Pagamento de ${formatBRL(paymentAmount)} confirmado! Próximo vencimento: ${formatDateBR(nextDueDate)}`
    );

    // 3. Open WhatsApp receipt if requested
    if (openWhatsApp && client.phone) {
      const cleanPhone = client.phone.replace(/\D/g, '');
      const phoneWithDDI = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
      let text = `✅ *Comprovante de Pagamento LK-Clientes*\n\n`;
      text += `Olá ${client.name}, confirmamos o recebimento do seu pagamento no valor de *${formatBRL(paymentAmount)}* via *${paymentBank}*.\n\n`;
      if (advanceMonths > 1) {
        text += `✨ *Adiantamento confirmado:* ${advanceMonths} meses de acesso renovados!\n`;
      }
      text += `🗓️ *Seu novo vencimento é:* ${formatDateBR(nextDueDate)}\n`;
      text += `📺 *Plano:* ${client.server} · ${client.app} (${client.accessCount} telas)\n\n`;
      text += `Agradecemos pela preferência e confiança! Tenha um ótimo entretenimento! 🚀`;

      const waUrl = `https://wa.me/${phoneWithDDI}?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank');
    }
  };

  // Handler: Confirm Server Payment (Saída / Despesa de Servidor)
  const handleConfirmServerPayment = (data: {
    server: string;
    amount: number;
    date: string;
    bank: string;
    notes?: string;
  }) => {
    const newExpense: ExpenseRecord = {
      id: 'e_srv_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      type: 'server',
      title: `Pagamento Servidor ${data.server}`,
      server: data.server,
      amount: data.amount,
      bank: data.bank,
      date: data.date,
      timestamp: Date.now(),
      notes: data.notes,
    };

    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    saveExpenses(updated);
    setSuggestions(loadSuggestions());

    showToast(`Pagamento do Servidor ${data.server} (${formatBRL(data.amount)}) registrado na conta ${data.bank}!`);
  };

  // Handler: Confirm App Payment (Saída / Despesa de Aplicativo)
  const handleConfirmAppPayment = (data: {
    clientName: string;
    app: string;
    mac: string;
    key: string;
    amount: number;
    date: string;
    bank: string;
    notes?: string;
  }) => {
    const newExpense: ExpenseRecord = {
      id: 'e_app_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      type: 'app',
      title: `Pagamento App ${data.app} - ${data.clientName}`,
      clientName: data.clientName,
      app: data.app,
      mac: data.mac,
      key: data.key,
      amount: data.amount,
      bank: data.bank,
      date: data.date,
      timestamp: Date.now(),
      notes: data.notes,
    };

    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    saveExpenses(updated);
    setSuggestions(loadSuggestions());

    showToast(`Pagamento do App ${data.app} para "${data.clientName}" (${formatBRL(data.amount)}) registrado na conta ${data.bank}!`);
  };

  // Handler: Reschedule Due Date
  const handleReschedule = (clientId: string, newDueDate: string, notes?: string) => {
    const updatedClients = clients.map((c) => {
      if (c.id === clientId) {
        return {
          ...c,
          dueDate: newDueDate,
          notes: notes ? (c.notes ? `${c.notes} | ${notes}` : notes) : c.notes,
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });

    setClients(updatedClients);
    saveClients(updatedClients);
    showToast(`Vencimento reagendado para ${formatDateBR(newDueDate)}!`);
  };

  // Handler: Delete individual payment from conference
  const handleDeletePayment = (paymentId: string) => {
    const updated = payments.filter((p) => p.id !== paymentId);
    setPayments(updated);
    savePayments(updated);
    showToast('Recebimento removido da conferência.');
  };

  // Handler: Delete individual expense from conference
  const handleDeleteExpense = (expenseId: string) => {
    const updated = expenses.filter((e) => e.id !== expenseId);
    setExpenses(updated);
    saveExpenses(updated);
    showToast('Pagamento/despesa removida da conferência.');
  };

  // Handler: Reset Month Balances (Password protected: 74310)
  const handleSuccessResetMonth = () => {
    const result = resetMonthPaymentsAndExpenses(financial.monthKey);
    setPayments(result.payments);
    setExpenses(result.expenses);
    showToast('Valores do mês (recebimentos e pagamentos) reiniciados com sucesso!', 'info');
  };

  // Handler: Remove ALL Balances (Password protected: 74310)
  const handleSuccessRemoveAll = () => {
    const result = removeAllPaymentsAndExpenses();
    setPayments(result.payments);
    setExpenses(result.expenses);
    showToast('Todos os valores e lançamentos de todas as contas foram zerados com sucesso!', 'info');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Top Bar adhering to the Top Bar Contract (3 zones separated by gap-8) */}
      <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Single text element Brand Zone with Logo */}
          <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
            <Logo size={38} />
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <button
              type="button"
              onClick={() => {
                setCurrentFilter('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-pink-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Painel Geral
            </button>
            <button
              type="button"
              onClick={() => setIsServerPaymentModalOpen(true)}
              className="hover:text-orange-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <Server className="w-3.5 h-3.5 text-orange-400" />
              <span>Pagar Servidor</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAppPaymentModalOpen(true)}
              className="hover:text-purple-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-purple-400" />
              <span>Pagar App</span>
            </button>
            <button
              type="button"
              onClick={() => setIsConferenceModalOpen(true)}
              className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Extrato & Conferência</span>
            </button>
            <button
              type="button"
              onClick={() => setIsBackupModalOpen(true)}
              className="hover:text-pink-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Backup</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action Button */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setClientToEdit(null);
                setIsClientModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-pink-600 via-pink-500 to-rose-500 hover:from-pink-500 hover:to-rose-400 active:scale-95 transition-all rounded-xl shadow-lg shadow-pink-500/20 whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              <span>Novo Mensalista</span>
            </button>

            {/* Mobile Backup Quick Button */}
            <button
              type="button"
              onClick={() => setIsBackupModalOpen(true)}
              title="Backup e Restauração"
              className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl"
            >
              <Database className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Toast Notification Alert */}
        {toast && (
          <div
            className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl text-xs font-medium animate-bounce backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-slate-900 text-emerald-300 border-emerald-500/40'
                : toast.type === 'error'
                ? 'bg-slate-900 text-rose-300 border-rose-500/40'
                : 'bg-slate-900 text-cyan-300 border-cyan-500/40'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400" />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* 1. Alert Banner for Due Today & Overdue billings */}
        <AlertBanner
          todayClients={todayClients}
          overdueClients={overdueClients}
          onSelectFilter={(filter) => setCurrentFilter(filter)}
        />

        {/* 2. Financial Summary (Fluxo completo: Recebimentos, Pagamento de Servidor, Pagamento de Apps, Saldos por Banco) */}
        <FinancialSummary
          monthlyTotal={financial.monthlyTotal}
          dailyTotal={financial.dailyTotal}
          monthlyIncome={financial.monthlyIncome}
          monthlyExpense={financial.monthlyExpense}
          serverExpenseMonthly={financial.serverExpenseMonthly}
          appExpenseMonthly={financial.appExpenseMonthly}
          dailyIncome={financial.dailyIncome}
          dailyExpense={financial.dailyExpense}
          bankSummaries={financial.bankSummaries}
          monthLabel={monthLabel}
          onOpenPayServer={() => setIsServerPaymentModalOpen(true)}
          onOpenPayApp={() => setIsAppPaymentModalOpen(true)}
          onOpenConference={() => setIsConferenceModalOpen(true)}
          onRequestResetMonth={() => setIsResetMonthModalOpen(true)}
          onRequestRemoveAll={() => setIsRemoveAllModalOpen(true)}
        />

        {/* 3. Client Management List & Filter View */}
        <section className="pt-2">
          <ClientList
            clients={clients}
            currentFilter={currentFilter}
            onChangeFilter={(filter) => setCurrentFilter(filter)}
            onAddNewClient={() => {
              setClientToEdit(null);
              setIsClientModalOpen(true);
            }}
            onConfirmPayment={(client) => {
              setClientForPayment(client);
              setIsPaymentModalOpen(true);
            }}
            onReschedule={(client) => {
              setClientForReschedule(client);
              setIsRescheduleModalOpen(true);
            }}
            onEdit={(client) => {
              setClientToEdit(client);
              setIsClientModalOpen(true);
            }}
            onDelete={handleDeleteClient}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">LK-Clientes</span>
            <span>·</span>
            <span>Sistema de Cobrança e Gestão Mensalista</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Controle de mensalidades, pagamentos de servidores e aplicativos, alertas e segurança
          </div>
        </div>
      </footer>

      {/* MODALS */}

      {/* 1. Client Form Modal (Add / Edit) */}
      <ClientFormModal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setClientToEdit(null);
        }}
        clientToEdit={clientToEdit}
        suggestions={suggestions}
        onSave={handleSaveClient}
      />

      {/* 2. Client Payment Modal (Recebimento de Mensalidade / Adiantamento) */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setClientForPayment(null);
        }}
        client={clientForPayment}
        suggestions={suggestions}
        onConfirmPayment={handleConfirmPayment}
      />

      {/* 3. Server Payment Modal (Pagamento de Servidor) */}
      <ServerPaymentModal
        isOpen={isServerPaymentModalOpen}
        onClose={() => setIsServerPaymentModalOpen(false)}
        suggestions={suggestions}
        onConfirmServerPayment={handleConfirmServerPayment}
      />

      {/* 4. App Payment Modal (Pagamento de Aplicativos) */}
      <AppPaymentModal
        isOpen={isAppPaymentModalOpen}
        onClose={() => setIsAppPaymentModalOpen(false)}
        clients={clients}
        suggestions={suggestions}
        onConfirmAppPayment={handleConfirmAppPayment}
      />

      {/* 5. Reschedule Modal (Trocar data quando quiser) */}
      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => {
          setIsRescheduleModalOpen(false);
          setClientForReschedule(null);
        }}
        client={clientForReschedule}
        onReschedule={handleReschedule}
      />

      {/* 6. Conference Modal (Extrato completo: Recebimentos e Pagamentos de Servidor e App) */}
      <ConferenceModal
        isOpen={isConferenceModalOpen}
        onClose={() => setIsConferenceModalOpen(false)}
        payments={payments}
        expenses={expenses}
        onDeletePayment={handleDeletePayment}
        onDeleteExpense={handleDeleteExpense}
      />

      {/* 7. Backup & Restore Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataRestored={reloadData}
      />

      {/* 8. Password Modal for Resetting Month Values */}
      <PasswordAuthModal
        isOpen={isResetMonthModalOpen}
        onClose={() => setIsResetMonthModalOpen(false)}
        title="Reiniciar Valores do Mês"
        description="Esta ação reiniciará os valores recebidos e pagamentos efetuados do mês selecionado. Os cadastros de clientes permanecerão intactos. Digite a senha para autorizar:"
        confirmLabel="Reiniciar Valores do Mês"
        dangerLevel="warning"
        onSuccess={handleSuccessResetMonth}
      />

      {/* 9. Password Modal for Removing ALL Values from All Accounts */}
      <PasswordAuthModal
        isOpen={isRemoveAllModalOpen}
        onClose={() => setIsRemoveAllModalOpen(false)}
        title="Remover Totalmente Todas as Contas"
        description="ATENÇÃO: Esta ação removerá totalmente todo o histórico financeiro (recebimentos, servidores e aplicativos) e os saldos de todas as contas. Para autorizar, digite a senha de segurança:"
        confirmLabel="Zerar Totalmente Todas as Contas"
        dangerLevel="danger"
        onSuccess={handleSuccessRemoveAll}
      />
    </div>
  );
}
