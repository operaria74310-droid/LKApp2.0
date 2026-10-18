import { Client, PaymentRecord, ExpenseRecord, SuggestionStore, BankSummary } from '../types';
import { getTodayISO, getCurrentMonthKey } from './date';

const CLIENTS_KEY = 'LK_CLIENTS_DATA';
const PAYMENTS_KEY = 'LK_PAYMENT_HISTORY';
const EXPENSES_KEY = 'LK_EXPENSES_DATA';
const SUGGESTIONS_KEY = 'LK_SUGGESTIONS';

export const DEFAULT_SUGGESTIONS: SuggestionStore = {
  servers: ['SFL', 'LVU', 'SP4', 'TVP', 'GLX'],
  apps: ['XCIPTV', 'IPTV Smarters Pro', 'TiviMate', 'IBO Player', 'Smart IPTV', 'SS IPTV', 'Bob Player'],
  banks: ['Nubank', 'PicPay', 'Banco Inter', 'Mercado Pago', 'Caixa Econômica', 'Bradesco', 'Itaú'],
  prices: [25, 30, 35, 40, 50, 70],
  accessCounts: [1, 2, 3, 4],
};

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Carlos Eduardo Silva',
    server: 'SFL',
    app: 'XCIPTV',
    mac: '00:1A:79:B4:82:1A',
    key: '94821',
    accessCount: 1,
    price: 35.0,
    bank: 'Nubank',
    hasPmd: false,
    dueDate: getTodayISO(), // Due today for alert testing
    phone: '5511999887766',
    notes: 'Plano padrão com canais e filmes FHD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'c2',
    name: 'Mariana Santos Rocha',
    server: 'LVU',
    app: 'TiviMate',
    mac: '00:1A:79:3F:12:08',
    key: '31049',
    accessCount: 2,
    price: 50.0,
    bank: 'PicPay',
    hasPmd: true,
    dueDate: getTodayISO(), // Also due today
    phone: '5521988776655',
    notes: '2 telas ativas na Smart TV e celular',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'c3',
    name: 'Roberto Fernandes Lima',
    server: 'SP4',
    app: 'IBO Player',
    mac: '12:B4:56:88:AC:33',
    key: '88410',
    accessCount: 1,
    price: 35.0,
    bank: 'Nubank',
    hasPmd: false,
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // 3 days ahead
    phone: '5531977665544',
    notes: 'Vencimento em 3 dias',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'c4',
    name: 'Juliana Costa e Silva',
    server: 'SFL',
    app: 'IPTV Smarters Pro',
    mac: 'E4:5F:01:99:77:22',
    key: '74129',
    accessCount: 1,
    price: 30.0,
    bank: 'PicPay',
    hasPmd: true,
    dueDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], // 2 days overdue
    phone: '5541991234567',
    notes: 'Aguardando comprovante PIX',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper to seed initial sample payments
function getInitialPayments(): PaymentRecord[] {
  const today = getTodayISO();
  return [
    {
      id: 'p1',
      clientId: 'c1',
      clientName: 'Carlos Eduardo Silva',
      server: 'SFL',
      app: 'XCIPTV',
      amount: 35.0,
      bank: 'Nubank',
      paymentDate: today,
      originalDueDate: today,
      nextDueDate: '',
      timestamp: Date.now() - 3600000 * 2,
      notes: 'Mensalidade confirmada via PIX',
    },
    {
      id: 'p2',
      clientId: 'c2',
      clientName: 'Mariana Santos Rocha',
      server: 'LVU',
      app: 'TiviMate',
      amount: 50.0,
      bank: 'PicPay',
      paymentDate: today,
      originalDueDate: today,
      nextDueDate: '',
      timestamp: Date.now() - 3600000 * 4,
      notes: 'Pago via PicPay',
    },
  ];
}

