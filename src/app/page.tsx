"use client";

import React, { useState } from "react";
import { VisaApplication, Employee } from "../types/visa";
import Sidebar from "../components/Sidebar";
import Dashboard from "../components/Dashboard";
import ApplicationForm from "../components/ApplicationForm";
import ApplicationsList from "../components/ApplicationsList";
import DanModal from "../components/modals/DanModal";
import QPayModal from "../components/modals/QPayModal";
import { AnimatePresence } from "framer-motion";

export default function Home() {
  const [userRole, setUserRole] = useState<'individual' | 'business_admin'>('individual');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'apply' | 'applications' | 'settings'>('dashboard');
  const [isDanModalOpen, setIsDanModalOpen] = useState<boolean>(false);
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
  const [isQPayModalOpen, setIsQPayModalOpen] = useState(false);
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
  const [qpayAmount, setQpayAmount] = useState<number>(0);
  const [qpayCountdown, setQpayCountdown] = useState<number>(300);

  React.useEffect(() => {
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

  const handleSaveAsDraft = () => {
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
  };

  const applicationsCount = userRole === 'business_admin' 
    ? applications.filter(a => a.applicantType === 'employee').length 
    : applications.filter(a => a.applicantType !== 'employee').length;

  return (
    <div className="min-h-screen bg-[#090a0f] text-[#f4f5f6] flex flex-col md:flex-row antialiased font-sans pb-16 md:pb-0">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        userRole={userRole}
        onRoleChange={handleRoleToggle}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        applicationsCount={applicationsCount}
        userName={user.name}
        userRegister={user.registerNo}
        companyName={company.name}
        companyRegistration={company.registrationNo}
      />

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col min-h-0 bg-[#090a0f] p-4 md:p-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: Dashboard */}
          {activeTab === 'dashboard' && (
            <Dashboard 
              userRole={userRole}
              userName={user.name}
              companyName={company.name}
              companyRegistration={company.registrationNo}
              companyIndustry={company.industry}
              userPhone={user.phone}
              employees={employees}
              applications={applications}
              bulkSelectIds={bulkSelectIds}
              onBulkSelectToggle={handleBulkCheckboxToggle}
              openBulkPaymentInvoice={openBulkPaymentInvoice}
              openQPayInvoice={openQPayInvoice}
              onStartEmployeeVisa={handleStartEmployeeVisa}
              onStartB2CVisa={handleStartB2CVisa}
              getStatusConfig={getStatusConfig}
            />
          )}

          {/* TAB 2: Visa Application Form */}
          {activeTab === 'apply' && (
            <ApplicationForm 
              userRole={userRole}
              employees={employees}
              newApp={newApp}
              setNewApp={setNewApp}
              onCountryChange={handleCountryChange}
              onApplicantTypeChange={handleApplicantTypeChange}
              onEmployeeSelection={handleEmployeeSelection}
              onPullKhurData={pullKhurData}
              onFileUpload={handleFileUpload}
              onNextToPricing={handleNextToPricing}
              onGenerateInvoice={handleGenerateInvoice}
              onSaveAsDraft={handleSaveAsDraft}
              khurLoading={khurLoading}
              smsNotifications={smsNotifications}
              setSmsNotifications={setSmsNotifications}
            />
          )}

          {/* TAB 3: Applications Tracker */}
          {activeTab === 'applications' && (
            <ApplicationsList 
              userRole={userRole}
              applications={applications}
              openQPayInvoice={openQPayInvoice}
              getStatusConfig={getStatusConfig}
            />
          )}

        </AnimatePresence>
      </main>

      {/* DAN SYSTEM MODAL SIMULATOR */}
      <DanModal 
        isOpen={isDanModalOpen}
        onClose={() => setIsDanModalOpen(false)}
        onSuccess={() => setUser(prev => ({ ...prev, isVerified: true }))}
      />

      {/* QPAY SIMULATION INVOICE MODAL */}
      <QPayModal 
        isOpen={isQPayModalOpen}
        onClose={() => {
          setIsQPayModalOpen(false);
          setActivePaymentId(null);
        }}
        invoiceId={activePaymentId || newApp.qpayInvoice}
        amount={qpayAmount}
        countdown={qpayCountdown}
        onPaymentSuccess={simulatePaymentSuccess}
      />

    </div>
  );
}
