"use client";

import { useState, useEffect } from "react";
import { VisaApplication, Employee } from "../types/visa";
import { useToast } from "../components/ui/Toast";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";
import type { AppTab } from "../components/Sidebar";

export function useVisaApp() {
  const { toast } = useToast();

  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState<boolean>(true);
  const [profile, setProfile] = useState<{ id: string; role: 'individual' | 'business_admin' | 'business_employee' | 'visa_issuer'; company_id: string | null; name: string } | null>(null);

  const [userRole, setUserRole] = useState<'individual' | 'business_admin' | 'visa_issuer'>('individual');
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [formError, setFormError] = useState<string | null>(null);
  const [isDanModalOpen, setIsDanModalOpen] = useState<boolean>(false);
  const [smsNotifications, setSmsNotifications] = useState<boolean>(true);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  // Consumer profile
  const [user, setUser] = useState({
    name: "Бат-Эрдэнэ Болд",
    registerNo: "УУ94021512",
    phone: "+976 9911-2233",
    isVerified: false
  });

  // Business Profile
  const [company, setCompany] = useState({
    name: "Юнител Групп ХХК",
    registrationNo: "5091234",
    industry: "Мэдээлэл Технологи",
    employeesCount: 0
  });

  // Company Employees
  const [employees, setEmployees] = useState<Employee[]>([
    { id: "EMP-101", name: "Т.Ананд", registerNo: "УУ98041211", position: "Ахлах Инженер", danVerified: true, activeVisaId: "VISA-2026-0892" },
    { id: "EMP-102", name: "Г.Марал", registerNo: "УУ99052042", position: "Дата Аналист", danVerified: true },
    { id: "EMP-103", name: "С.Билгүүн", registerNo: "УУ95110312", position: "Төслийн Менежер", danVerified: false },
    { id: "EMP-104", name: "О.Золбоо", registerNo: "УУ96081531", position: "Мэдээллийн ажилтан", danVerified: true }
  ]);

  // Visa applications database
  const [applications, setApplications] = useState<VisaApplication[]>([]);

  // Form State for new application
  const [newApp, setNewApp] = useState({
    applicantType: "myself" as 'myself' | 'family' | 'employee',
    applicantRelation: "Эхнэр/Нөхөр",
    applicantName: "",
    selectedEmployeeId: "",
    country: "Бүгд Найрамдах Солонгос Улс",
    countryCode: "KR",
    visaType: "Аялал жуулчлалын виз (C-3-9)",
    registerNo: "",
    step: 1, 
    khurSalary: 0,
    khurEmployer: "",
    khurInsuranceMonths: 0,
    khurChecked: false,
    passportFile: null as string | null,
    bankStatementFile: null as string | null,
    photoFile: null as string | null,
    embassyFee: 110000,
    serviceFee: 40000,
    qpayInvoice: "",
    paymentStatus: "unpaid" as 'unpaid' | 'paid'
  });

  // Bulk Payment States for B2B
  const [bulkSelectIds, setBulkSelectIds] = useState<string[]>([]);

  // Local integration simulators
  const [khurLoading, setKhurLoading] = useState(false);
  const [isQPayModalOpen, setIsQPayModalOpen] = useState(false);
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
  const [qpayAmount, setQpayAmount] = useState<number>(0);
  const [qpayCountdown, setQpayCountdown] = useState<number>(300);

  // SMS Simulation states
  const [sendingSmsId, setSendingSmsId] = useState<string | null>(null);
  const [smsSentEmployees, setSmsSentEmployees] = useState<string[]>([]);

  const loadUserData = async (userId: string) => {
    setLoadingSession(true);
    try {
      // 1. Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !profileData) {
        console.error("Error loading profile:", profileError);
        setLoadingSession(false);
        return;
      }

      setProfile(profileData);
      setUserRole(profileData.role);
      if (profileData.role === 'visa_issuer') {
        setActiveTab('chat');
      }
      setUser({
        name: profileData.name,
        registerNo: profileData.register_no || "",
        phone: profileData.phone || "",
        isVerified: profileData.is_verified || false
      });

      // 2. If Corporate Admin, fetch company info
      if (profileData.role === 'business_admin' && profileData.company_id) {
        const { data: compData, error: compError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', profileData.company_id)
          .single();

        if (!compError && compData) {
          setCompany({
            name: compData.company_name,
            registrationNo: compData.registration_no,
            industry: compData.industry || "Бусад",
            employeesCount: 0
          });
        }
      }

      // 3. Load applications
      await loadApplications(profileData);

    } catch (err) {
      console.error("Error loading user initial data:", err);
    } finally {
      setLoadingSession(false);
    }
  };

  const loadApplications = async (userProfile: { id: string; role: string; company_id: string | null }) => {
    try {
      let query = supabase.from('visa_applications').select('*');

      if (userProfile.role === 'business_admin' && userProfile.company_id) {
        query = query.eq('company_id', userProfile.company_id);
      } else {
        query = query.eq('created_by', userProfile.id);
      }

      const { data: appsData, error } = await query.order('created_at', { ascending: false });

      if (!error && appsData) {
        const formattedApps: VisaApplication[] = appsData.map(app => {
          const eFee = app.country_code === 'KR' ? 110000 : app.country_code === 'JP' ? 50000 : 290000;
          const sFee = app.country_code === 'KR' ? 40000 : app.country_code === 'JP' ? 30000 : 50000;
          return {
            id: app.id,
            applicantType: app.user_id ? 'myself' : app.applicant_relation === 'Employee' ? 'employee' : 'family',
            applicantRelation: app.applicant_relation === 'Self' ? 'Эхнэр/Нөхөр' : app.applicant_relation,
            applicantName: app.applicant_name,
            country: app.country,
            countryCode: app.country_code,
            visaType: app.country_code === 'KR' ? 'Аялал жуулчлалын виз (C-3-9)' : app.country_code === 'JP' ? 'Богино хугацааны виз' : 'Шенгений виз',
            userRegister: app.register_no || "",
            status: app.status as VisaApplication['status'],
            khurSalary: app.khur_salary || undefined,
            khurEmployer: app.khur_employer || undefined,
            khurInsuranceMonths: app.khur_insurance_months || undefined,
            khurChecked: !!app.khur_salary,
            passportFile: app.passport_file || "PASSPORT_SIGNED.enc",
            photoFile: app.photo_file || "PHOTO.enc",
            embassyFee: eFee,
            serviceFee: sFee,
            createdAt: app.created_at,
            paymentStatus: app.status === 'draft' || app.status === 'payment_pending' ? 'unpaid' : 'paid'
          };
        });
        setApplications(formattedApps);
      }
    } catch (err) {
      console.error("Error loading apps:", err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadUserData(session.user.id);
      } else {
        setProfile(null);
        setLoadingSession(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadUserData(session.user.id);
      } else {
        setProfile(null);
        setLoadingSession(false);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isQPayModalOpen && qpayCountdown > 0) {
      timer = setTimeout(() => setQpayCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [isQPayModalOpen, qpayCountdown]);

  const getStatusConfig = (status: VisaApplication['status']) => {
    const config = {
      draft: {
        text: 'Ноорог',
        bg: 'bg-faded/10 text-muted border-line',
        bar: 'bg-faded',
      },
      dan_verified: {
        text: 'DAN баталгаажсан',
        bg: 'bg-accent/10 text-accent border-accent/20',
        bar: 'bg-accent',
      },
      khur_checked: {
        text: 'ХУР лавлагаатай',
        bg: 'bg-accent/10 text-accent border-accent/20',
        bar: 'bg-accent',
      },
      payment_pending: {
        text: 'Төлбөр хүлээгдэж буй',
        bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        bar: 'bg-amber-500',
      },
      submitted: {
        text: 'ЭСЯ-нд илгээсэн',
        bg: 'bg-accent/10 text-accent border-accent/20',
        bar: 'bg-accent',
      },
      approved: {
        text: 'Виз олгогдсон',
        bg: 'bg-positive/10 text-positive border-positive/20',
        bar: 'bg-positive',
      },
      rejected: {
        text: 'Татгалзсан',
        bg: 'bg-negative/10 text-negative border-negative/20',
        bar: 'bg-negative',
      },
    };
    return config[status] || config.draft;
  };

  const handleCountryChange = (countryName: string, code: string, eFee: number, sFee: number) => {
    setNewApp(prev => ({
      ...prev,
      country: countryName,
      countryCode: code,
      visaType: countryName === "Бүгд Найрамдах Солонгос Улс" 
        ? "Аялал жуулчлалын виз (C-3-9)" 
        : countryName === "Япон Улс" 
          ? "Богино хугацааны жуулчны виз" 
          : "Шенгений жуулчны виз (Төрөл C)",
      embassyFee: eFee,
      serviceFee: sFee
    }));
  };

  const handleApplicantTypeChange = (type: 'myself' | 'family' | 'employee') => {
    let name = "";
    let regNo = "";
    if (type === 'myself') {
      name = user.name;
      regNo = user.registerNo;
    }

    setNewApp(prev => ({
      ...prev,
      applicantType: type,
      applicantName: name,
      registerNo: regNo,
      khurChecked: type === 'myself' ? prev.khurChecked : false,
      khurSalary: type === 'myself' ? prev.khurSalary : 0,
      khurEmployer: type === 'myself' ? prev.khurEmployer : "",
      khurInsuranceMonths: type === 'myself' ? prev.khurInsuranceMonths : 0
    }));
  };

  const handleEmployeeSelection = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      setNewApp(prev => ({
        ...prev,
        selectedEmployeeId: empId,
        applicantName: emp.name,
        registerNo: emp.registerNo,
        khurChecked: false
      }));
    }
  };

  const pullKhurData = () => {
    setKhurLoading(true);
    setTimeout(() => {
      setKhurLoading(false);
      setNewApp(prev => ({
        ...prev,
        khurSalary: prev.applicantType === 'myself' ? 2850000 : prev.applicantType === 'employee' ? 3800000 : 0,
        khurEmployer: prev.applicantType === 'myself' || prev.applicantType === 'employee' ? "Юнител Групп ХХК" : "Бусад",
        khurInsuranceMonths: prev.applicantType === 'myself' ? 24 : prev.applicantType === 'employee' ? 36 : 0,
        khurChecked: true
      }));
    }, 1800);
  };

  const handleFileUpload = (type: 'passport' | 'statement' | 'photo') => {
    const fileName = type === 'passport' 
      ? `PASSPORT_${newApp.registerNo || "GUEST"}_SECURED.enc` 
      : type === 'statement' 
        ? `BANK_STATEMENT_${newApp.registerNo || "GUEST"}_SIGNED.enc` 
        : `PHOTO_3X4_${newApp.registerNo || "GUEST"}.enc`;
    setNewApp(prev => ({
      ...prev,
      [`${type}File`]: fileName
    }));
  };

  const handleNextToPricing = () => {
    if (!newApp.passportFile || !newApp.photoFile) {
      const msg = "Гадаад паспорт болон цээж зургийг заавал оруулна уу.";
      setFormError(msg);
      toast(msg, "error");
      return;
    }
    if (newApp.countryCode === 'KR' && !newApp.bankStatementFile) {
      const msg = "Солонгос улсын визэнд дансны хуулга шаардлагатай.";
      setFormError(msg);
      toast(msg, "error");
      return;
    }
    setFormError(null);
    setNewApp(prev => ({ ...prev, step: 4 }));
  };

  const openQPayInvoice = (appId: string, amount: number) => {
    setActivePaymentId(appId);
    setQpayAmount(amount);
    setQpayCountdown(300);
    setIsQPayModalOpen(true);
  };

  const handleGenerateInvoice = () => {
    const mockInvoice = `QPAY-INV-${Math.floor(100000 + Math.random() * 900000)}`;
    setNewApp(prev => ({
      ...prev,
      qpayInvoice: mockInvoice,
      step: 5
    }));
    openQPayInvoice('new_app_invoice', newApp.embassyFee + newApp.serviceFee);
  };

  const openBulkPaymentInvoice = () => {
    const totalAmount = applications
      .filter(app => bulkSelectIds.includes(app.id))
      .reduce((sum, app) => sum + app.embassyFee + app.serviceFee, 0);
    
    openQPayInvoice('bulk_invoice', totalAmount);
  };

  const handleBulkCheckboxToggle = (appId: string) => {
    setBulkSelectIds(prev => 
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  };

  const simulatePaymentSuccess = async () => {
    if (!profile) return;

    try {
      if (activePaymentId === 'bulk_invoice') {
        const unpaidApps = applications.filter(app => bulkSelectIds.includes(app.id));
        
        for (const app of unpaidApps) {
          await supabase
            .from('visa_applications')
            .update({ status: 'submitted' })
            .eq('id', app.id);
          
          await supabase
            .from('payments')
            .insert({
              application_id: app.id,
              company_id: profile.company_id || null,
              amount: app.embassyFee + app.serviceFee,
              qpay_invoice: `QPAY-INV-${Math.floor(100000 + Math.random() * 900000)}`,
              status: 'paid'
            });
        }
        
        setBulkSelectIds([]);
      } else if (activePaymentId && activePaymentId !== 'new_app_invoice') {
        const app = applications.find(a => a.id === activePaymentId);
        if (app) {
          await supabase
            .from('visa_applications')
            .update({ status: 'submitted' })
            .eq('id', activePaymentId);

          await supabase
            .from('payments')
            .insert({
              application_id: activePaymentId,
              company_id: profile.company_id || null,
              amount: app.embassyFee + app.serviceFee,
              qpay_invoice: `QPAY-INV-${Math.floor(100000 + Math.random() * 900000)}`,
              status: 'paid'
            });
        }
      } else {
        const applicantRel = newApp.applicantType === 'myself' ? 'Self' : newApp.applicantType === 'employee' ? 'Employee' : newApp.applicantRelation;

        const { data: newDbApp, error: appError } = await supabase
          .from('visa_applications')
          .insert({
            user_id: newApp.applicantType === 'myself' ? profile.id : null,
            created_by: profile.id,
            company_id: newApp.applicantType === 'employee' ? profile.company_id : null,
            applicant_name: newApp.applicantName,
            applicant_relation: applicantRel,
            country: newApp.country,
            country_code: newApp.countryCode,
            status: 'submitted',
            khur_salary: newApp.khurSalary || null,
            khur_employer: newApp.khurEmployer || null,
            khur_insurance_months: newApp.khurInsuranceMonths || null,
          })
          .select('*')
          .single();

        if (appError) throw appError;

        await supabase
          .from('payments')
          .insert({
            application_id: newDbApp.id,
            company_id: newApp.applicantType === 'employee' ? profile.company_id : null,
            amount: newApp.embassyFee + newApp.serviceFee,
            qpay_invoice: newApp.qpayInvoice || `QPAY-INV-${Math.floor(100000 + Math.random() * 900000)}`,
            status: 'paid'
          });
      }

      await loadApplications(profile);
      setActiveTab('applications');
      toast("Төлбөр амжилттай баталгаажлаа", "success");
      
      setNewApp({
        applicantType: userRole === 'business_admin' ? 'employee' : 'myself',
        applicantRelation: "Эхнэр/Нөхөр",
        applicantName: userRole === 'business_admin' ? "" : user.name,
        selectedEmployeeId: "",
        country: "Бүгд Найрамдах Солонгос Улс",
        countryCode: "KR",
        visaType: "Аялал жуулчлалын виз (C-3-9)",
        registerNo: userRole === 'business_admin' ? "" : user.registerNo,
        step: 1,
        khurSalary: 0,
        khurEmployer: "",
        khurInsuranceMonths: 0,
        khurChecked: false,
        passportFile: null,
        bankStatementFile: null,
        photoFile: null,
        embassyFee: 110000,
        serviceFee: 40000,
        qpayInvoice: "",
        paymentStatus: "unpaid"
      });

    } catch (e: unknown) {
      const error = e as Error;
      toast(`Төлбөр баталгаажуулахад алдаа: ${error.message}`, "error");
    } finally {
      setActivePaymentId(null);
      setIsQPayModalOpen(false);
    }
  };

  const handleDanSuccess = async () => {
    if (!profile) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', profile.id);

      if (error) throw error;
      
      setUser(prev => ({ ...prev, isVerified: true }));
      toast("DAN баталгаажуулалт амжилттай", "success");
    } catch (e: unknown) {
      console.error("Error saving DAN verification:", e);
      toast("DAN хадгалахад алдаа гарлаа", "error");
    }
  };

  const handleRoleToggle = (role: 'individual' | 'business_admin') => {
    setUserRole(role);
    setActiveTab('dashboard');
    setNewApp(prev => ({
      ...prev,
      applicantType: role === 'business_admin' ? 'employee' : 'myself',
      applicantName: role === 'business_admin' ? "" : user.name,
      registerNo: role === 'business_admin' ? "" : user.registerNo,
      step: 1,
      khurChecked: false
    }));
  };

  const handleStartEmployeeVisa = (empId: string) => {
    handleRoleToggle('business_admin');
    handleEmployeeSelection(empId);
    setActiveTab('apply');
  };

  const handleStartB2CVisa = (countryName: string, countryCode: string, eFee: number, sFee: number) => {
    handleRoleToggle('individual');
    handleCountryChange(countryName, countryCode, eFee, sFee);
    setActiveTab('apply');
  };

  const handleSaveAsDraft = async () => {
    if (!profile) return;
    
    try {
      const applicantRel = newApp.applicantType === 'myself' ? 'Self' : newApp.applicantType === 'employee' ? 'Employee' : newApp.applicantRelation;

      const { error } = await supabase
        .from('visa_applications')
        .insert({
          user_id: newApp.applicantType === 'myself' ? profile.id : null,
          created_by: profile.id,
          company_id: newApp.applicantType === 'employee' ? profile.company_id : null,
          applicant_name: newApp.applicantName,
          applicant_relation: applicantRel,
          country: newApp.country,
          country_code: newApp.countryCode,
          status: 'draft',
          khur_salary: newApp.khurSalary || null,
          khur_employer: newApp.khurEmployer || null,
          khur_insurance_months: newApp.khurInsuranceMonths || null,
        })
        .select('*')
        .single();

      if (error) throw error;

      await loadApplications(profile);
      setActiveTab('dashboard');
      toast("Ноорог амжилттай хадгалагдлаа", "success");
    } catch (e: unknown) {
      const error = e as Error;
      toast(`Ноорог хадгалахад алдаа: ${error.message}`, "error");
    }
  };

  const handleSendEmployeeSms = (empId: string) => {
    setSendingSmsId(empId);
    setTimeout(() => {
      setSendingSmsId(null);
      setSmsSentEmployees(prev => [...prev, empId]);
      
      setTimeout(() => {
        setEmployees(prev => prev.map(e => e.id === empId ? { ...e, danVerified: true } : e));
      }, 3000);
    }, 1200);
  };

  return {
    session,
    loadingSession,
    profile,
    userRole,
    activeTab,
    setActiveTab,
    formError,
    setFormError,
    isDanModalOpen,
    setIsDanModalOpen,
    smsNotifications,
    setSmsNotifications,
    theme,
    toggleTheme,
    user,
    company,
    employees,
    applications,
    newApp,
    setNewApp,
    bulkSelectIds,
    khurLoading,
    isQPayModalOpen,
    setIsQPayModalOpen,
    activePaymentId,
    setActivePaymentId,
    qpayAmount,
    qpayCountdown,
    sendingSmsId,
    smsSentEmployees,
    handleSignOut,
    getStatusConfig,
    handleCountryChange,
    handleApplicantTypeChange,
    handleEmployeeSelection,
    pullKhurData,
    handleFileUpload,
    handleNextToPricing,
    openQPayInvoice,
    handleGenerateInvoice,
    openBulkPaymentInvoice,
    handleBulkCheckboxToggle,
    simulatePaymentSuccess,
    handleSaveAsDraft,
    handleDanSuccess,
    handleRoleToggle,
    handleStartEmployeeVisa,
    handleStartB2CVisa,
    handleSendEmployeeSms,
  };
}
