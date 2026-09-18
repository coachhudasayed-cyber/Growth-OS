import { useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  Client,
  TodoTask,
  BudgetAlarm,
  BudgetRechargeRecord,
  Agreement,
  PaymentRecord,
  DailyWorkLog,
  BrandAudit,
  ContentPlanItem,
  AdsPlanItem,
  ClientAdsStageStrategy,
  ClientDailyReport,
  WeeklyReport,
  MonthlyReport,
  QuarterlyReport,
  AdminDailyReport,
  NoteItem
} from '../types';
import {
  DEMO_USERS,
  INITIAL_CLIENTS,
  INITIAL_TODOS,
  INITIAL_BUDGET_ALARMS,
  INITIAL_AGREEMENTS,
  INITIAL_PAYMENTS,
  INITIAL_DAILY_WORK_LOGS,
  INITIAL_BRAND_AUDITS,
  INITIAL_CONTENT_PLANS,
  INITIAL_ADS_PLANS,
  INITIAL_ADS_STRATEGIES,
  INITIAL_CLIENT_DAILY_REPORTS,
  INITIAL_WEEKLY_REPORTS,
  INITIAL_MONTHLY_REPORTS,
  INITIAL_QUARTERLY_REPORTS,
  INITIAL_ADMIN_DAILY_REPORTS,
  INITIAL_NOTES,
  calculateEndDate
} from './initialData';
import { getSupabaseClient } from './supabase';

const STORAGE_KEYS = {
  CURRENT_USER: 'brand_control_current_user',
  USERS: 'brand_control_users',
  CLIENTS: 'brand_control_clients',
  TODOS: 'brand_control_todos',
  BUDGET_ALARMS: 'brand_control_budget_alarms',
  AGREEMENTS: 'brand_control_agreements',
  PAYMENTS: 'brand_control_payments',
  DAILY_WORK_LOGS: 'brand_control_daily_work_logs',
  BRAND_AUDITS: 'brand_control_brand_audits',
  CONTENT_PLANS: 'brand_control_content_plans',
  ADS_PLANS: 'brand_control_ads_plans',
  ADS_STRATEGIES: 'brand_control_ads_strategies',
  CLIENT_DAILY_REPORTS: 'brand_control_client_daily_reports',
  WEEKLY_REPORTS: 'brand_control_weekly_reports',
  MONTHLY_REPORTS: 'brand_control_monthly_reports',
  QUARTERLY_REPORTS: 'brand_control_quarterly_reports',
  ADMIN_DAILY_REPORTS: 'brand_control_admin_daily_reports',
  NOTES: 'brand_control_notes'
};

function loadInitial<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    // Migration: update old default admin name if present
    if (key === STORAGE_KEYS.CURRENT_USER && parsed && typeof parsed === 'object' && parsed.id === 'user-admin-1') {
      if (parsed.name?.includes('أحمد محمود') || parsed.name?.includes('احمد محمود')) {
        parsed.name = 'هدي سيد (الأدمن)';
      }
    }
    if (key === STORAGE_KEYS.USERS && Array.isArray(parsed)) {
      parsed.forEach((u: any) => {
        if (u && u.id === 'user-admin-1' && (u.name?.includes('أحمد محمود') || u.name?.includes('احمد محمود'))) {
          u.name = 'هدي سيد (الأدمن)';
        }
      });
    }
    return parsed;
  } catch (e) {
    console.error(`Error loading ${key} from localStorage`, e);
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
}

