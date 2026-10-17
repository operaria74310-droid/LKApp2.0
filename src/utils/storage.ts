import { Client, PaymentRecord, SuggestionStore, BankSummary } from '../types';
import { getTodayISO, getCurrentMonthKey } from './date';

const CLIENTS_KEY = 'LK_CLIENTS_DATA';
const PAYMENTS_KEY = 'LK_PAYMENT_HISTORY';
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
    // Update suggestions automatically
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

/**
 * Calculates current month total, daily total, and individual bank totals for the month.
 */
export function calculateFinancialSummary(payments: PaymentRecord[], monthKey = getCurrentMonthKey()) {
  const todayStr = getTodayISO();

  let monthlyTotal = 0;
  let dailyTotal = 0;

  const bankMap: Record<string, { monthlyTotal: number; dailyTotal: number; count: number }> = {};

  payments.forEach((p) => {
    const isThisMonth = p.paymentDate.startsWith(monthKey);
    const isToday = p.paymentDate === todayStr;

    if (isThisMonth) {
      monthlyTotal += p.amount;

      if (!bankMap[p.bank]) {
        bankMap[p.bank] = { monthlyTotal: 0, dailyTotal: 0, count: 0 };
      }
      bankMap[p.bank].monthlyTotal += p.amount;
      bankMap[p.bank].count += 1;
    }

    if (isToday) {
      dailyTotal += p.amount;
      if (!bankMap[p.bank]) {
        bankMap[p.bank] = { monthlyTotal: 0, dailyTotal: 0, count: 0 };
      }
      bankMap[p.bank].dailyTotal += p.amount;
    }
  });

  const bankSummaries: BankSummary[] = Object.keys(bankMap).map((bank) => ({
    bank,
    monthlyTotal: bankMap[bank].monthlyTotal,
    dailyTotal: bankMap[bank].dailyTotal,
    count: bankMap[bank].count,
  }));

  // Ensure Nubank and PicPay appear in bankSummaries even if currently 0
  const defaultBanks = ['Nubank', 'PicPay'];
  defaultBanks.forEach((defaultBank) => {
    if (!bankSummaries.some((b) => b.bank.toLowerCase() === defaultBank.toLowerCase())) {
      bankSummaries.unshift({
        bank: defaultBank,
        monthlyTotal: 0,
        dailyTotal: 0,
        count: 0,
      });
    }
  });

  return {
    monthlyTotal,
    dailyTotal,
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
 * Resets values for the given month (removes payment records in that month)
 */
export function resetMonthPayments(monthKey: string): PaymentRecord[] {
  const payments = loadPayments();
  const filtered = payments.filter((p) => !p.paymentDate.startsWith(monthKey));
  savePayments(filtered);
  return filtered;
}

/**
 * Completely clears ALL payment values across all bank accounts
 */
export function removeAllPayments(): PaymentRecord[] {
  savePayments([]);
  return [];
}

/**
 * Export full backup as JSON string
 */
export function exportBackupData(): string {
  const data = {
    app: 'LK-Clientes',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    clients: loadClients(),
    payments: loadPayments(),
    suggestions: loadSuggestions(),
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Import backup data from parsed JSON
 */
export function importBackupData(jsonContent: string, mode: 'replace' | 'merge'): { success: boolean; message: string; clientCount?: number; paymentCount?: number } {
  try {
    const data = JSON.parse(jsonContent);
    if (!data.clients || !Array.isArray(data.clients)) {
      return { success: false, message: 'Arquivo de backup inválido: lista de clientes não encontrada.' };
    }

    if (mode === 'replace') {
      saveClients(data.clients);
      savePayments(Array.isArray(data.payments) ? data.payments : []);
      if (data.suggestions) {
        saveSuggestions(data.suggestions);
      }
    } else {
      // Merge
      const existingClients = loadClients();
      const existingClientIds = new Set(existingClients.map((c) => c.id));
      const mergedClients = [...existingClients];

      (data.clients as Client[]).forEach((nc) => {
        if (!existingClientIds.has(nc.id)) {
          mergedClients.push(nc);
        }
      });
      saveClients(mergedClients);

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
    }

    return {
      success: true,
      message: 'Backup importado com sucesso!',
      clientCount: data.clients.length,
      paymentCount: (data.payments || []).length,
    };
  } catch (err: any) {
    return { success: false, message: `Erro ao processar arquivo: ${err.message}` };
  }
}
