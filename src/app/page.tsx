"use client";

import React, { useState, useEffect } from "react";
import { 
  Check, 
  X, 
  ChevronRight, 
  Globe, 
  CreditCard, 
  Lock, 
  Building,
  User, 
  FileText, 
  QrCode, 
  RefreshCw, 
  Plus, 
  Upload, 
  Database,
  HelpCircle,
  Clock,
  CheckCircle2,
  Users,
  Info,
  BellRing,
  CheckSquare,
  Square
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface VisaApplication {
  id: string;
  applicantType: 'myself' | 'family' | 'employee';
  applicantName: string;
  applicantRelation?: string;
  companyName?: string;
  country: string;
  countryCode: string;
  visaType: string;
  status: 'draft' | 'dan_verified' | 'khur_checked' | 'payment_pending' | 'submitted' | 'approved' | 'rejected';
  userRegister: string;
  khurSalary?: number;
  khurEmployer?: string;
  khurInsuranceMonths?: number;
  passportUrl?: string;
  embassyFee: number;
  serviceFee: number;
  createdAt: string;
  paymentStatus: 'unpaid' | 'paid';
}

interface Employee {
  id: string;
  name: string;
  registerNo: string;
  position: string;
  danVerified: boolean;
  activeVisaId?: string;
}

export default function Home() {
  const [userRole, setUserRole] = useState<'individual' | 'business_admin'>('individual');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'apply' | 'applications' | 'settings'>('dashboard');
  const [isDanModalOpen, setIsDanModalOpen] = useState<boolean>(false);
  const [danVerifying, setDanVerifying] = useState<boolean>(false);
  const [smsNotifications, setSmsNotifications] = useState<boolean>(true);
  
  // Consumer profile
  const [user, setUser] = useState({
    name: "Бат-Эрдэнэ Болд",
    registerNo: "УУ94021512",
    phone: "+976 9911-2233",
    isVerified: true
  });

  // Business Profile
  const company = {
    name: "Юнител Групп ХХК",
    registrationNo: "5091234",
    industry: "Мэдээлэл Технологи",
    employeesCount: 4
  };

  // Company Employees
  const employees: Employee[] = [
    { id: "EMP-101", name: "Т.Ананд", registerNo: "УУ98041211", position: "Ахлах Инженер", danVerified: true, activeVisaId: "VISA-2026-0892" },
    { id: "EMP-102", name: "Г.Марал", registerNo: "УУ99052042", position: "Дата Аналист", danVerified: true },
    { id: "EMP-103", name: "С.Билгүүн", registerNo: "УУ95110312", position: "Төслийн Менежер", danVerified: false },
    { id: "EMP-104", name: "О.Золбоо", registerNo: "УУ96081531", position: "Мэдээллийн ажилтан", danVerified: true }
  ];

  // Visa applications mock database (incorporates both B2C and B2B contexts)
  const [applications, setApplications] = useState<VisaApplication[]>([
    {
      id: "VISA-2026-0892",
      applicantType: "employee",
      applicantName: "Т.Ананд",
      companyName: "Юнител Групп ХХК",
      country: "Бүгд Найрамдах Солонгос Улс",
      countryCode: "KR",
      visaType: "Аялал жуулчлалын виз (C-3-9)",
      status: "payment_pending",
      userRegister: "УУ98041211",
      khurSalary: 3800000,
      khurEmployer: "Юнител Групп ХХК",
      khurInsuranceMonths: 36,
      embassyFee: 110000,
      serviceFee: 40000,
      createdAt: "2026-06-02",
      paymentStatus: "unpaid"
    },
    {
      id: "VISA-2026-0891",
      applicantType: "myself",
      applicantName: "Бат-Эрдэнэ Болд",
      country: "Бүгд Найрамдах Солонгос Улс",
      countryCode: "KR",
      visaType: "Аялал жуулчлалын виз (C-3-9)",
      status: "payment_pending",
      userRegister: "УУ94021512",
      khurSalary: 2850000,
      khurEmployer: "Юнител Групп ХХК",
      khurInsuranceMonths: 24,
      embassyFee: 110000,
      serviceFee: 40000,
      createdAt: "2026-06-01",
      paymentStatus: "unpaid"
    },
    {
      id: "VISA-2025-5421",
      applicantType: "family",
      applicantName: "Нэргүй Амин-Эрдэнэ",
      applicantRelation: "Охин",
      country: "Япон Улс",
      countryCode: "JP",
      visaType: "Богино хугацааны жуулчны виз",
      status: "approved",
      userRegister: "УУ18230492",
      khurSalary: 0,
      khurEmployer: "Сурагч",
      khurInsuranceMonths: 0,
      embassyFee: 50000,
      serviceFee: 30000,
      createdAt: "2025-11-15",
      paymentStatus: "paid"
    }
  ]);

  // Form State for new application
  const [newApp, setNewApp] = useState({
    applicantType: "myself" as 'myself' | 'family' | 'employee',
    applicantRelation: "Эхнэр/Нөхөр",
    applicantName: "Бат-Эрдэнэ Болд",
    selectedEmployeeId: "",
    country: "Бүгд Найрамдах Солонгос Улс",
    countryCode: "KR",
    visaType: "Аялал жуулчлалын виз (C-3-9)",
    registerNo: "УУ94021512",
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
  const [danAuthMethod, setDanAuthMethod] = useState<'qr' | 'otp'>('qr');
  const [danOtpSent, setDanOtpSent] = useState(false);
  const [danOtpCode, setDanOtpCode] = useState("");
  const [isQPayModalOpen, setIsQPayModalOpen] = useState(false);
  const [qpayPolling, setQpayPolling] = useState(false);
  const [qpayCountdown, setQpayCountdown] = useState(300);
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
  const [qpayAmount, setQpayAmount] = useState<number>(0);

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
        bg: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
        bar: 'bg-zinc-500',
      },
      dan_verified: {
        text: 'DAN баталгаажсан',
        bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        bar: 'bg-indigo-500',
      },
      khur_checked: {
        text: 'ХУР лавлагаатай',
        bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        bar: 'bg-sky-500',
      },
      payment_pending: {
        text: 'Төлбөр хүлээгдэж буй',
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        bar: 'bg-amber-500',
      },
      submitted: {
        text: 'ЭСЯ-нд илгээсэн',
        bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        bar: 'bg-blue-500',
      },
      approved: {
        text: 'Виз олгогдсон',
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        bar: 'bg-[#10b981]',
      },
      rejected: {
        text: 'Татгалзсан',
        bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        bar: 'bg-rose-500',
      },
    };
    return config[status] || config.draft;
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
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

  const startDanVerification = () => {
    setDanVerifying(true);
    setTimeout(() => {
      setDanVerifying(false);
      setUser(prev => ({ ...prev, isVerified: true }));
      setIsDanModalOpen(false);
      if (newApp.step === 2 && newApp.applicantType === 'myself') {
        pullKhurData();
      }
    }, 1200);
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
      alert("Гадаад паспорт болон цээж зургийг заавал оруулна уу.");
      return;
    }
    if (newApp.countryCode === 'KR' && !newApp.bankStatementFile) {
      alert("Солонгос улсын визэнд дансны хуулга шаардлагатай.");
      return;
    }
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

  const simulatePaymentSuccess = () => {
    setQpayPolling(true);
    setTimeout(() => {
      setQpayPolling(false);
      setIsQPayModalOpen(false);
      
      if (activePaymentId === 'bulk_invoice') {
        // Bulk payments paid
        setApplications(prev => prev.map(app => {
          if (bulkSelectIds.includes(app.id)) {
            return { ...app, status: 'submitted', paymentStatus: 'paid' };
          }
          return app;
        }));
        setBulkSelectIds([]);
      } else if (activePaymentId && activePaymentId !== 'new_app_invoice') {
        // Single existing application paid
        setApplications(prev => prev.map(app => {
          if (app.id === activePaymentId) {
            return { ...app, status: 'submitted', paymentStatus: 'paid' };
          }
          return app;
        }));
      } else {
        // Newly filled application paid
        const completedApp: VisaApplication = {
          id: `VISA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          applicantType: newApp.applicantType,
          applicantName: newApp.applicantName || user.name,
          applicantRelation: newApp.applicantType === 'family' ? newApp.applicantRelation : undefined,
          companyName: newApp.applicantType === 'employee' ? company.name : undefined,
          country: newApp.country,
          countryCode: newApp.countryCode,
          visaType: newApp.visaType,
          status: 'submitted',
          userRegister: newApp.registerNo,
          khurSalary: newApp.khurSalary || undefined,
          khurEmployer: newApp.khurEmployer || undefined,
          khurInsuranceMonths: newApp.khurInsuranceMonths || undefined,
          passportUrl: newApp.passportFile || undefined,
          embassyFee: newApp.embassyFee,
          serviceFee: newApp.serviceFee,
          createdAt: new Date().toISOString().split('T')[0],
          paymentStatus: 'paid'
        };
        setApplications(prev => [completedApp, ...prev]);
        setActiveTab('applications');
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
      }
      setActivePaymentId(null);
    }, 1200);
  };

  // Switch role and update form defaults accordingly
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



  return (
    <div className="min-h-screen bg-[#090a0f] text-[#f4f5f6] flex flex-col md:flex-row antialiased font-sans pb-16 md:pb-0">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-[#0e0f15] border-b md:border-b-0 md:border-r border-[#1e2030] flex flex-col justify-between shrink-0 h-auto md:h-screen sticky top-0 z-30">
        <div>
          {/* Brand Logo & Role Switcher */}
          <div className="p-6 border-b border-[#1e2030] space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#0066ff] p-1.5 rounded-lg">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-0.5">
                  MyVisa<span className="text-[#0066ff]">.mn</span>
                </h1>
                <p className="text-[9px] text-[#8f95b2] tracking-wider uppercase font-mono">Mongolian Portal</p>
              </div>
            </div>

            {/* B2C & B2B Switcher */}
            <div className="flex p-0.5 bg-[#090a0f] rounded-lg border border-[#1e2030]">
              <button 
                onClick={() => handleRoleToggle('individual')}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${userRole === 'individual' ? 'bg-[#181922] text-[#0066ff] border border-[#1e2030]' : 'text-[#8f95b2]'}`}
              >
                Иргэн 
              </button>
              <button 
                onClick={() => handleRoleToggle('business_admin')}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${userRole === 'business_admin' ? 'bg-[#181922] text-[#0066ff] border border-[#1e2030]' : 'text-[#8f95b2]'}`}
              >
                Бизнес 
              </button>
            </div>
          </div>

          {/* Desktop Navigation Items */}
          <nav className="hidden md:block p-4 space-y-1.5">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-[#181922] text-[#0066ff] border-l-2 border-[#0066ff]' : 'text-[#8f95b2] hover:text-white hover:bg-[#12131a]/50'}`}
            >
              <Database className="w-4 h-4" />
              {userRole === 'business_admin' ? 'Байгууллагын нүүр' : 'Миний нүүр'}
            </button>
            <button 
              onClick={() => setActiveTab('apply')} 
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'apply' ? 'bg-[#181922] text-[#0066ff] border-l-2 border-[#0066ff]' : 'text-[#8f95b2] hover:text-white hover:bg-[#12131a]/50'}`}
            >
              <span className="flex items-center gap-3">
                <Plus className="w-4 h-4" />
                {userRole === 'business_admin' ? 'Ажилтанд виз мэдүүлэх' : 'Виз мэдүүлэх'}
              </span>
            </button>
            <button 
              onClick={() => setActiveTab('applications')} 
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'applications' ? 'bg-[#181922] text-[#0066ff] border-l-2 border-[#0066ff]' : 'text-[#8f95b2] hover:text-white hover:bg-[#12131a]/50'}`}
            >
              <span className="flex items-center gap-3">
                {userRole === 'business_admin' ? <Users className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                {userRole === 'business_admin' ? 'Ажилчдын визүүд' : 'Миний визүүд'}
              </span>
              <span className="bg-[#1e2030] text-[#f4f5f6] text-[9.5px] px-2 py-0.5 rounded-full font-mono">
                {userRole === 'business_admin' 
                  ? applications.filter(a => a.applicantType === 'employee').length 
                  : applications.filter(a => a.applicantType !== 'employee').length}
              </span>
            </button>
          </nav>
        </div>

        {/* Desktop Profile Status */}
        <div className="hidden md:block p-4 border-t border-[#1e2030] space-y-4">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[#12131a] border border-[#1e2030]">
            <div className="w-9 h-9 rounded-lg bg-[#1a1c29] flex items-center justify-center border border-[#1e2030] shrink-0 text-slate-300">
              {userRole === 'business_admin' ? <Building className="w-4 h-4 text-[#0066ff]" /> : <User className="w-4 h-4" />}
            </div>
            <div className="overflow-hidden">
              <p className="text-[11.5px] font-bold text-white truncate flex items-center gap-1">
                {userRole === 'business_admin' ? company.name : user.name}
              </p>
              <p className="text-[9.5px] font-mono text-[#8f95b2] truncate">
                {userRole === 'business_admin' ? `Бүртгэл: ${company.registrationNo}` : user.registerNo}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM TAB NAVIGATION (Capacitor wrapped look) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0e0f15] border-t border-[#1e2030] z-40 flex justify-around items-center px-4">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`flex flex-col items-center gap-1 text-[9px] font-bold transition-all ${activeTab === 'dashboard' ? 'text-[#0066ff]' : 'text-[#8f95b2]'}`}
        >
          <Database className="w-5 h-5" />
          <span>Нүүр</span>
        </button>
        <button 
          onClick={() => setActiveTab('apply')} 
          className={`flex flex-col items-center gap-1 text-[9px] font-bold transition-all ${activeTab === 'apply' ? 'text-[#0066ff]' : 'text-[#8f95b2]'}`}
        >
          <Plus className="w-5 h-5" />
          <span>Мэдүүлэх</span>
        </button>
        <button 
          onClick={() => setActiveTab('applications')} 
          className={`flex flex-col items-center gap-1 text-[9px] font-bold transition-all ${activeTab === 'applications' ? 'text-[#0066ff]' : 'text-[#8f95b2]'}`}
        >
          <Users className="w-5 h-5" />
          <span>Визүүд</span>
        </button>
      </div>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col min-h-0 bg-[#090a0f] p-4 md:p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6 max-w-5xl"
            >
              {/* Header Headline (changes dynamically for B2B) */}
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {userRole === 'business_admin' ? `Байгууллагын хянах хэсэг: ${company.name}` : `Сайн байна уу, ${user.name.split(" ")[1]}?`}
                </h2>
                <p className="text-xs text-[#8f95b2]">
                  {userRole === 'business_admin' 
                    ? 'Ажилтны визний мэдүүлгийг хянах, нэгдсэн төлбөр тооцоо болон байгууллагын бүртгэл хөтлөх хэсэг.'
                    : 'Визийн материалаа гэрээсээ бэлдэж, ЭСЯ руу шууд илгээнэ үү.'}
                </p>
              </div>

              {/* B2B Dynamic Banner Info Alert */}
              {userRole === 'business_admin' && (
                <div className="p-4 rounded-xl border border-[#0066ff]/20 bg-[#0066ff]/5 flex gap-3 text-xs leading-relaxed text-slate-300">
                  <Info className="w-4.5 h-4.5 text-[#0066ff] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-white">Байгууллагын нэгдсэн нэхэмжлэх & цалин шалгалт</p>
                    <p className="text-[11px] text-[#8f95b2]">
                      Та ажилчдынхаа регистрийг оруулан ХУР системээр нийгмийн даатгалыг нь баталгаажуулж, бэлэн болсон визний төлбөрүүдийг нэгтгэн **QPay нэгдсэн нэхэмжлэхээр** байгууллагын данснаас settle хийх боломжтой.
                    </p>
                  </div>
                </div>
              )}

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {userRole === 'business_admin' ? (
                  <>
                    <div className="premium-card p-5 space-y-1">
                      <p className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider">Идэвхтэй Ажилчид</p>
                      <p className="text-sm font-bold text-white">{employees.length} ажилтан</p>
                      <p className="text-[10px] text-[#10b981] font-mono">3 нь DAN баталгаажуулсан</p>
                    </div>
                    <div className="premium-card p-5 space-y-1">
                      <p className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider">Нэгдсэн Виз шийдвэрлэлт</p>
                      <p className="text-sm font-bold text-white">
                        {applications.filter(a => a.applicantType === 'employee').length} мэдүүлэг
                      </p>
                      <p className="text-[10px] text-[#8f95b2]">Шалгагдаж буй: 1</p>
                    </div>
                    <div className="premium-card p-5 space-y-1">
                      <p className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider">Байгууллагын РД</p>
                      <p className="text-sm font-bold text-white">{company.registrationNo}</p>
                      <p className="text-[10px] text-[#0066ff] font-mono">Industry: {company.industry}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="premium-card p-5 space-y-1">
                      <p className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider">Биеийн Баталгаажуулалт</p>
                      <p className="text-sm font-bold text-white">DAN Холбогдсон</p>
                      <p className="text-[10px] text-[#10b981] font-mono">Нийгмийн даатгал идэвхтэй</p>
                    </div>
                    <div className="premium-card p-5 space-y-1">
                      <p className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider">Миний мэдүүлгүүд</p>
                      <p className="text-sm font-bold text-white">
                        Нийт {applications.filter(a => a.applicantType !== 'employee').length} мэдүүлэг
                      </p>
                      <p className="text-[10px] text-[#8f95b2]">Гэр бүлийн гишүүн: 1</p>
                    </div>
                    <div className="premium-card p-5 space-y-1">
                      <p className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider">Явцын мэдээлэл</p>
                      <p className="text-sm font-bold text-white">SMS суваг идэвхтэй</p>
                      <p className="text-[10px] text-[#0066ff] font-mono">{user.phone}</p>
                    </div>
                  </>
                )}
              </div>


              {/* B2B Sections vs B2C Selection */}
              {userRole === 'business_admin' ? (
                <div className="space-y-6">
                  {/* Employees Visa Applications Status Table */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#8f95b2] font-mono">Ажилчдын виз мэдүүлгийн түүх</h4>
                      
                      {/* Bulk pay button */}
                      {bulkSelectIds.length > 0 && (
                        <button 
                          onClick={openBulkPaymentInvoice}
                          className="px-3.5 py-1.5 rounded-lg bg-[#0066ff] text-white text-xs font-bold hover:bg-opacity-95 transition-all flex items-center gap-1.5 shadow"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          Сонгосон төлбөрийг хамт төлөх ({bulkSelectIds.length})
                        </button>
                      )}
                    </div>
                    
                    <div className="premium-card overflow-hidden">
                      <div className="overflow-x-auto text-[12px]">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#12131a] border-b border-[#1e2030] text-[10px] font-mono text-[#8f95b2] uppercase">
                              <th className="p-4 w-10">
                                <span className="sr-only">Сонгох</span>
                              </th>
                              <th className="p-4 font-semibold">Ажилтан</th>
                              <th className="p-4 font-semibold">Улс / Ангилал</th>
                              <th className="p-4 font-semibold">РД</th>
                              <th className="p-4 font-semibold">Төлбөр</th>
                              <th className="p-4 font-semibold">Явцын статус</th>
                              <th className="p-4 font-semibold text-right">Үйлдэл</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1e2030]">
                            {applications.filter(a => a.applicantType === 'employee').map((app) => (
                              <tr key={app.id} className="hover:bg-[#12131a]/50 transition-colors">
                                <td className="p-4">
                                  {app.paymentStatus === 'unpaid' ? (
                                    <button 
                                      onClick={() => handleBulkCheckboxToggle(app.id)}
                                      className="text-slate-400 hover:text-white"
                                    >
                                      {bulkSelectIds.includes(app.id) ? (
                                        <CheckSquare className="w-4 h-4 text-[#0066ff]" />
                                      ) : (
                                        <Square className="w-4 h-4" />
                                      )}
                                    </button>
                                  ) : (
                                    <Check className="w-4 h-4 text-[#10b981] mx-auto" />
                                  )}
                                </td>
                                <td className="p-4 font-bold text-white">{app.applicantName}</td>
                                <td className="p-4">
                                  <span className="font-semibold text-white">{app.country}</span>
                                  <p className="text-[10px] text-[#8f95b2]">{app.visaType}</p>
                                </td>
                                <td className="p-4 font-mono text-[#8f95b2]">{app.userRegister}</td>
                                <td className="p-4">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    app.paymentStatus === 'paid' ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-amber-500/10 text-amber-500'
                                  }`}>
                                    {app.paymentStatus === 'paid' ? 'Төлөгдсөн' : 'Нэхэмжлэх гарсан'}
                                  </span>
                                </td>
                                <td className="p-4">
                                  {(() => {
                                    const conf = getStatusConfig(app.status);
                                    return (
                                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold border ${conf.bg}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${conf.bar}`}></span>
                                        {conf.text}
                                      </span>
                                    );
                                  })()}
                                </td>
                                <td className="p-4 text-right">
                                  {app.paymentStatus === 'unpaid' && (
                                    <button 
                                      onClick={() => openQPayInvoice(app.id, app.embassyFee + app.serviceFee)}
                                      className="text-xs font-semibold text-white bg-[#0066ff] hover:bg-opacity-95 px-2.5 py-1 rounded transition-all"
                                    >
                                      Төлөх
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Company Staff list section */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#8f95b2] font-mono">Ажилчдын бүртгэл</h4>
                    <div className="premium-card overflow-hidden">
                      <div className="overflow-x-auto text-[12px]">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#12131a] border-b border-[#1e2030] text-[10px] font-mono text-[#8f95b2] uppercase">
                              <th className="p-4">ID</th>
                              <th className="p-4">Нэр</th>
                              <th className="p-4">РД</th>
                              <th className="p-4">Албан тушаал</th>
                              <th className="p-4">DAN систем</th>
                              <th className="p-4 text-right">Виз үүсгэх</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1e2030]">
                            {employees.map((emp) => (
                              <tr key={emp.id} className="hover:bg-[#12131a]/50">
                                <td className="p-4 font-mono text-[#8f95b2]">{emp.id}</td>
                                <td className="p-4 font-bold text-white">{emp.name}</td>
                                <td className="p-4 font-mono text-white">{emp.registerNo}</td>
                                <td className="p-4 text-[#8f95b2]">{emp.position}</td>
                                <td className="p-4">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    emp.danVerified ? 'bg-[#10b981]/15 text-[#10b981]' : 'bg-zinc-800 text-[#8f95b2]'
                                  }`}>
                                    {emp.danVerified ? 'Баталгаажсан' : 'Холболтгүй'}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <button 
                                    onClick={() => {
                                      handleApplicantTypeChange('employee');
                                      handleEmployeeSelection(emp.id);
                                      setActiveTab('apply');
                                    }}
                                    className="text-xs font-semibold text-[#0066ff] hover:text-white border border-[#0066ff]/20 hover:bg-[#0066ff] px-2.5 py-1 rounded transition-all"
                                  >
                                    Виз эхлүүлэх
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* B2C Available Visas list */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#8f95b2] font-mono">Боломжит виз мэдүүлгүүд</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { name: "Өмнөд Солонгос", code: "KR", eFee: 110000, sFee: 40000, desc: "C-3-9 аялал жуулчлалын ангилал. НД шимтгэл 6+ сар төлсөн байх шаардлагатай." },
                        { name: "Япон Улс", code: "JP", eFee: 50000, sFee: 30000, desc: "Богино хугацааны жуулчин. Хэвлэмэл бус QR-тай дансны хуулга шаардлагатай." },
                        { name: "Герман (Шенген)", code: "DE", eFee: 290000, sFee: 50000, desc: "Шенгений жуулчны виз. Биометрик хурууны хээгээ биеэр өгнө." }
                      ].map((visa) => (
                        <div 
                          key={visa.code}
                          className="premium-card p-5 flex flex-col justify-between h-64 hover:border-zinc-700 transition-all"
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-mono text-[10px] font-bold text-white bg-[#1e2030] px-2 py-0.5 rounded">{visa.code}</span>
                              <span className="text-[10px] text-[#10b981] font-bold">ХУР холбогдсон</span>
                            </div>
                            <h5 className="text-sm font-bold text-white">{visa.name}</h5>
                            <p className="text-[11px] text-[#8f95b2] leading-relaxed">{visa.desc}</p>
                          </div>

                          <div className="border-t border-[#1e2030] pt-4 mt-2 space-y-3">
                            <div className="flex justify-between text-[11px] font-mono text-[#8f95b2]">
                              <span>ЭСЯ хураамж:</span>
                              <span className="text-white">{visa.eFee.toLocaleString()} ₮</span>
                            </div>
                            <div className="flex justify-between text-[11px] font-mono text-[#8f95b2]">
                              <span>Үйлчилгээ:</span>
                              <span className="text-white">{visa.sFee.toLocaleString()} ₮</span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                              <span className="text-xs font-bold font-mono text-white">{(visa.eFee + visa.sFee).toLocaleString()} ₮</span>
                              <button 
                                onClick={() => {
                                  handleCountryChange(visa.name, visa.code, visa.eFee, visa.sFee);
                                  setActiveTab('apply');
                                }}
                                className="text-xs font-bold text-white bg-[#0066ff] hover:bg-opacity-95 px-3 py-1.5 rounded transition-all"
                              >
                                Мэдүүлэх
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* B2C Visa Tracking History */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#8f95b2] font-mono">Миний виз мэдүүлгийн түүх</h4>
                    <div className="space-y-3">
                      {applications.filter(a => a.applicantType !== 'employee').map((app) => (
                        <div key={app.id} className="premium-card p-5 space-y-4">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div>
                              <h5 className="text-sm font-bold text-white flex items-center gap-2">
                                {app.country}
                                <span className="text-[10px] font-normal text-[#8f95b2]">({app.applicantType === 'myself' ? 'Өөрийн мэдүүлэг' : `${app.applicantRelation}: ${app.applicantName}`})</span>
                              </h5>
                              <p className="text-[11px] text-[#8f95b2] mt-0.5">{app.visaType} • ID: {app.id}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              {(() => {
                                const conf = getStatusConfig(app.status);
                                return (
                                  <span className={`px-2.5 py-0.5 rounded text-[10.5px] font-bold border ${conf.bg}`}>
                                    {conf.text}
                                  </span>
                                );
                              })()}
                              {app.status === 'payment_pending' && (
                                <button 
                                  onClick={() => openQPayInvoice(app.id, app.embassyFee + app.serviceFee)}
                                  className="px-3 py-1 rounded bg-[#0066ff] hover:bg-opacity-95 text-white text-[11px] font-bold transition-all shadow"
                                >
                                  Төлөх
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#1e2030]">
                            {[
                              { label: "Бүртгэл", active: true },
                              { label: "Төрийн лавлагаа", active: app.status !== 'draft' },
                              { label: "Төлбөр төлөлт", active: app.paymentStatus === 'paid' },
                              { label: "ЭСЯ хяналт", active: app.status === 'approved', pulse: app.status === 'submitted' }
                            ].map((s, i) => (
                              <div key={i} className="space-y-1">
                                <div className={`h-1 rounded ${s.pulse ? 'bg-[#0066ff] animate-pulse' : s.active ? 'bg-[#10b981]' : 'bg-[#1e2030]'}`}></div>
                                <span className="text-[10px] font-bold text-white block">{s.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: STEP-BY-STEP APPLICATION (Handles employee and direct user flow) */}
          {activeTab === 'apply' && (
            <motion.div 
              key="apply"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6 max-w-3xl"
            >
              {/* Stepper timeline */}
              <div className="premium-card p-5">
                <div className="flex justify-between items-center max-w-xl mx-auto">
                  {[
                    { step: 1, label: "Улс сонгох" },
                    { step: 2, label: "Лавлагаа (KHUR)" },
                    { step: 3, label: "Материал" },
                    { step: 4, label: "Хяналт" },
                    { step: 5, label: "Төлбөр" }
                  ].map((s) => (
                    <div key={s.step} className="flex flex-col items-center flex-1 relative">
                      <div className={`w-7 h-7 rounded-full border text-[11px] font-bold font-mono flex items-center justify-center transition-all z-10 ${
                        newApp.step === s.step 
                          ? 'bg-[#0066ff] border-[#0066ff] text-white shadow-md' 
                          : newApp.step > s.step 
                            ? 'bg-[#10b981] border-[#10b981] text-white' 
                            : 'bg-[#0e0f15] border-[#1e2030] text-[#8f95b2]'
                      }`}>
                        {newApp.step > s.step ? <Check className="w-3.5 h-3.5" /> : s.step}
                      </div>
                      <span className={`text-[10px] mt-2 font-bold tracking-tight ${newApp.step === s.step ? 'text-white' : 'text-[#8f95b2]'}`}>
                        {s.label}
                      </span>
                      {s.step < 5 && (
                        <div className={`absolute top-3.5 left-[60%] right-[-40%] h-[1px] ${
                          newApp.step > s.step ? 'bg-[#10b981]' : 'bg-[#1e2030]'
                        }`}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Body */}
              <div className="premium-card p-6 md:p-8">
                
                {/* STEP 1: Country select */}
                {newApp.step === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-white">Виз мэдүүлэх улсаа сонгоно уу</h3>
                      <p className="text-xs text-[#8f95b2]">Визийн шаардлага болон хураамж улс бүрээр өөр өөр байна.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { name: "Бүгд Найрамдах Солонгос Улс", code: "KR", eFee: 110000, sFee: 40000 },
                        { name: "Япон Улс", code: "JP", eFee: 50000, sFee: 30000 },
                        { name: "Герман (Шенген)", code: "DE", eFee: 290000, sFee: 50000 }
                      ].map((country) => (
                        <div 
                          key={country.code}
                          onClick={() => handleCountryChange(country.name, country.code, country.eFee, country.sFee)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${
                            newApp.countryCode === country.code 
                              ? 'bg-[#12131a] border-[#0066ff]' 
                              : 'bg-[#0e0f15] border-[#1e2030] hover:border-zinc-700'
                          }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-white">{country.name}</p>
                            <p className="text-[10px] text-[#8f95b2] mt-0.5">Нийт дүн: {(country.eFee + country.sFee).toLocaleString()} ₮</p>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            newApp.countryCode === country.code ? 'border-[#0066ff] bg-[#0066ff] text-white' : 'border-zinc-700'
                          }`}>
                            {newApp.countryCode === country.code && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-[#1e2030]">
                      <button 
                        onClick={() => setNewApp(prev => ({ ...prev, step: 2 }))}
                        className="px-5 py-2.5 rounded-lg bg-[#0066ff] hover:bg-opacity-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow"
                      >
                        Үргэлжлүүлэх <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Citizen/Employee data pulling */}
                {newApp.step === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-white">Мэдүүлэгчийн мэдээлэл болон Лавлагаа шалгах</h3>
                      <p className="text-xs text-[#8f95b2]">ЭСЯ руу илгээх хүний хувийн РД болон төрийн ХУР лавлагаа мэдээллийг холбоно уу.</p>
                    </div>

                    {/* Show toggle options depending on role */}
                    {userRole === 'business_admin' ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-[#0e0f15] border border-[#1e2030] space-y-3">
                          <span className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider block">Виз мэдүүлэх ажилтан сонгох</span>
                          <div className="flex flex-wrap gap-2">
                            {employees.map(emp => (
                              <button
                                key={emp.id}
                                onClick={() => handleEmployeeSelection(emp.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                  newApp.selectedEmployeeId === emp.id 
                                    ? 'bg-[#0066ff]/10 border-[#0066ff] text-white' 
                                    : 'bg-[#090a0f] border-[#1e2030] text-[#8f95b2] hover:text-white'
                                }`}
                              >
                                {emp.name} ({emp.position})
                              </button>
                            ))}
                          </div>
                        </div>

                        {newApp.selectedEmployeeId && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-[#0e0f15] border border-[#1e2030]">
                              <span className="text-[10px] text-[#8f95b2] font-mono">Ажилтны бүтэн нэр:</span>
                              <p className="text-xs font-bold text-white mt-1">{newApp.applicantName}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-[#0e0f15] border border-[#1e2030]">
                              <span className="text-[10px] text-[#8f95b2] font-mono">Регистрийн дугаар:</span>
                              <p className="text-xs font-mono font-bold text-white mt-1">{newApp.registerNo}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Selector B2C Tabs */}
                        <div className="flex gap-4 p-1 bg-[#090a0f] rounded-lg border border-[#1e2030]">
                          <button 
                            onClick={() => handleApplicantTypeChange('myself')}
                            className={`flex-1 py-2 text-xs font-semibold rounded transition-all ${newApp.applicantType === 'myself' ? 'bg-[#181922] text-[#0066ff]' : 'text-[#8f95b2]'}`}
                          >
                            Миний бие өөрөө
                          </button>
                          <button 
                            onClick={() => handleApplicantTypeChange('family')}
                            className={`flex-1 py-2 text-xs font-semibold rounded transition-all ${newApp.applicantType === 'family' ? 'bg-[#181922] text-[#0066ff]' : 'text-[#8f95b2]'}`}
                          >
                            Гэр бүлийн гишүүн
                          </button>
                        </div>

                        {newApp.applicantType === 'family' && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-[#0e0f15] border border-[#1e2030] space-y-1">
                              <span className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider">Хамаарал</span>
                              <select 
                                value={newApp.applicantRelation}
                                onChange={(e) => setNewApp(prev => ({ ...prev, applicantRelation: e.target.value }))}
                                className="w-full bg-[#090a0f] border border-[#1e2030] rounded p-1.5 text-xs text-white focus:outline-none"
                              >
                                <option>Эхнэр/Нөхөр</option>
                                <option>Охин</option>
                                <option>Хүү</option>
                                <option>Аав</option>
                                <option>Ээж</option>
                              </select>
                            </div>
                            <div className="p-4 rounded-xl bg-[#0e0f15] border border-[#1e2030] space-y-1">
                              <span className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider">Англи бүтэн нэр</span>
                              <input 
                                type="text" 
                                placeholder="Nergui Amin-Erdene"
                                value={newApp.applicantName} 
                                onChange={(e) => setNewApp(prev => ({ ...prev, applicantName: e.target.value }))}
                                className="w-full bg-[#090a0f] border border-[#1e2030] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none"
                              />
                            </div>
                            <div className="p-4 rounded-xl bg-[#0e0f15] border border-[#1e2030] space-y-1">
                              <span className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider">Регистрийн дугаар</span>
                              <input 
                                type="text" 
                                placeholder="УУ18230492"
                                value={newApp.registerNo} 
                                onChange={(e) => setNewApp(prev => ({ ...prev, registerNo: e.target.value.toUpperCase() }))}
                                maxLength={10}
                                className="w-full bg-[#090a0f] border border-[#1e2030] rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* KHUR Verification trigger */}
                    <div className="space-y-4 pt-4 border-t border-[#1e2030]">
                      <span className="text-xs font-bold text-white block">Төрийн мэдээлэл баталгаажуулалт (KHUR)</span>
                      
                      {((userRole === 'business_admin' && newApp.selectedEmployeeId) || (userRole === 'individual' && newApp.applicantType === 'myself')) && (
                        <>
                          {khurLoading ? (
                            <div className="p-6 bg-[#0e0f15] rounded-xl border border-[#1e2030] flex flex-col items-center justify-center gap-3 text-center">
                              <RefreshCw className="w-6 h-6 text-[#0066ff] animate-spin" />
                              <p className="text-[10px] font-mono text-[#8f95b2]">API Query: 150.129.143.18 / E-Mongolia secure link</p>
                            </div>
                          ) : newApp.khurChecked ? (
                            <div className="p-4 bg-[#10b981]/5 border border-[#10b981]/25 rounded-xl space-y-3">
                              <p className="text-xs text-white font-bold flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-[#10b981]" /> Нийгмийн Даатгалын шимтгэл төлөлт баталгаажлаа.
                              </p>
                              <div className="grid grid-cols-2 gap-4 text-[10.5px] font-mono text-[#8f95b2] pt-2">
                                <div>Ажил олгогч: <span className="text-white font-bold">{newApp.khurEmployer}</span></div>
                                <div>Сүүлийн цалин: <span className="text-white font-bold">{newApp.khurSalary.toLocaleString()} ₮</span></div>
                              </div>
                            </div>
                          ) : (
                            <button 
                              onClick={pullKhurData}
                              className="w-full py-2.5 rounded-lg bg-[#0066ff] hover:bg-opacity-95 text-xs font-bold text-white transition-all shadow"
                            >
                              ХУР системээс ажил олгогч, даатгалын лавлагааг татах
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    <div className="flex justify-between pt-4 border-t border-[#1e2030]">
                      <button 
                        onClick={() => setNewApp(prev => ({ ...prev, step: 1 }))}
                        className="px-4 py-2 rounded-lg border border-[#1e2030] hover:bg-[#12131a] text-xs font-semibold text-[#8f95b2]"
                      >
                        Өмнөх
                      </button>
                      <button 
                        onClick={() => setNewApp(prev => ({ ...prev, step: 3 }))}
                        disabled={((userRole === 'business_admin' && !newApp.selectedEmployeeId) || (userRole === 'individual' && newApp.applicantType === 'myself' && !newApp.khurChecked))}
                        className="px-5 py-2.5 rounded-lg bg-[#0066ff] hover:bg-opacity-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        Үргэлжлүүлэх <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Material uploads with helpful B2C tips */}
                {newApp.step === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-white">Баримт бичгүүдийг хуулах</h3>
                      <p className="text-xs text-[#8f95b2]">ЭСЯ-ны шаардлагын дагуу дараах баримтуудыг зөв хуулна уу.</p>
                    </div>

                    {/* Consumer-friendly B2C hints */}
                    <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-[11px] leading-relaxed text-[#8f95b2] space-y-1">
                      <p className="font-bold text-white flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                        Зөв файл хуулах зөвлөмж:
                      </p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Гадаад паспортыг гэрэл гялбахгүй, дөрвөн өнцөг нь бүтэн харагдахаар уншуулна уу.</li>
                        <li>Цээж зураг заавал цагаан дэвсгэртэй, чих ил гарсан, эгц харсан байна.</li>
                        <li>Дансны хуулгыг банкны аппликейшнээс шууд татсан, баруун дээд буландаа QR баталгаажуулалттай PDF файлаар оруулна.</li>
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      {[
                        { key: 'passport', title: "Гадаад паспорт", file: newApp.passportFile },
                        { key: 'photo', title: "Цээж зураг (3х4)", file: newApp.photoFile },
                        { key: 'statement', title: "Дансны хуулга (Сүүлийн 6 сар)", file: newApp.bankStatementFile }
                      ].map((item) => (
                        <div 
                          key={item.key} 
                          className="p-5 rounded-xl border border-[#1e2030] bg-[#0e0f15]/50 flex flex-col justify-between h-48"
                        >
                          <div>
                            <h4 className="text-xs font-bold text-white">{item.title}</h4>
                            {item.key === 'statement' && newApp.countryCode !== 'KR' ? (
                              <p className="text-[10px] text-[#8f95b2] mt-1 font-semibold text-amber-500">Сонголттой (Заавал биш)</p>
                            ) : (
                              <p className="text-[10px] text-[#8f95b2] mt-1">Шаардлагатай баримт</p>
                            )}
                          </div>

                          {item.file ? (
                            <div className="p-2 rounded bg-[#10b981]/5 border border-[#10b981]/25 flex items-center justify-between text-[9.5px] font-mono text-[#10b981] overflow-hidden">
                              <span className="truncate max-w-[130px]">{item.file}</span>
                              <Lock className="w-3 h-3 shrink-0 ml-1" />
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleFileUpload(item.key as 'passport' | 'statement' | 'photo')}
                              className="py-2.5 rounded-lg border border-dashed border-[#1e2030] hover:border-zinc-600 text-xs font-bold text-[#8f95b2] hover:text-white flex items-center justify-center gap-1.5 transition-all bg-[#090a0f]/50"
                            >
                              <Upload className="w-3.5 h-3.5" /> Файл хуулах
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between pt-4 border-t border-[#1e2030]">
                      <button 
                        onClick={() => setNewApp(prev => ({ ...prev, step: 2 }))}
                        className="px-4 py-2 rounded-lg border border-[#1e2030] hover:bg-[#12131a] text-xs font-semibold text-[#8f95b2]"
                      >
                        Өмнөх
                      </button>
                      <button 
                        onClick={handleNextToPricing}
                        className="px-5 py-2.5 rounded-lg bg-[#0066ff] hover:bg-opacity-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                      >
                        Дараах <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: Checkout billing invoice breakdown */}
                {newApp.step === 4 && (
                  <div className="space-y-6 max-w-lg mx-auto py-2">
                    <div className="space-y-1 text-center">
                      <h3 className="text-base font-bold text-white">Мэдүүлгийг хянах</h3>
                      <p className="text-xs text-[#8f95b2]">ЭСЯ руу илгээхээс өмнө өөрийн мэдүүлгийн дүн болон мэдээллээ хянана уу.</p>
                    </div>

                    <div className="premium-card p-5 space-y-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#8f95b2]">Мэдүүлэгч:</span>
                        <span className="font-semibold text-white">
                          {newApp.applicantName} 
                          {newApp.applicantType === 'family' && ` (${newApp.applicantRelation})`}
                          {newApp.applicantType === 'employee' && ` (Ажилтан)`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#8f95b2]">Улс / Виз:</span>
                        <span className="font-semibold text-white">{newApp.country} ({newApp.visaType})</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#8f95b2]">Регистрийн дугаар:</span>
                        <span className="font-mono text-white">{newApp.registerNo}</span>
                      </div>

                      <div className="h-px bg-[#1e2030]"></div>

                      <div className="space-y-2 text-xs font-mono text-[#8f95b2]">
                        <div className="flex justify-between">
                          <span>ЭСЯ визний хураамж:</span>
                          <span className="text-white">{newApp.embassyFee.toLocaleString()} ₮</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Үйлчилгээний хөлс:</span>
                          <span className="text-white">{newApp.serviceFee.toLocaleString()} ₮</span>
                        </div>
                      </div>

                      <div className="h-px bg-[#1e2030]"></div>

                      <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-[#8f95b2]">Нийт төлөх дүн:</span>
                        <span className="font-mono text-[#0066ff]">{(newApp.embassyFee + newApp.serviceFee).toLocaleString()} ₮</span>
                      </div>
                    </div>

                    {userRole === 'business_admin' ? (
                      <div className="p-3 bg-[#0e0f15] rounded-lg border border-[#1e2030] text-[11px] leading-relaxed text-[#8f95b2] flex gap-2">
                        <Info className="w-4 h-4 text-[#0066ff] shrink-0" />
                        <p>Байгууллагын хувиар та энэхүү нэхэмжлэхийг одоо шууд төлөх эсвэл түр хадгалж байгаад бусад ажилчдын мэдүүлэгтэй хамт **Нэгдсэн Төлбөр** хэлбэрээр төлөх боломжтой.</p>
                      </div>
                    ) : (
                      <div className="p-3 bg-[#0e0f15] rounded-lg border border-[#1e2030] flex items-center justify-between">
                        <span className="text-[11px] text-slate-300 flex items-center gap-1.5">
                          <BellRing className="w-4 h-4 text-[#0066ff]" />
                          Явцын мэдээллийг SMS-ээр үнэгүй авах уу?
                        </span>
                        <input 
                          type="checkbox" 
                          checked={smsNotifications}
                          onChange={(e) => setSmsNotifications(e.target.checked)}
                          className="w-4 h-4 accent-[#0066ff]"
                        />
                      </div>
                    )}

                    <div className="flex justify-between pt-4 border-t border-[#1e2030] gap-3">
                      <button 
                        onClick={() => setNewApp(prev => ({ ...prev, step: 3 }))}
                        className="px-4 py-2 rounded-lg border border-[#1e2030] hover:bg-[#12131a] text-xs font-semibold text-[#8f95b2]"
                      >
                        Өмнөх
                      </button>
                      
                      {userRole === 'business_admin' && (
                        <button 
                          onClick={() => {
                            // Save as draft in applications database
                            const draftApp: VisaApplication = {
                              id: `VISA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                              applicantType: 'employee',
                              applicantName: newApp.applicantName,
                              companyName: company.name,
                              country: newApp.country,
                              countryCode: newApp.countryCode,
                              visaType: newApp.visaType,
                              status: 'payment_pending',
                              userRegister: newApp.registerNo,
                              khurSalary: newApp.khurSalary || undefined,
                              khurEmployer: newApp.khurEmployer || undefined,
                              khurInsuranceMonths: newApp.khurInsuranceMonths || undefined,
                              passportUrl: newApp.passportFile || undefined,
                              embassyFee: newApp.embassyFee,
                              serviceFee: newApp.serviceFee,
                              createdAt: new Date().toISOString().split('T')[0],
                              paymentStatus: 'unpaid'
                            };
                            setApplications(prev => [draftApp, ...prev]);
                            setActiveTab('dashboard');
                          }}
                          className="px-4 py-2.5 rounded-lg border border-zinc-700 hover:bg-[#12131a] text-xs font-bold text-[#8f95b2]"
                        >
                          Түр хадгалах (Нэгтгэж төлөх)
                        </button>
                      )}

                      <button 
                        onClick={handleGenerateInvoice}
                        className="px-5 py-2.5 rounded-lg bg-[#0066ff] hover:bg-opacity-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow"
                      >
                        Төлбөр төлөх <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}

          {/* TAB 3: LIST OF ACTIVE APPLICATIONS */}
          {activeTab === 'applications' && (
            <motion.div 
              key="applications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6 max-w-4xl"
            >
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  {userRole === 'business_admin' ? 'Ажилчдын виз мэдүүлгүүд' : 'Миний виз мэдүүлгүүд'}
                </h3>
                <p className="text-xs text-[#8f95b2]">
                  {userRole === 'business_admin' 
                    ? 'Байгууллагын ажилчдын нэр дээр гаргасан нийт визний явцыг хянах.'
                    : 'ЭСЯ-нд илгээсэн болон төлбөр төлөх шаардлагатай мэдүүлгүүд.'}
                </p>
              </div>

              {applications
                .filter(a => userRole === 'business_admin' ? a.applicantType === 'employee' : a.applicantType !== 'employee')
                .map((app) => (
                  <div key={app.id} className="premium-card p-5 space-y-4 relative overflow-hidden">
                    
                    <div className={`absolute top-0 bottom-0 left-0 w-1 ${getStatusConfig(app.status).bar}`}></div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#181922] flex items-center justify-center font-bold text-xs text-white border border-[#1e2030] shrink-0">
                          {app.countryCode}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            {app.country}
                            <span className="text-[9px] font-mono text-[#8f95b2] bg-[#1e2030] px-1.5 py-0.5 rounded border border-[#1e2030]">ID: {app.id}</span>
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-[#8f95b2] mt-0.5">
                            <span>{app.visaType}</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                            <span className="font-semibold text-slate-300">
                              {app.applicantType === 'myself' ? 'Мэдүүлэгч: Өөрөө' : `${app.applicantRelation || 'Ажилтан'}: ${app.applicantName}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end gap-2 shrink-0">
                        <span className="text-xs font-mono text-slate-300">Нийт: {(app.embassyFee + app.serviceFee).toLocaleString()} ₮</span>
                        <div className="flex items-center gap-2 mt-1">
                          {(() => {
                            const conf = getStatusConfig(app.status);
                            return (
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border ${conf.bg}`}>
                                {conf.text}
                              </span>
                            );
                          })()}
                          {app.status === 'payment_pending' && (
                            <button 
                              onClick={() => openQPayInvoice(app.id, app.embassyFee + app.serviceFee)}
                              className="px-3 py-1 rounded bg-[#0066ff] hover:bg-opacity-95 text-white text-[11px] font-bold transition-all shadow"
                            >
                              Төлөх
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-3 border-t border-[#1e2030]">
                      {[
                        { title: "DAN Бүртгэл", active: true },
                        { title: "KHUR Лавлагаа", active: app.status !== 'draft' },
                        { title: "Төлбөр төлөлт", active: app.paymentStatus === 'paid' },
                        { title: "ЭСЯ хяналт", active: app.status === 'approved', pulse: app.status === 'submitted' }
                      ].map((step, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className={`h-1 rounded transition-all ${
                            step.pulse 
                              ? 'bg-[#0066ff] animate-pulse' 
                              : step.active 
                                ? 'bg-[#10b981]' 
                                : 'bg-[#1e2030]'
                          }`}></div>
                          <p className={`text-[10px] font-bold ${step.active || step.pulse ? 'text-slate-200' : 'text-[#8f95b2]'}`}>{step.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
              ))}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* DAN SYSTEM MODAL SIMULATOR */}
      <AnimatePresence>
        {isDanModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-[#0e0f15] border border-[#1e2030] rounded-xl w-full max-w-sm p-6 overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setIsDanModalOpen(false)}
                className="absolute top-4 right-4 text-[#8f95b2] hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center pb-4 border-b border-[#1e2030] space-y-2">
                <span className="inline-block bg-[#0f4c81]/15 text-[#0f4c81] border border-[#0f4c81]/30 text-[9.5px] font-mono px-3 py-1 rounded-full uppercase tracking-wider font-bold">
                  DAN • Таних систем
                </span>
                <h4 className="text-sm font-bold text-white">Төрийн Цахим Нэвтрэлт</h4>
              </div>

              <div className="flex gap-2 p-1 bg-[#090a0f] rounded-lg border border-[#1e2030] my-4">
                <button 
                  onClick={() => setDanAuthMethod('qr')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded transition-all ${danAuthMethod === 'qr' ? 'bg-[#0066ff] text-white' : 'text-[#8f95b2]'}`}
                >
                  DAN QR Уншуулах
                </button>
                <button 
                  onClick={() => setDanAuthMethod('otp')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded transition-all ${danAuthMethod === 'otp' ? 'bg-[#0066ff] text-white' : 'text-[#8f95b2]'}`}
                >
                  OTP код авах
                </button>
              </div>

              <div className="py-2 text-center">
                {danAuthMethod === 'qr' ? (
                  <div className="space-y-4">
                    <div className="w-36 h-36 bg-white p-2.5 rounded-lg mx-auto flex items-center justify-center border border-zinc-700 relative group cursor-pointer">
                      <QrCode className="w-full h-full text-slate-900" />
                      <div className="absolute inset-0 bg-[#0066ff]/95 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded p-2 text-center">
                        <span className="text-[10px] font-bold font-sans">E-Mongolia апп-аар уншуулна уу</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#8f95b2]">E-Mongolia апп-аар QR кодыг уншуулж нэвтрэлтийг зөвшөөрнө үү.</p>
                  </div>
                ) : (
                  <div className="space-y-3 text-left">
                    <div className="space-y-1">
                      <label className="text-[9.5px] text-[#8f95b2] font-mono uppercase tracking-wider">Регистрийн дугаар</label>
                      <input 
                        type="text" 
                        value={user.registerNo} 
                        readOnly 
                        className="w-full bg-[#090a0f] border border-[#1e2030] rounded px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none" 
                      />
                    </div>
                    {danOtpSent ? (
                      <div className="space-y-2">
                        <label className="text-[9.5px] text-[#8f95b2] font-mono uppercase tracking-wider">OTP код (6 оронтой)</label>
                        <input 
                          type="text" 
                          placeholder="••••••" 
                          value={danOtpCode}
                          onChange={(e) => setDanOtpCode(e.target.value)}
                          maxLength={6}
                          className="w-full bg-[#090a0f] border border-[#0066ff]/60 rounded px-3 py-2 text-center text-sm font-mono font-bold text-white focus:outline-none" 
                        />
                        <p className="text-[9.5px] text-[#10b981] font-mono text-center">Таны +976 9911-2233 дугаарт илгээгдлээ.</p>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setDanOtpSent(true)}
                        className="w-full py-2 rounded bg-[#1e2030] hover:bg-zinc-800 text-xs font-semibold text-white border border-[#1e2030] transition-all"
                      >
                        Баталгаажуулах код авах
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#1e2030] flex gap-3 mt-4">
                <button 
                  onClick={() => setIsDanModalOpen(false)}
                  className="flex-1 py-2 rounded bg-[#12131a] hover:bg-opacity-80 text-[#8f95b2] text-xs font-bold transition-all border border-[#1e2030]"
                >
                  Буцах
                </button>
                <button 
                  onClick={startDanVerification}
                  disabled={danVerifying || (danAuthMethod === 'otp' && !danOtpSent)}
                  className="flex-1 py-2 rounded bg-[#0066ff] hover:bg-opacity-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow disabled:opacity-50"
                >
                  {danVerifying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Холбож байна...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Баталгаажуулах
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QPAY SIMULATION INVOICE MODAL */}
      <AnimatePresence>
        {isQPayModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-[#0e0f15] border border-[#1e2030] rounded-xl w-full max-w-sm p-6 overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => {
                  setIsQPayModalOpen(false);
                  setActivePaymentId(null);
                }}
                className="absolute top-4 right-4 text-[#8f95b2] hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center pb-4 border-b border-[#1e2030] space-y-1">
                <span className="text-[10px] font-bold text-red-500 font-mono tracking-widest uppercase">qpay • төлбөр</span>
                <h4 className="text-sm font-bold text-white">
                  {activePaymentId === 'bulk_invoice' ? 'Байгууллагын нэгдсэн нэхэмжлэх' : 'Төлбөрийн нэхэмжлэх'}
                </h4>
              </div>

              <div className="py-6 flex flex-col items-center justify-center space-y-4">
                <div className="w-36 h-36 bg-white p-3 rounded-lg mx-auto flex items-center justify-center border border-zinc-700 relative">
                  <QrCode className="w-full h-full text-slate-900" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-red-600 flex items-center justify-center font-extrabold text-[11px] text-white">
                    q
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <p className="text-base font-mono font-bold text-white">
                    {qpayAmount.toLocaleString()} ₮
                  </p>
                  <p className="text-[10px] text-[#8f95b2] font-mono font-semibold">Invoice: {activePaymentId || newApp.qpayInvoice}</p>
                  <p className="text-[10.5px] text-amber-500 font-mono flex items-center justify-center gap-1.5 mt-1 font-bold">
                    <Clock className="w-3.5 h-3.5" /> {formatTime(qpayCountdown)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] text-[#8f95b2] uppercase font-mono tracking-wider">Банкны апп-аар төлөх (холбоос):</span>
                <div className="grid grid-cols-5 gap-1.5 pb-4">
                  {[
                    { name: "Хаан", bg: "bg-green-850 text-white" },
                    { name: "ТӨХБ", bg: "bg-blue-800 text-white" },
                    { name: "ХХБ", bg: "bg-blue-950 text-white" },
                    { name: "Хас", bg: "bg-red-950 text-white" },
                    { name: "Голомт", bg: "bg-sky-950 text-white" }
                  ].map((bank) => (
                    <button 
                      key={bank.name} 
                      onClick={simulatePaymentSuccess}
                      className={`py-1 rounded text-[10px] font-bold text-center ${bank.bg} hover:opacity-90 active:scale-95 transition-all truncate border border-transparent`}
                    >
                      {bank.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#1e2030] flex gap-3">
                <button 
                  onClick={() => {
                    setIsQPayModalOpen(false);
                    setActivePaymentId(null);
                  }}
                  className="flex-1 py-2 rounded bg-[#12131a] hover:bg-opacity-80 text-[#8f95b2] text-xs font-bold transition-all border border-[#1e2030]"
                >
                  Буцах
                </button>
                <button 
                  onClick={simulatePaymentSuccess}
                  disabled={qpayPolling}
                  className="flex-1 py-2 rounded bg-[#10b981] hover:bg-opacity-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow disabled:opacity-50"
                >
                  {qpayPolling ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Шалгаж байна...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Төлөлт шалгах
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