// Helper to seed sample expenses
function getInitialExpenses(): ExpenseRecord[] {
  const today = getTodayISO();
  return [
    {
      id: 'e1',
      type: 'server',
      title: 'Pagamento Servidor SFL',
      server: 'SFL',
      amount: 25.0,
      bank: 'Nubank',
      date: today,
      timestamp: Date.now() - 3600000 * 5,
      notes: 'Recarga de créditos SFL',
    },
    {
      id: 'e2',
      type: 'app',
      title: 'Licença IBO Player - Roberto',
      clientName: 'Roberto Fernandes Lima',
      app: 'IBO Player',
      mac: '12:B4:56:88:AC:33',
      key: '88410',
      amount: 15.0,
      bank: 'PicPay',
      date: today,
      timestamp: Date.now() - 3600000 * 3,
      notes: 'Ativação anual do aplicativo',
    },
  ];
}

export function loadClients(): Client[] {
  try {
    const raw = localStorage.getItem(CLIENTS_KEY);
    if (!raw) {
      saveClients(INITIAL_CLIENTS);
      return INITIAL_CLIENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading clients:', err);
    return INITIAL_CLIENTS;
  }
}

export function saveClients(clients: Client[]): void {
  try {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    learnFromClients(clients);
  } catch (err) {
    console.error('Error saving clients:', err);
  }
}

export function loadPayments(): PaymentRecord[] {
  try {
    const raw = localStorage.getItem(PAYMENTS_KEY);
    if (!raw) {
      const initial = getInitialPayments();
      savePayments(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading payments:', err);
    return [];
  }
}

export function savePayments(payments: PaymentRecord[]): void {
  try {
    localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
  } catch (err) {
    console.error('Error saving payments:', err);
  }
}

export function loadExpenses(): ExpenseRecord[] {
  try {
    const raw = localStorage.getItem(EXPENSES_KEY);
    if (!raw) {
      const initial = getInitialExpenses();
      saveExpenses(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading expenses:', err);
    return [];
  }
}

export function saveExpenses(expenses: ExpenseRecord[]): void {
  try {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    learnFromExpenses(expenses);
  } catch (err) {
    console.error('Error saving expenses:', err);
  }
}

export function loadSuggestions(): SuggestionStore {
  try {
    const raw = localStorage.getItem(SUGGESTIONS_KEY);
    if (!raw) {
      localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(DEFAULT_SUGGESTIONS));
      return DEFAULT_SUGGESTIONS;
    }
    const parsed = JSON.parse(raw);
    return {
      servers: Array.from(new Set([...DEFAULT_SUGGESTIONS.servers, ...(parsed.servers || [])])),
      apps: Array.from(new Set([...DEFAULT_SUGGESTIONS.apps, ...(parsed.apps || [])])),
      banks: Array.from(new Set([...DEFAULT_SUGGESTIONS.banks, ...(parsed.banks || [])])),
      prices: Array.from(new Set([...DEFAULT_SUGGESTIONS.prices, ...(parsed.prices || [])])).sort((a, b) => a - b),
      accessCounts: Array.from(new Set([...DEFAULT_SUGGESTIONS.accessCounts, ...(parsed.accessCounts || [])])).sort((a, b) => a - b),
    };
  } catch {
    return DEFAULT_SUGGESTIONS;
  }
}

export function saveSuggestions(suggestions: SuggestionStore): void {
  try {
    localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(suggestions));
  } catch (err) {
    console.error('Error saving suggestions:', err);
  }
}

export function learnFromClients(clients: Client[]): void {
  const current = loadSuggestions();
  const servers = new Set(current.servers);
  const apps = new Set(current.apps);
  const banks = new Set(current.banks);
  const prices = new Set(current.prices);
  const accessCounts = new Set(current.accessCounts);

  clients.forEach((c) => {
    if (c.server?.trim()) servers.add(c.server.trim());
    if (c.app?.trim()) apps.add(c.app.trim());
    if (c.bank?.trim()) banks.add(c.bank.trim());
    if (c.price && c.price > 0) prices.add(c.price);
    if (c.accessCount && c.accessCount > 0) accessCounts.add(c.accessCount);
  });

  saveSuggestions({
    servers: Array.from(servers),
    apps: Array.from(apps),
    banks: Array.from(banks),
    prices: Array.from(prices).sort((a, b) => a - b),
    accessCounts: Array.from(accessCounts).sort((a, b) => a - b),
  });
}

export function learnFromExpenses(expenses: ExpenseRecord[]): void {
  const current = loadSuggestions();
  const servers = new Set(current.servers);
  const apps = new Set(current.apps);
  const banks = new Set(current.banks);

  expenses.forEach((e) => {
    if (e.server?.trim()) servers.add(e.server.trim());
    if (e.app?.trim()) apps.add(e.app.trim());
    if (e.bank?.trim()) banks.add(e.bank.trim());
  });

  saveSuggestions({
    ...current,
    servers: Array.from(servers),
    apps: Array.from(apps),
    banks: Array.from(banks),
  });
}

/**
 * Calculates current month total, daily total, and individual bank totals
 * accounting for both Income (Payments) and Expenses (Server & App Payments).
 */
export function calculateFinancialSummary(
  payments: PaymentRecord[],
  expenses: ExpenseRecord[] = [],
  monthKey = getCurrentMonthKey()
) {
  const todayStr = getTodayISO();

  let monthlyIncome = 0;
  let monthlyExpense = 0;
  let serverExpenseMonthly = 0;
  let appExpenseMonthly = 0;

  let dailyIncome = 0;
  let dailyExpense = 0;

  interface BankLedger {
    incomeMonthly: number;
    incomeDaily: number;
    expenseMonthly: number;
    expenseDaily: number;
    count: number;
  }

  const bankMap: Record<string, BankLedger> = {};

  const getOrCreateBank = (bank: string): BankLedger => {
    const trimmed = bank?.trim() || 'Outros';
    if (!bankMap[trimmed]) {
      bankMap[trimmed] = {
        incomeMonthly: 0,
        incomeDaily: 0,
        expenseMonthly: 0,
        expenseDaily: 0,
        count: 0,
      };
    }
    return bankMap[trimmed];
  };

  // 1. Process Income (Payments received from clients)
  payments.forEach((p) => {
    const isThisMonth = p.paymentDate.startsWith(monthKey);
    const isToday = p.paymentDate === todayStr;
    const ledger = getOrCreateBank(p.bank);

    if (isThisMonth) {
      monthlyIncome += p.amount;
      ledger.incomeMonthly += p.amount;
      ledger.count += 1;
    }

    if (isToday) {
      dailyIncome += p.amount;
      ledger.incomeDaily += p.amount;
    }
  });

  // 2. Process Expenses (Payments made for Server & Apps)
  expenses.forEach((e) => {
    const isThisMonth = e.date.startsWith(monthKey);
    const isToday = e.date === todayStr;
    const ledger = getOrCreateBank(e.bank);

    if (isThisMonth) {
      monthlyExpense += e.amount;
      ledger.expenseMonthly += e.amount;
      ledger.count += 1;

      if (e.type === 'server') {
        serverExpenseMonthly += e.amount;
      } else {
        appExpenseMonthly += e.amount;
      }
    }

    if (isToday) {
      dailyExpense += e.amount;
      ledger.expenseDaily += e.amount;
    }
  });

  // Build bank summary list
  const bankSummaries: BankSummary[] = Object.keys(bankMap).map((bank) => {
    const data = bankMap[bank];
    const netMonthly = data.incomeMonthly - data.expenseMonthly;
    const netDaily = data.incomeDaily - data.expenseDaily;

    return {
      bank,
      incomeMonthly: data.incomeMonthly,
      incomeDaily: data.incomeDaily,
      expenseMonthly: data.expenseMonthly,
      expenseDaily: data.expenseDaily,
      netMonthly,
      netDaily,
      monthlyTotal: netMonthly,
      dailyTotal: netDaily,
      count: data.count,
    };
  });

  // Ensure Nubank and PicPay appear in bankSummaries even if currently 0
  const defaultBanks = ['Nubank', 'PicPay'];
  defaultBanks.forEach((defaultBank) => {
    if (!bankSummaries.some((b) => b.bank.toLowerCase() === defaultBank.toLowerCase())) {
      bankSummaries.unshift({
        bank: defaultBank,
        incomeMonthly: 0,
        incomeDaily: 0,
        expenseMonthly: 0,
        expenseDaily: 0,
        netMonthly: 0,
        netDaily: 0,
        monthlyTotal: 0,
        dailyTotal: 0,
        count: 0,
      });
    }
  });

  const netMonthly = monthlyIncome - monthlyExpense;
  const netDaily = dailyIncome - dailyExpense;

  return {
    // Net
    monthlyTotal: netMonthly,
    dailyTotal: netDaily,
    netMonthly,
    netDaily,
    // Income Breakdown
    monthlyIncome,
    dailyIncome,
    // Expense Breakdown
    monthlyExpense,
    dailyExpense,
    serverExpenseMonthly,
    appExpenseMonthly,
    // Bank details
    bankSummaries,
    monthKey,
  };
}

/**
 * Password verification helper for 74310.
 * NEVER exposes the password to UI or error outputs.
 */
export function verifyAdminPassword(password: string): boolean {
  return password.trim() === '74310';
}

/**
 * Resets values for the given month (removes both payment records and expenses in that month)
 */
export function resetMonthPaymentsAndExpenses(monthKey: string): { payments: PaymentRecord[]; expenses: ExpenseRecord[] } {
  const payments = loadPayments();
  const filteredPayments = payments.filter((p) => !p.paymentDate.startsWith(monthKey));
  savePayments(filteredPayments);

  const expenses = loadExpenses();
  const filteredExpenses = expenses.filter((e) => !e.date.startsWith(monthKey));
  saveExpenses(filteredExpenses);

  return { payments: filteredPayments, expenses: filteredExpenses };
}

/**
 * Completely clears ALL payment values and expenses across all bank accounts
 */
export function removeAllPaymentsAndExpenses(): { payments: PaymentRecord[]; expenses: ExpenseRecord[] } {
  savePayments([]);
  saveExpenses([]);
  return { payments: [], expenses: [] };
}

/**
 * Export full backup as JSON string including expenses
 */
export function exportBackupData(): string {
  const data = {
    app: 'LK-Clientes',
    version: '1.1.0',
    exportedAt: new Date().toISOString(),
    clients: loadClients(),
    payments: loadPayments(),
    expenses: loadExpenses(),
    suggestions: loadSuggestions(),
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Import backup data from parsed JSON
 */
export function importBackupData(
  jsonContent: string,
  mode: 'replace' | 'merge'
): { success: boolean; message: string; clientCount?: number; paymentCount?: number; expenseCount?: number } {
  try {
    const data = JSON.parse(jsonContent);
    if (!data.clients || !Array.isArray(data.clients)) {
      return { success: false, message: 'Arquivo de backup inválido: lista de clientes não encontrada.' };
    }

    if (mode === 'replace') {
      saveClients(data.clients);
      savePayments(Array.isArray(data.payments) ? data.payments : []);
      saveExpenses(Array.isArray(data.expenses) ? data.expenses : []);
      if (data.suggestions) {
        saveSuggestions(data.suggestions);
      }
    } else {
      // Merge clients
      const existingClients = loadClients();
      const existingClientIds = new Set(existingClients.map((c) => c.id));
      const mergedClients = [...existingClients];

      (data.clients as Client[]).forEach((nc) => {
        if (!existingClientIds.has(nc.id)) {
          mergedClients.push(nc);
        }
      });
      saveClients(mergedClients);

      // Merge payments
      const existingPayments = loadPayments();
      const existingPaymentIds = new Set(existingPayments.map((p) => p.id));
      const mergedPayments = [...existingPayments];

      if (Array.isArray(data.payments)) {
        (data.payments as PaymentRecord[]).forEach((np) => {
          if (!existingPaymentIds.has(np.id)) {
            mergedPayments.push(np);
          }
        });
      }
      savePayments(mergedPayments);

      // Merge expenses
      const existingExpenses = loadExpenses();
      const existingExpenseIds = new Set(existingExpenses.map((e) => e.id));
      const mergedExpenses = [...existingExpenses];

      if (Array.isArray(data.expenses)) {
        (data.expenses as ExpenseRecord[]).forEach((ne) => {
          if (!existingExpenseIds.has(ne.id)) {
            mergedExpenses.push(ne);
          }
        });
      }
      saveExpenses(mergedExpenses);
    }

    return {
      success: true,
      message: 'Backup importado com sucesso!',
      clientCount: data.clients.length,
      paymentCount: (data.payments || []).length,
      expenseCount: (data.expenses || []).length,
    };
  } catch (err: any) {
    return { success: false, message: `Erro ao processar arquivo: ${err.message}` };
  }
}