// React Custom Hook for global reactive state
export function useAppData() {
  // Current logged in user
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() =>
    loadInitial<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, DEMO_USERS[0])
  );

  // All registered users (Admins & Clients)
  const [users, setUsers] = useState<UserProfile[]>(() =>
    loadInitial<UserProfile[]>(STORAGE_KEYS.USERS, DEMO_USERS)
  );

  // Clients
  const [clients, setClients] = useState<Client[]>(() =>
    loadInitial<Client[]>(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS)
  );

  // Todos
  const [todos, setTodos] = useState<TodoTask[]>(() =>
    loadInitial<TodoTask[]>(STORAGE_KEYS.TODOS, INITIAL_TODOS)
  );

  // Budget Alarms
  const [budgetAlarms, setBudgetAlarms] = useState<BudgetAlarm[]>(() =>
    loadInitial<BudgetAlarm[]>(STORAGE_KEYS.BUDGET_ALARMS, INITIAL_BUDGET_ALARMS)
  );

  // Agreements
  const [agreements, setAgreements] = useState<Agreement[]>(() =>
    loadInitial<Agreement[]>(STORAGE_KEYS.AGREEMENTS, INITIAL_AGREEMENTS)
  );

  // Payments
  const [payments, setPayments] = useState<PaymentRecord[]>(() =>
    loadInitial<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS)
  );

  // Daily Work Tracking Logs
  const [dailyWorkLogs, setDailyWorkLogs] = useState<DailyWorkLog[]>(() =>
    loadInitial<DailyWorkLog[]>(STORAGE_KEYS.DAILY_WORK_LOGS, INITIAL_DAILY_WORK_LOGS)
  );

  // Brand Audits
  const [brandAudits, setBrandAudits] = useState<Record<string, BrandAudit>>(() =>
    loadInitial<Record<string, BrandAudit>>(STORAGE_KEYS.BRAND_AUDITS, INITIAL_BRAND_AUDITS)
  );

  // Content Plans
  const [contentPlans, setContentPlans] = useState<ContentPlanItem[]>(() =>
    loadInitial<ContentPlanItem[]>(STORAGE_KEYS.CONTENT_PLANS, INITIAL_CONTENT_PLANS)
  );

  // Ads Plans
  const [adsPlans, setAdsPlans] = useState<AdsPlanItem[]>(() =>
    loadInitial<AdsPlanItem[]>(STORAGE_KEYS.ADS_PLANS, INITIAL_ADS_PLANS)
  );

  // Client Ads Stage Strategies
  const [clientAdsStrategies, setClientAdsStrategies] = useState<Record<string, ClientAdsStageStrategy>>(() =>
    loadInitial<Record<string, ClientAdsStageStrategy>>(STORAGE_KEYS.ADS_STRATEGIES, INITIAL_ADS_STRATEGIES)
  );

  // Client Daily Reports
  const [clientDailyReports, setClientDailyReports] = useState<ClientDailyReport[]>(() =>
    loadInitial<ClientDailyReport[]>(STORAGE_KEYS.CLIENT_DAILY_REPORTS, INITIAL_CLIENT_DAILY_REPORTS)
  );

  // Weekly Reports
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>(() =>
    loadInitial<WeeklyReport[]>(STORAGE_KEYS.WEEKLY_REPORTS, INITIAL_WEEKLY_REPORTS)
  );

  // Monthly Reports
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>(() =>
    loadInitial<MonthlyReport[]>(STORAGE_KEYS.MONTHLY_REPORTS, INITIAL_MONTHLY_REPORTS)
  );

  // Quarterly Reports
  const [quarterlyReports, setQuarterlyReports] = useState<QuarterlyReport[]>(() =>
    loadInitial<QuarterlyReport[]>(STORAGE_KEYS.QUARTERLY_REPORTS, INITIAL_QUARTERLY_REPORTS)
  );

  // Admin Daily Reports
  const [adminDailyReports, setAdminDailyReports] = useState<AdminDailyReport[]>(() =>
    loadInitial<AdminDailyReport[]>(STORAGE_KEYS.ADMIN_DAILY_REPORTS, INITIAL_ADMIN_DAILY_REPORTS)
  );

  // Notes
  const [notes, setNotes] = useState<NoteItem[]>(() =>
    loadInitial<NoteItem[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES)
  );

  // Save changes to localStorage whenever state updates
  useEffect(() => {
    save(STORAGE_KEYS.CURRENT_USER, currentUser);
  }, [currentUser]);

  useEffect(() => {
    save(STORAGE_KEYS.USERS, users);
  }, [users]);

  useEffect(() => {
    save(STORAGE_KEYS.CLIENTS, clients);
  }, [clients]);

  useEffect(() => {
    save(STORAGE_KEYS.ADS_PLANS, adsPlans);
  }, [adsPlans]);

  useEffect(() => {
    save(STORAGE_KEYS.ADS_STRATEGIES, clientAdsStrategies);
  }, [clientAdsStrategies]);

  // Automatic sync: Remove any orphaned budget alarms or client data if client was deleted
  useEffect(() => {
    const validClientIds = new Set(clients.map(c => c.id));

    setBudgetAlarms(prev => {
      const filtered = prev.filter(b => validClientIds.has(b.clientId));
      return filtered.length !== prev.length ? filtered : prev;
    });

    setUsers(prev => {
      const filtered = prev.filter(u => u.role === 'admin' || !u.clientId || validClientIds.has(u.clientId));
      return filtered.length !== prev.length ? filtered : prev;
    });

    setAgreements(prev => {
      const filtered = prev.filter(a => validClientIds.has(a.clientId));
      return filtered.length !== prev.length ? filtered : prev;
    });

    setPayments(prev => {
      const filtered = prev.filter(p => validClientIds.has(p.clientId));
      return filtered.length !== prev.length ? filtered : prev;
    });

    setDailyWorkLogs(prev => {
      const filtered = prev.filter(l => validClientIds.has(l.clientId));
      return filtered.length !== prev.length ? filtered : prev;
    });

    setContentPlans(prev => {
      const filtered = prev.filter(cp => validClientIds.has(cp.clientId));
      return filtered.length !== prev.length ? filtered : prev;
    });

    setAdsPlans(prev => {
      const filtered = prev.filter(ap => validClientIds.has(ap.clientId));
      return filtered.length !== prev.length ? filtered : prev;
    });

    setClientAdsStrategies(prev => {
      const updated: Record<string, ClientAdsStageStrategy> = {};
      Object.keys(prev).forEach(cid => {
        if (validClientIds.has(cid)) {
          updated[cid] = prev[cid];
        }
      });
      return updated;
    });

    setClientDailyReports(prev => {
      const filtered = prev.filter(r => validClientIds.has(r.clientId));
      return filtered.length !== prev.length ? filtered : prev;
    });

    setWeeklyReports(prev => {
      const filtered = prev.filter(r => validClientIds.has(r.clientId));
      return filtered.length !== prev.length ? filtered : prev;
    });

    setMonthlyReports(prev => {
      const filtered = prev.filter(r => validClientIds.has(r.clientId));
      return filtered.length !== prev.length ? filtered : prev;
    });

    setQuarterlyReports(prev => {
      const filtered = prev.filter(r => validClientIds.has(r.clientId));
      return filtered.length !== prev.length ? filtered : prev;
    });

    setNotes(prev => {
      const filtered = prev.filter(n => validClientIds.has(n.clientId));
      return filtered.length !== prev.length ? filtered : prev;
    });
  }, [clients]);

  useEffect(() => {
    save(STORAGE_KEYS.TODOS, todos);
  }, [todos]);

  useEffect(() => {
    save(STORAGE_KEYS.BUDGET_ALARMS, budgetAlarms);
  }, [budgetAlarms]);

  useEffect(() => {
    save(STORAGE_KEYS.AGREEMENTS, agreements);
  }, [agreements]);

  useEffect(() => {
    save(STORAGE_KEYS.PAYMENTS, payments);
  }, [payments]);

  useEffect(() => {
    save(STORAGE_KEYS.DAILY_WORK_LOGS, dailyWorkLogs);
  }, [dailyWorkLogs]);

  useEffect(() => {
    save(STORAGE_KEYS.BRAND_AUDITS, brandAudits);
  }, [brandAudits]);

  useEffect(() => {
    save(STORAGE_KEYS.CONTENT_PLANS, contentPlans);
  }, [contentPlans]);

  useEffect(() => {
    save(STORAGE_KEYS.ADS_PLANS, adsPlans);
  }, [adsPlans]);

  useEffect(() => {
    save(STORAGE_KEYS.CLIENT_DAILY_REPORTS, clientDailyReports);
  }, [clientDailyReports]);

  useEffect(() => {
    save(STORAGE_KEYS.WEEKLY_REPORTS, weeklyReports);
  }, [weeklyReports]);

  useEffect(() => {
    save(STORAGE_KEYS.MONTHLY_REPORTS, monthlyReports);
  }, [monthlyReports]);

  useEffect(() => {
    save(STORAGE_KEYS.QUARTERLY_REPORTS, quarterlyReports);
  }, [quarterlyReports]);

  useEffect(() => {
    save(STORAGE_KEYS.ADMIN_DAILY_REPORTS, adminDailyReports);
  }, [adminDailyReports]);

  useEffect(() => {
    save(STORAGE_KEYS.NOTES, notes);
  }, [notes]);

  // Auth Methods
  const login = (email: string, role?: UserRole): boolean => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      return true;
    }
    // If not found, create guest account for requested role
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email,
      name: email.split('@')[0],
      role: role || 'client'
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Client CRUD
  const addClient = async (newClientData: Omit<Client, 'id' | 'createdAt'> & { password?: string }) => {
    const id = `client-${Date.now()}`;
    const newClient: Client = {
      ...newClientData,
      id,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const userRole: UserRole = newClientData.clientRole === 'employee'
      ? 'employee'
      : (newClientData.clientRole === 'admin' ? 'admin' : 'client');

    // Also register user for login
    const newClientUser: UserProfile = {
      id: `user-${id}`,
      email: newClientData.email,
      name: newClientData.clientRole === 'employee'
        ? `${newClientData.name} (موظف: ${newClientData.brandName})`
        : `${newClientData.name} (${newClientData.brandName})`,
      role: userRole,
      clientId: id
    };

    // Try Supabase Auth if client exists
    const supabase = getSupabaseClient();
    if (supabase && newClientData.password) {
      try {
        await supabase.auth.signUp({
          email: newClientData.email,
          password: newClientData.password,
          options: {
            data: {
              role: userRole,
              client_id: id,
              brand_name: newClientData.brandName
            }
          }
        });
      } catch (err) {
        console.warn('Supabase auth signup attempt completed with local fallback:', err);
      }
    }

    setClients(prev => [newClient, ...prev]);
    setUsers(prev => {
      const filtered = prev.filter(u => u.email.toLowerCase() !== newClientData.email.toLowerCase());
      return [...filtered, newClientUser];
    });
    return newClient;
  };

  const updateClient = (id: string, updatedFields: Partial<Client>) => {
    setClients(prev => prev.map(c => (c.id === id ? { ...c, ...updatedFields } : c)));
    if (updatedFields.brandName) {
      setBudgetAlarms(prev =>
        prev.map(b => (b.clientId === id ? { ...b, brandName: updatedFields.brandName! } : b))
      );
    }
    if (updatedFields.clientRole || updatedFields.email || updatedFields.name || updatedFields.brandName) {
      setUsers(prev => prev.map(u => {
        if (u.clientId === id) {
          const newRole: UserRole = updatedFields.clientRole === 'employee'
            ? 'employee'
            : (updatedFields.clientRole === 'admin' ? 'admin' : (updatedFields.clientRole === 'client' ? 'client' : u.role));
          const clientName = updatedFields.name || u.name.split(' (')[0];
          const brandName = updatedFields.brandName || '';
          return {
            ...u,
            email: updatedFields.email || u.email,
            name: brandName ? `${clientName} (${newRole === 'employee' ? 'موظف: ' : ''}${brandName})` : u.name,
            role: newRole
          };
        }
        return u;
      }));
    }
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    setUsers(prev => prev.filter(u => u.clientId !== id));
    setBudgetAlarms(prev => prev.filter(b => b.clientId !== id));
    setAgreements(prev => prev.filter(a => a.clientId !== id));
    setPayments(prev => prev.filter(p => p.clientId !== id));
    setDailyWorkLogs(prev => prev.filter(l => l.clientId !== id));
    setContentPlans(prev => prev.filter(cp => cp.clientId !== id));
    setAdsPlans(prev => prev.filter(ap => ap.clientId !== id));
    setClientDailyReports(prev => prev.filter(r => r.clientId !== id));
    setWeeklyReports(prev => prev.filter(r => r.clientId !== id));
    setNotes(prev => prev.filter(n => n.clientId !== id));
    setBrandAudits(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  // Todo Methods
  const addTodo = (title: string, priority: 'high' | 'medium' | 'low', dueDate?: string) => {
    const newTask: TodoTask = {
      id: `todo-${Date.now()}`,
      title,
      completed: false,
      priority,
      dueDate,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTodos(prev => [newTask, ...prev]);
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const editTodo = (id: string, newTitle: string, priority: 'high' | 'medium' | 'low', dueDate?: string) => {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, title: newTitle, priority, dueDate } : t)));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  // Budget Alarm Methods
  const addBudgetAlarm = (
    clientId: string,
    amount: number,
    startDate: string,
    expectedDays: number,
    platform?: string,
    notes?: string,
    campaignName?: string,
    status?: 'active' | 'paused' | 'completed' | 'needs_recharge'
  ) => {
    const clientObj = clients.find(c => c.id === clientId);
    const brandName = clientObj ? clientObj.brandName : 'براند جديد';
    const endDate = calculateEndDate(startDate, expectedDays);

    const initialHistoryRecord: BudgetRechargeRecord = {
      id: `rec-${Date.now()}`,
      date: startDate,
      amount,
      expectedDays,
      startDate,
      endDate,
      notes: notes || 'الميزانية الأولية للحملة',
      type: 'initial'
    };

    const newAlarm: BudgetAlarm = {
      id: `budget-${Date.now()}`,
      clientId,
      brandName,
      campaignName: campaignName || 'حملة إعلانية جديدة',
      amount,
      startDate,
      expectedDays,
      endDate,
      platform: platform || 'Meta Ads (FB & Insta)',
      status: status || 'active',
      notes: notes || '',
      createdAt: new Date().toISOString().split('T')[0],
      rechargesCount: 0,
      rechargeHistory: [initialHistoryRecord]
    };

    setBudgetAlarms(prev => [newAlarm, ...prev]);
  };

  const updateBudgetAlarm = (id: string, fields: Partial<BudgetAlarm>) => {
    setBudgetAlarms(prev => prev.map(b => {
      if (b.id !== id) return b;
      const updated = { ...b, ...fields };
      if (fields.startDate || fields.expectedDays !== undefined) {
        const sDate = fields.startDate || b.startDate;
        const eDays = fields.expectedDays !== undefined ? fields.expectedDays : b.expectedDays;
        updated.endDate = calculateEndDate(sDate, eDays);
      }
      return updated;
    }));
  };

  const rechargeBudgetAlarm = (
    id: string,
    newAmount: number,
    newExpectedDays: number,
    newStartDate?: string,
    rechargeNotes?: string
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const startDateToUse = newStartDate || todayStr;
    const newEndDate = calculateEndDate(startDateToUse, newExpectedDays);

    setBudgetAlarms(prev => prev.map(b => {
      if (b.id !== id) return b;

      // Construct base history if missing or empty
      const existingHistory: BudgetRechargeRecord[] = (b.rechargeHistory && b.rechargeHistory.length > 0)
        ? [...b.rechargeHistory]
        : [
            {
              id: `rec-initial-${b.id}`,
              date: b.startDate || b.createdAt || todayStr,
              amount: b.amount,
              expectedDays: b.expectedDays,
              startDate: b.startDate,
              endDate: b.endDate,
              notes: b.notes || 'الميزانية الأولية للحملة',
              type: 'initial'
            }
          ];

      const newRechargeRecord: BudgetRechargeRecord = {
        id: `rec-${Date.now()}`,
        date: todayStr,
        amount: newAmount,
        expectedDays: newExpectedDays,
        startDate: startDateToUse,
        endDate: newEndDate,
        notes: rechargeNotes || 'إعادة شحن الميزانية',
        type: 'recharge'
      };

      const currentNotes = b.notes ? b.notes : '';
      const updatedNotes = rechargeNotes 
        ? `${currentNotes ? currentNotes + '\n' : ''}[إعادة شحن ${todayStr}]: ${rechargeNotes}`
        : currentNotes;

      return {
        ...b,
        amount: newAmount,
        startDate: startDateToUse,
        expectedDays: newExpectedDays,
        endDate: newEndDate,
        status: 'active',
        notes: updatedNotes,
        rechargesCount: (b.rechargesCount || 0) + 1,
        lastRechargedAt: todayStr,
        rechargeHistory: [...existingHistory, newRechargeRecord]
      };
    }));
  };

  const deleteBudgetAlarm = (id: string) => {
    setBudgetAlarms(prev => prev.filter(b => b.id !== id));
  };

  // Agreement Methods
  const addAgreement = (data: Omit<Agreement, 'id' | 'createdAt' | 'brandName'>) => {
    const clientObj = clients.find(c => c.id === data.clientId);
    const brandName = clientObj ? clientObj.brandName : '';

    const newAgreement: Agreement = {
      ...data,
      id: `agr-${Date.now()}`,
      brandName,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setAgreements(prev => [newAgreement, ...prev]);
  };

  const deleteAgreement = (id: string) => {
    setAgreements(prev => prev.filter(a => a.id !== id));
    setPayments(prev => prev.filter(p => p.agreementId !== id));
  };

  // Payment Methods
  const addPayment = (paymentData: Omit<PaymentRecord, 'id'>) => {
    const newPay: PaymentRecord = {
      ...paymentData,
      id: `pay-${Date.now()}`
    };
    setPayments(prev => [newPay, ...prev]);
  };

  const updatePaymentStatus = (id: string, status: 'paid' | 'pending' | 'overdue') => {
    setPayments(prev => prev.map(p => (p.id === id ? { ...p, status } : p)));
  };

  const updatePayment = (id: string, updatedData: Partial<PaymentRecord>) => {
    setPayments(prev => prev.map(p => {
      if (p.id !== id) return p;
      const clientObj = clients.find(c => c.id === (updatedData.clientId || p.clientId));
      const brandName = clientObj ? clientObj.brandName : p.brandName;
      return {
        ...p,
        ...updatedData,
        brandName
      };
    }));
  };

  const deletePayment = (id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  // Daily Work Tracking Methods
  const addDailyWorkLog = (logData: Omit<DailyWorkLog, 'id' | 'createdAt'>) => {
    const newLog: DailyWorkLog = {
      ...logData,
      id: `dwl-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setDailyWorkLogs(prev => [newLog, ...prev]);
  };

  const updateDailyWorkLog = (id: string, updatedFields: Partial<DailyWorkLog>) => {
    setDailyWorkLogs(prev => prev.map(l => (l.id === id ? { ...l, ...updatedFields } : l)));
  };

  const deleteDailyWorkLog = (id: string) => {
    setDailyWorkLogs(prev => prev.filter(l => l.id !== id));
  };

  // Brand Audit Update
  const updateBrandAudit = (clientId: string, audit: BrandAudit) => {
    setBrandAudits(prev => ({ ...prev, [clientId]: audit }));
  };

  // Content Plan CRUD
  const addContentItem = (item: Omit<ContentPlanItem, 'id'>) => {
    const newItem = { ...item, id: `cnt-${Date.now()}` };
    setContentPlans(prev => [newItem, ...prev]);
  };

  const updateContentItem = (id: string, fields: Partial<ContentPlanItem>) => {
    setContentPlans(prev => prev.map(c => (c.id === id ? { ...c, ...fields } : c)));
  };

  const deleteContentItem = (id: string) => {
    setContentPlans(prev => prev.filter(c => c.id !== id));
  };

  // Ads Plan CRUD
  const addAdsPlanItem = (item: Omit<AdsPlanItem, 'id'>) => {
    const newItem = { ...item, id: `ads-${Date.now()}` };
    setAdsPlans(prev => [newItem, ...prev]);
  };

  const updateAdsPlanItem = (id: string, fields: Partial<AdsPlanItem>) => {
    setAdsPlans(prev => prev.map(a => (a.id === id ? { ...a, ...fields } : a)));
  };

  const deleteAdsPlanItem = (id: string) => {
    setAdsPlans(prev => prev.filter(a => a.id !== id));
  };

  const updateClientAdsStrategy = (clientId: string, strategy: Partial<ClientAdsStageStrategy>) => {
    setClientAdsStrategies(prev => {
      const existing = prev[clientId] || {
        currentStage: 'Launch',
        overallStrategy: '',
        phaseStatus: 'Not Started'
      };
      return {
        ...prev,
        [clientId]: {
          ...existing,
          ...strategy,
          updatedAt: new Date().toISOString().split('T')[0]
        }
      };
    });
  };

  // Client Daily Report CRUD
  const addClientDailyReport = (rep: Omit<ClientDailyReport, 'id'>) => {
    const newRep = { ...rep, id: `cdr-${Date.now()}` };
    setClientDailyReports(prev => [newRep, ...prev]);
  };

  const updateClientDailyReport = (id: string, fields: Partial<ClientDailyReport>) => {
    setClientDailyReports(prev => prev.map(r => (r.id === id ? { ...r, ...fields } : r)));
  };

  const deleteClientDailyReport = (id: string) => {
    setClientDailyReports(prev => prev.filter(r => r.id !== id));
  };

  // Weekly Report CRUD
  const addWeeklyReport = (rep: Omit<WeeklyReport, 'id'>) => {
    const newRep = { ...rep, id: `wr-${Date.now()}` };
    setWeeklyReports(prev => [newRep, ...prev]);
  };

  const updateWeeklyReport = (id: string, fields: Partial<WeeklyReport>) => {
    setWeeklyReports(prev => prev.map(r => r.id === id ? { ...r, ...fields } : r));
  };

  const deleteWeeklyReport = (id: string) => {
    setWeeklyReports(prev => prev.filter(r => r.id !== id));
  };

  // Monthly Report CRUD
  const addMonthlyReport = (rep: Omit<MonthlyReport, 'id'>) => {
    const newRep = { ...rep, id: `mr-${Date.now()}` };
    setMonthlyReports(prev => [newRep, ...prev]);
  };

  const updateMonthlyReport = (id: string, fields: Partial<MonthlyReport>) => {
    setMonthlyReports(prev => prev.map(r => r.id === id ? { ...r, ...fields } : r));
  };

  const deleteMonthlyReport = (id: string) => {
    setMonthlyReports(prev => prev.filter(r => r.id !== id));
  };

  // Quarterly Report CRUD
  const addQuarterlyReport = (rep: Omit<QuarterlyReport, 'id'>) => {
    const newRep = { ...rep, id: `qr-${Date.now()}` };
    setQuarterlyReports(prev => [newRep, ...prev]);
  };

  const updateQuarterlyReport = (id: string, fields: Partial<QuarterlyReport>) => {
    setQuarterlyReports(prev => prev.map(r => r.id === id ? { ...r, ...fields } : r));
  };

  const deleteQuarterlyReport = (id: string) => {
    setQuarterlyReports(prev => prev.filter(r => r.id !== id));
  };

  // Admin Daily Report CRUD
  const addAdminDailyReport = (rep: Omit<AdminDailyReport, 'id'>) => {
    const newRep = { ...rep, id: `adr-${Date.now()}` };
    setAdminDailyReports(prev => [newRep, ...prev]);
  };

  const updateAdminDailyReport = (id: string, fields: Partial<AdminDailyReport>) => {
    setAdminDailyReports(prev => prev.map(r => r.id === id ? { ...r, ...fields } : r));
  };

  const deleteAdminDailyReport = (id: string) => {
    setAdminDailyReports(prev => prev.filter(r => r.id !== id));
  };

  // Notes CRUD
  const addNote = (note: Omit<NoteItem, 'id'>) => {
    const newNote = { ...note, id: `note-${Date.now()}` };
    setNotes(prev => [newNote, ...prev]);
  };

  const updateNote = (id: string, fields: Partial<NoteItem>) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, ...fields } : n)));
  };

  const toggleNotePin = (id: string) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  // Reset to initial demo data helper
  const resetToDemoData = () => {
    setCurrentUser(DEMO_USERS[0]);
    setUsers(DEMO_USERS);
    setClients(INITIAL_CLIENTS);
    setTodos(INITIAL_TODOS);
    setBudgetAlarms(INITIAL_BUDGET_ALARMS);
    setAgreements(INITIAL_AGREEMENTS);
    setPayments(INITIAL_PAYMENTS);
    setDailyWorkLogs(INITIAL_DAILY_WORK_LOGS);
    setBrandAudits(INITIAL_BRAND_AUDITS);
    setContentPlans(INITIAL_CONTENT_PLANS);
    setAdsPlans(INITIAL_ADS_PLANS);
    setClientAdsStrategies(INITIAL_ADS_STRATEGIES);
    setClientDailyReports(INITIAL_CLIENT_DAILY_REPORTS);
    setWeeklyReports(INITIAL_WEEKLY_REPORTS);
    setMonthlyReports(INITIAL_MONTHLY_REPORTS);
    setQuarterlyReports(INITIAL_QUARTERLY_REPORTS);
    setAdminDailyReports(INITIAL_ADMIN_DAILY_REPORTS);
    setNotes(INITIAL_NOTES);
  };

  return {
    currentUser,
    users,
    clients,
    todos,
    budgetAlarms,
    agreements,
    payments,
    dailyWorkLogs,
    brandAudits,
    contentPlans,
    adsPlans,
    clientAdsStrategies,
    clientDailyReports,
    weeklyReports,
    monthlyReports,
    quarterlyReports,
    adminDailyReports,
    notes,
    // Methods
    login,
    logout,
    addClient,
    updateClient,
    deleteClient,
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
    addBudgetAlarm,
    updateBudgetAlarm,
    rechargeBudgetAlarm,
    deleteBudgetAlarm,
    addAgreement,
    deleteAgreement,
    addPayment,
    updatePaymentStatus,
    updatePayment,
    deletePayment,
    addDailyWorkLog,
    updateDailyWorkLog,
    deleteDailyWorkLog,
    updateBrandAudit,
    addContentItem,
    updateContentItem,
    deleteContentItem,
    addAdsPlanItem,
    updateAdsPlanItem,
    deleteAdsPlanItem,
    updateClientAdsStrategy,
    addClientDailyReport,
    updateClientDailyReport,
    deleteClientDailyReport,
    addWeeklyReport,
    updateWeeklyReport,
    deleteWeeklyReport,
    addMonthlyReport,
    updateMonthlyReport,
    deleteMonthlyReport,
    addQuarterlyReport,
    updateQuarterlyReport,
    deleteQuarterlyReport,
    addAdminDailyReport,
    updateAdminDailyReport,
    deleteAdminDailyReport,
    addNote,
    updateNote,
    toggleNotePin,
    deleteNote,
    resetToDemoData
  };
}
