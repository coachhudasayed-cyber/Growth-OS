import { useEffect, useRef, useState } from 'react';
import {
  UserProfile, Client, Employee, TodoTask, BudgetAlarm, BudgetRechargeRecord,
  Agreement, PaymentRecord, DailyWorkLog, BrandAudit, ContentPlanItem,
  AdsPlanItem, ClientAdsStageStrategy, ClientDailyReport, WeeklyReport,
  MonthlyReport, QuarterlyReport, AdminDailyReport, NoteItem
} from '../types';
import { calculateEndDate } from './initialData';
import { supabase } from './supabase';

type StoredRecord = {
  collection: string;
  record_id: string;
  client_id: string | null;
  data: unknown;
};

const CLIENT_WRITABLE_COLLECTIONS = new Set([
  'payments',
  'clientDailyReports',
  'notes'
]);

const profileFromRow = (row: any): UserProfile => ({
  id: row.id,
  email: row.email,
  name: row.name,
  role: row.role,
  clientId: row.client_id || undefined
});

const employeeFromResponse = (row: any): Employee => ({
  id: row.id,
  email: row.email,
  name: row.name,
  phone: row.phone || '',
  assignments: (row.assignments || []).map((item: any) => ({
    clientId: item.client_id,
    compensation: Number(item.compensation)
  }))
});

const employeeAccountError = async (error: { context?: unknown; message?: string } | null | undefined) => {
  let reason = '';
  try {
    const response = error?.context as Response | undefined;
    const payload = await response?.json() as { error?: string } | undefined;
    reason = payload?.error || '';
  } catch {
    // A network failure may not contain a JSON response.
  }
  const messages: Record<string, string> = {
    'Invalid employee details': 'راجعي بيانات الموظف وكلمة السر والأجر لكل براند.',
    'Unknown brand assignment': 'البراند المحدد لم يعد موجودًا. حدّثي الصفحة وحاولي مجددًا.',
    'Email already used or invalid': 'الإيميل مستخدم بالفعل أو غير صالح.',
    'Could not save employee account': 'تعذر حفظ حساب الموظف في Supabase.',
    'Could not save brand assignments': 'تعذر حفظ إسناد البراندات في Supabase. صلاحيات جدول الموظفين غير مكتملة.',
    'Server secret not configured': 'إعداد خادم Supabase غير مكتمل.',
    'Invalid session': 'انتهت جلسة الدخول. سجّلي الدخول مرة أخرى.',
    'Admin access required': 'إضافة الموظفين متاحة للأدمن فقط.'
  };
  return new Error(messages[reason] || (reason ? `تعذر حفظ الموظف: ${reason}` : error?.message || 'تعذر حفظ الموظف.'));
};

export function useAppData() {
  const [ready, setReady] = useState(false);
  const [authError, setAuthError] = useState('');
  const [syncError, setSyncError] = useState('');
  const [retrySyncCount, setRetrySyncCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [todos, setTodos] = useState<TodoTask[]>([]);
  const [budgetAlarms, setBudgetAlarms] = useState<BudgetAlarm[]>([]);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [dailyWorkLogs, setDailyWorkLogs] = useState<DailyWorkLog[]>([]);
  const [brandAudits, setBrandAudits] = useState<Record<string, BrandAudit>>({});
  const [contentPlans, setContentPlans] = useState<ContentPlanItem[]>([]);
  const [adsPlans, setAdsPlans] = useState<AdsPlanItem[]>([]);
  const [clientAdsStrategies, setClientAdsStrategies] = useState<Record<string, ClientAdsStageStrategy>>({});
  const [clientDailyReports, setClientDailyReports] = useState<ClientDailyReport[]>([]);
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);
  const [quarterlyReports, setQuarterlyReports] = useState<QuarterlyReport[]>([]);
  const [adminDailyReports, setAdminDailyReports] = useState<AdminDailyReport[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const savedRecords = useRef<Map<string, string>>(new Map());
  const writeQueue = useRef<Promise<void>>(Promise.resolve());

  const loadAccount = async (userId: string) => {
    setReady(false);
    const profileResult = await supabase.from('profiles').select('id,email,name,role,client_id').eq('id', userId).single();
    if (profileResult.error || !profileResult.data) {
      await supabase.auth.signOut();
      throw new Error('الحساب غير مُفعّل داخل النظام. تواصلي مع الأدمن.');
    }
    const [clientResult, userResult] = await Promise.all([
      supabase.from('clients').select('data'),
      supabase.from('profiles').select('id,email,name,role,client_id,phone')
    ]);
    if (clientResult.error) throw clientResult.error;
    if (userResult.error) throw userResult.error;
    const assignmentResult = profileResult.data.role === 'admin'
      ? await supabase.from('employee_assignments').select('employee_id,client_id,compensation')
      : { data: [], error: null };
    if (assignmentResult.error) throw assignmentResult.error;
    const rows: StoredRecord[] = [];
    for (let start = 0; ; start += 1000) {
      const result = await supabase.from('app_records')
        .select('collection,record_id,client_id,data')
        .order('collection').order('record_id').range(start, start + 999);
      if (result.error) throw result.error;
      rows.push(...((result.data || []) as StoredRecord[]));
      if (!result.data || result.data.length < 1000) break;
    }
    const byCollection = (name: string) => rows.filter(row => row.collection === name).map(row => row.data);
    const asMap = <T,>(name: string): Record<string, T> =>
      Object.fromEntries(rows.filter(row => row.collection === name).map(row => [row.record_id, row.data as T]));
    savedRecords.current = new Map(rows
      .filter(row => profileResult.data.role !== 'client' || row.collection === 'clientDailyReports' || row.collection === 'notes')
      .map(row => [`${row.collection}:${row.record_id}`, JSON.stringify(row)]));
    setUsers((userResult.data || []).map(profileFromRow));
    setEmployees((userResult.data || []).filter(row => row.role === 'employee').map(row => ({
      id: row.id,
      email: row.email,
      name: row.name,
      phone: row.phone || '',
      assignments: (assignmentResult.data || []).filter(item => item.employee_id === row.id)
        .map(item => ({ clientId: item.client_id, compensation: Number(item.compensation) }))
    })));
    setClients((clientResult.data || []).map(row => row.data as Client).filter(client => client.clientRole !== 'employee'));
    setTodos(byCollection('todos') as TodoTask[]);
    setBudgetAlarms(byCollection('budgetAlarms') as BudgetAlarm[]);
    setAgreements(byCollection('agreements') as Agreement[]);
    setPayments(byCollection('payments') as PaymentRecord[]);
    setDailyWorkLogs(byCollection('dailyWorkLogs') as DailyWorkLog[]);
    setBrandAudits(asMap<BrandAudit>('brandAudits'));
    setContentPlans(byCollection('contentPlans') as ContentPlanItem[]);
    setAdsPlans(byCollection('adsPlans') as AdsPlanItem[]);
    setClientAdsStrategies(asMap<ClientAdsStageStrategy>('clientAdsStrategies'));
    setClientDailyReports(byCollection('clientDailyReports') as ClientDailyReport[]);
    setWeeklyReports(byCollection('weeklyReports') as WeeklyReport[]);
    setMonthlyReports(byCollection('monthlyReports') as MonthlyReport[]);
    setQuarterlyReports(byCollection('quarterlyReports') as QuarterlyReport[]);
    setAdminDailyReports(byCollection('adminDailyReports') as AdminDailyReport[]);
    setNotes(byCollection('notes') as NoteItem[]);
    setCurrentUser(profileFromRow(profileResult.data));
    setAuthError('');
    setSyncError('');
    setReady(true);
  };

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data, error }) => {
      if (!active) return;
      if (error) throw error;
      if (data.session?.user) await loadAccount(data.session.user.id);
      else setReady(true);
    }).catch(err => {
      if (active) {
        setAuthError(err instanceof Error ? err.message : 'تعذر تحميل الحساب.');
        setReady(true);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        savedRecords.current.clear();
        setCurrentUser(null);
        setReady(true);
      }
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!ready || !currentUser) return;
    const writableCollections = currentUser.role === 'client'
      ? CLIENT_WRITABLE_COLLECTIONS
      : null;
    const next = new Map<string, string>();
    const add = (collection: string, recordId: string, clientId: string | null, data: unknown) => {
      if (writableCollections && !writableCollections.has(collection)) return;
      const row: StoredRecord = { collection, record_id: recordId, client_id: clientId, data };
      next.set(`${collection}:${recordId}`, JSON.stringify(row));
    };
    const addItems = (name: string, items: Array<{ id: string; clientId?: string }>) =>
      items.forEach(item => add(name, item.id, item.clientId || null, item));
    addItems('todos', todos);
    addItems('budgetAlarms', budgetAlarms);
    addItems('agreements', agreements);
    addItems('payments', payments);
    addItems('dailyWorkLogs', dailyWorkLogs);
    Object.entries(brandAudits).forEach(([id, value]) => add('brandAudits', id, id, value));
    addItems('contentPlans', contentPlans);
    addItems('adsPlans', adsPlans);
    Object.entries(clientAdsStrategies).forEach(([id, value]) => add('clientAdsStrategies', id, id, value));
    addItems('clientDailyReports', clientDailyReports);
    addItems('weeklyReports', weeklyReports);
    addItems('monthlyReports', monthlyReports);
    addItems('quarterlyReports', quarterlyReports);
    addItems('adminDailyReports', adminDailyReports);
    addItems('notes', notes);
    const allBefore = savedRecords.current;
    const before = writableCollections
      ? new Map([...allBefore].filter(([key]) => writableCollections.has(key.slice(0, key.indexOf(':')))))
      : allBefore;
    const upserts = [...next.entries()]
      .filter(([key, value]) => before.get(key) !== value)
      .map(([, value]) => JSON.parse(value) as StoredRecord);
    const deletes = [...before.keys()].filter(key => !next.has(key));
    const optimisticRecords = writableCollections ? new Map(allBefore) : new Map<string, string>();
    before.forEach((_, key) => optimisticRecords.delete(key));
    next.forEach((value, key) => optimisticRecords.set(key, value));
    savedRecords.current = optimisticRecords;
    if (!upserts.length && !deletes.length) return;
    writeQueue.current = writeQueue.current.catch(() => undefined).then(async () => {
      for (let i = 0; i < upserts.length; i += 200) {
        const result = await supabase.from('app_records')
          .upsert(upserts.slice(i, i + 200), { onConflict: 'collection,record_id' });
        if (result.error) throw result.error;
      }
      for (const key of deletes) {
        const divider = key.indexOf(':');
        const result = await supabase.from('app_records').delete()
          .eq('collection', key.slice(0, divider)).eq('record_id', key.slice(divider + 1));
        if (result.error) throw result.error;
      }
      setSyncError('');
    }).catch(err => {
      savedRecords.current = allBefore;
      setSyncError(err instanceof Error ? err.message : 'تعذر حفظ آخر التغييرات.');
    });
  }, [ready, currentUser, todos, budgetAlarms, agreements, payments, dailyWorkLogs,
      brandAudits, contentPlans, adsPlans, clientAdsStrategies, clientDailyReports,
      weeklyReports, monthlyReports, quarterlyReports, adminDailyReports, notes, retrySyncCount]);

  const login = async (email: string, password: string) => {
    setAuthError('');
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error || !result.data.user) throw new Error('البريد الإلكتروني أو كلمة السر غير صحيحة.');
    await loadAccount(result.data.user.id);
  };

  const registerAdmin = async (email: string, password: string, token: string) => {
    const result = await supabase.functions.invoke('bootstrap-admin', {
      body: { email, password, token }
    });
    if (result.error) {
      let serverError = '';
      let serverDetail = '';
      try {
        const response = result.error.context as Response | undefined;
        const payload = await response?.json() as { error?: string; detail?: string } | undefined;
        serverError = payload?.error || '';
        serverDetail = payload?.detail || '';
      } catch {
        // Network errors do not have a JSON response.
      }
      const messages: Record<string, string> = {
        'Invalid setup details': 'بيانات إنشاء الحساب غير مكتملة. اكتبي إيميلًا صحيحًا وكلمة سر من 8 أحرف على الأقل.',
        'Invalid or expired setup token': 'رابط إنشاء حساب الأدمن غير صالح أو انتهت صلاحيته.',
        'Admin account already exists': 'حساب الأدمن موجود بالفعل. جرّبي تسجيل الدخول.',
        'Could not create admin account': 'تعذر إنشاء الحساب في Supabase Auth. تحققي من الإيميل وكلمة السر.',
        'Could not create admin profile': 'تعذر حفظ صلاحية الأدمن في قاعدة البيانات.',
        'Could not complete activation': 'تم إنشاء الحساب، لكن تعذر إكمال التفعيل. جرّبي تسجيل الدخول.'
      };
      const message = messages[serverError] || `تعذر تفعيل حساب الأدمن: ${serverError || result.error.message}`;
      throw new Error(serverDetail ? `${message} (${serverDetail})` : message);
    }
    const setupUrl = new URL(window.location.href);
    setupUrl.hash = '';
    window.history.replaceState({}, '', setupUrl.pathname + setupUrl.search);
    await login(email, password);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setReady(true);
  };

  const addClient = async (newClientData: Omit<Client, 'id' | 'createdAt'> & { password?: string }) => {
    if (currentUser?.role !== 'admin') throw new Error('إضافة الحسابات متاحة للأدمن فقط.');
    if (!newClientData.password || newClientData.password.length < 8) {
      throw new Error('كلمة السر لازم تكون 8 حروف على الأقل.');
    }
    const result = await supabase.functions.invoke('manage-user', {
      body: { action: 'create', client: newClientData }
    });
    if (result.error || !result.data?.client || !result.data?.profile) {
      throw new Error('تعذر إنشاء الحساب. تأكدي من الإيميل وكلمة السر، أو جربي إيميلًا آخر.');
    }
    const created = result.data.client as Client;
    setClients(prev => [created, ...prev]);
    setUsers(prev => [...prev, profileFromRow(result.data.profile)]);
    return created;
  };

  const updateClient = async (id: string, fields: Partial<Client>) => {
    if (currentUser?.role !== 'admin') throw new Error('تعديل الحسابات متاح للأدمن فقط.');
    const result = await supabase.functions.invoke('manage-user', {
      body: { action: 'update', clientId: id, fields }
    });
    if (result.error || !result.data?.client) throw new Error('تعذر تحديث الحساب.');
    setClients(prev => prev.map(client => client.id === id ? result.data.client as Client : client));
    if (result.data.profile) {
      setUsers(prev => prev.map(user => user.clientId === id ? profileFromRow(result.data.profile) : user));
    }
    if (fields.brandName) {
      setBudgetAlarms(prev => prev.map(item =>
        item.clientId === id ? { ...item, brandName: fields.brandName! } : item
      ));
    }
  };

  const deleteClient = async (id: string) => {
    if (currentUser?.role !== 'admin') throw new Error('حذف الحسابات متاح للأدمن فقط.');
    const result = await supabase.functions.invoke('manage-user', {
      body: { action: 'delete', clientId: id }
    });
    if (result.error) throw new Error('تعذر حذف الحساب.');
    setClients(prev => prev.filter(client => client.id !== id));
    setUsers(prev => prev.filter(user => user.clientId !== id));
    setBudgetAlarms(prev => prev.filter(item => item.clientId !== id));
    setAgreements(prev => prev.filter(item => item.clientId !== id));
    setPayments(prev => prev.filter(item => item.clientId !== id));
    setDailyWorkLogs(prev => prev.filter(item => item.clientId !== id));
    setContentPlans(prev => prev.filter(item => item.clientId !== id));
    setAdsPlans(prev => prev.filter(item => item.clientId !== id));
    setClientDailyReports(prev => prev.filter(item => item.clientId !== id));
    setWeeklyReports(prev => prev.filter(item => item.clientId !== id));
    setMonthlyReports(prev => prev.filter(item => item.clientId !== id));
    setQuarterlyReports(prev => prev.filter(item => item.clientId !== id));
    setAdminDailyReports(prev => prev.filter(item => item.clientId !== id));
    setNotes(prev => prev.filter(item => item.clientId !== id));
    setBrandAudits(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
    setClientAdsStrategies(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
  };

  const addEmployee = async (employee: Omit<Employee, 'id'> & { password: string }) => {
    if (currentUser?.role !== 'admin') throw new Error('إضافة الموظفين متاحة للأدمن فقط.');
    const result = await supabase.functions.invoke('manage-user', {
      body: { action: 'create_employee', employee }
    });
    if (result.error) throw await employeeAccountError(result.error);
    if (!result.data?.employee) throw new Error('تعذر تأكيد حفظ حساب الموظف. حدّثي الصفحة قبل المحاولة مجددًا.');
    const created = employeeFromResponse(result.data.employee);
    setEmployees(prev => [created, ...prev]);
    return created;
  };

  const updateEmployee = async (id: string, employee: Omit<Employee, 'id'>) => {
    if (currentUser?.role !== 'admin') throw new Error('تعديل الموظفين متاح للأدمن فقط.');
    const result = await supabase.functions.invoke('manage-user', {
      body: { action: 'update_employee', employeeId: id, employee }
    });
    if (result.error) throw await employeeAccountError(result.error);
    if (!result.data?.employee) throw new Error('تعذر تأكيد تعديل الموظف.');
    const updated = employeeFromResponse(result.data.employee);
    setEmployees(prev => prev.map(item => item.id === id ? updated : item));
  };

  const deleteEmployee = async (id: string) => {
    if (currentUser?.role !== 'admin') throw new Error('حذف الموظفين متاح للأدمن فقط.');
    const result = await supabase.functions.invoke('manage-user', {
      body: { action: 'delete_employee', employeeId: id }
    });
    if (result.error) throw await employeeAccountError(result.error);
    setEmployees(prev => prev.filter(item => item.id !== id));
  };

  // Todo Methods
  const addTodo = (title: string, priority: 'high' | 'medium' | 'low', dueDate?: string) => {
    const newTask: TodoTask = {
      id: `todo-${crypto.randomUUID()}`,
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
      id: `rec-${crypto.randomUUID()}`,
      date: startDate,
      amount,
      expectedDays,
      startDate,
      endDate,
      notes: notes || 'الميزانية الأولية للحملة',
      type: 'initial'
    };

    const newAlarm: BudgetAlarm = {
      id: `budget-${crypto.randomUUID()}`,
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
        id: `rec-${crypto.randomUUID()}`,
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
      id: `agr-${crypto.randomUUID()}`,
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
      id: `pay-${crypto.randomUUID()}`
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
      id: `dwl-${crypto.randomUUID()}`,
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
    const newItem = { ...item, id: `cnt-${crypto.randomUUID()}` };
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
    const newItem = { ...item, id: `ads-${crypto.randomUUID()}` };
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
    const newRep = { ...rep, id: `cdr-${crypto.randomUUID()}` };
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
    const newRep = { ...rep, id: `wr-${crypto.randomUUID()}` };
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
    const newRep = { ...rep, id: `mr-${crypto.randomUUID()}` };
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
    const newRep = { ...rep, id: `qr-${crypto.randomUUID()}` };
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
    const newRep = { ...rep, id: `adr-${crypto.randomUUID()}` };
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
    const newNote = { ...note, id: `note-${crypto.randomUUID()}` };
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

  return {
    ready,
    authError,
    syncError,
    retrySync: () => setRetrySyncCount(value => value + 1),
    currentUser,
    users,
    employees,
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
    login,
    registerAdmin,
    logout,
    addClient,
    updateClient,
    deleteClient,
    addEmployee,
    updateEmployee,
    deleteEmployee,
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
  };
}
