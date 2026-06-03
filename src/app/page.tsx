"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Check, 
  X, 
  ChevronRight, 
  Globe, 
  Shield, 
  CreditCard, 
  Lock, 
  Building, 
  Briefcase, 
  User, 
  FileText, 
  QrCode, 
  RefreshCw, 
  Search, 
  Plus, 
  ArrowRight, 
  Upload, 
  Database,
  ExternalLink,
  Settings,
  HelpCircle,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Smartphone,
  Info,
  ChevronDown,
  BellRing,
  Send,
  Phone,
  Video,
  PhoneOff,
  Mic,
  MicOff,
  VideoOff,
  Camera,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Copy,
  Image as ImageIcon
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
  passportUrl?: string;
  embassyFee: number;
  serviceFee: number;
  createdAt: string;
  paymentStatus: 'unpaid' | 'paid';
  qpayInvoice?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  attachment?: {
    type: 'passport' | 'document';
    name: string;
    url: string;
  };
}

export default function Home() {
  // Navigation & Authentication states
  const [authState, setAuthState] = useState<'login' | 'register' | 'authenticated'>('login');
  const [authRole, setAuthRole] = useState<'individual' | 'business_admin'>('individual');
  const [userRole, setUserRole] = useState<'individual' | 'business_admin'>('individual');
  
  // Dashboard states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'apply' | 'applications' | 'chat'>('dashboard');
  const [danConnected, setDanConnected] = useState<boolean>(true);
  const [isDanModalOpen, setIsDanModalOpen] = useState<boolean>(false);
  const [danVerifying, setDanVerifying] = useState<boolean>(false);
  const [smsNotifications, setSmsNotifications] = useState<boolean>(true);
  const [danAuthMethod, setDanAuthMethod] = useState<'qr' | 'otp'>('qr');
  const [danOtpSent, setDanOtpSent] = useState<boolean>(false);
  const [danOtpCode, setDanOtpCode] = useState<string>("");

  // Users profile mock database
  const [profile, setProfile] = useState({
    name: "Бат-Эрдэнэ Болд",
    registerNo: "УУ94021512",
    phone: "+976 9911-2233",
    email: "bold@example.com",
    companyName: "Юнител Групп ХХК",
    companyReg: "5091234"
  });

  // Visa applications mock database
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
      embassyFee: 110000,
      serviceFee: 40000,
      createdAt: "2026-06-02",
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

  // Camera & Media states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Call simulation states
  const [callState, setCallState] = useState<'idle' | 'ringing' | 'connected' | 'ended'>('idle');
  const [callType, setCallType] = useState<'voice' | 'video'>('voice');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Chat message database
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: "1", sender: "agent", text: "Сайн байна уу? Таны виз мэдүүлгийн зөвлөх 'Хатантуул' байна. Танд юугаар туслах вэ?", timestamp: "14:30" }
  ]);

  // QPay checkout simulation states
  const [isQPayModalOpen, setIsQPayModalOpen] = useState(false);
  const [qpayCountdown, setQpayCountdown] = useState(300);
  const [activePaymentId, setActivePaymentId] = useState<string | null>(null);
  const [qpayPolling, setQpayPolling] = useState<boolean>(false);

  // 1. QPay invoice timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isQPayModalOpen && qpayCountdown > 0) {
      timer = setTimeout(() => setQpayCountdown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [isQPayModalOpen, qpayCountdown]);

  // 2. Chat auto-responder simulation (to make it feel interactive/live)
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");

    // Simulate Agent typing response
    setTimeout(() => {
      let replyText = "Ойлголоо. Таны илгээсэн хүсэлтийг манай консулын баг шалгаж байна.";
      if (chatInput.toLowerCase().includes("паспорт") || chatInput.toLowerCase().includes("passport")) {
        replyText = "Материал хүлээж авлаа. Паспорт илгээх бол камерын товчлуур дээр дарж зургаа уншуулна уу.";
      } else if (chatInput.toLowerCase().includes("байна") || chatInput.toLowerCase().includes("хурдан")) {
        replyText = "Шууд холбогдож асуух бол дээр байгаа Дуу болон Дүрс дуудлагын товчлуурыг ашиглан манай зөвлөхтэй залгаарай.";
      }
      
      const agentMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, agentMsg]);
    }, 1500);
  };

  // State for government data loading
  const [khurLoading, setKhurLoading] = useState(false);

  // Helper functions for visa processing
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGenerateInvoice = () => {
    const invoiceId = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
    setNewApp(prev => ({
      ...prev,
      qpayInvoice: invoiceId,
      step: 5
    }));
    openQPayInvoice(invoiceId, newApp.embassyFee + newApp.serviceFee);
  };

  const simulatePaymentSuccess = () => {
    setQpayPolling(true);
    setTimeout(() => {
      setQpayPolling(false);
      setIsQPayModalOpen(false);
      
      if (activePaymentId) {
        setApplications(prev => 
          prev.map(app => app.id === activePaymentId || app.qpayInvoice === activePaymentId 
            ? { ...app, paymentStatus: 'paid', status: 'submitted' } 
            : app
          )
        );
      }
      
      setNewApp(prev => ({
        ...prev,
        paymentStatus: 'paid',
        step: 5
      }));

      alert("Төлбөр амжилттай баталгаажлаа!");
      setActivePaymentId(null);
    }, 1500);
  };

  const startDanVerification = () => {
    setDanVerifying(true);
    setTimeout(() => {
      setDanVerifying(false);
      setDanConnected(true);
      setIsDanModalOpen(false);
      setAuthState('authenticated');
      setDanOtpSent(false);
      setDanOtpCode("");
    }, 1500);
  };

  // 3. Web Camera Capture (Real getUserMedia implementation)
  const openPassportCamera = async () => {
    setIsCameraOpen(true);
    setCapturedPhoto(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Webcam access failed, using simulator fallback:", err);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedPhoto(dataUrl);
        
        // Stop stream
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null);
        }
      }
    } else {
      // Fallback Simulator snapshot
      setCapturedPhoto("/passport_captured_mock.jpg");
    }
  };

  const submitPassportPhoto = () => {
    setIsOcrProcessing(true);
    // Simulate OCR Scanning of MRZ Zone on Passport
    setTimeout(() => {
      setIsOcrProcessing(false);
      setIsCameraOpen(false);
      
      // Update form files state
      setNewApp(prev => ({
        ...prev,
        passportFile: `PASSPORT_${profile.registerNo}_CAPTURED.enc`
      }));

      // Send to business/chat as attachment
      const passportMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'user',
        text: "Шинээр зураг авсан Гадаад Паспорт илгээв.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        attachment: {
          type: 'passport',
          name: `PASSPORT_${newApp.registerNo || profile.registerNo}.enc`,
          url: capturedPhoto || ""
        }
      };
      setChatMessages(prev => [...prev, passportMsg]);
      
      // Agent response
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: 'agent',
          text: "Гадаад паспортыг амжилттай хүлээн авлаа. Мэдээллийг хянаж байна.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 1000);

      // Auto route to steps if user is in form
      if (newApp.step === 3) {
        alert("Паспорт амжилттай уншигдаж шифрлэгдэн хадгалагдлаа!");
      }
    }, 2000);
  };

  const closePassportCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  // 4. Voice and Video Call Systems
  const startCall = async (type: 'voice' | 'video') => {
    setCallType(type);
    setCallState('ringing');
    
    // Play mock ringing sound / delay connection
    setTimeout(async () => {
      setCallState('connected');
      if (type === 'video') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setLocalStream(stream);
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.warn("Could not access local webcam for video call:", err);
        }
      }
    }, 2500);
  };

  const endCall = () => {
    setCallState('ended');
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setTimeout(() => setCallState('idle'), 1000);
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

  const openQPayInvoice = (appId: string, amount: number) => {
    setActivePaymentId(appId);
    setQpayCountdown(300);
    setIsQPayModalOpen(true);
  };

  const handleRoleToggle = (role: 'individual' | 'business_admin') => {
    setUserRole(role);
    setActiveTab('dashboard');
    setNewApp(prev => ({
      ...prev,
      applicantType: role === 'business_admin' ? 'employee' : 'myself',
      applicantName: role === 'business_admin' ? "" : profile.name,
      registerNo: role === 'business_admin' ? "" : profile.registerNo,
      step: 1,
      khurChecked: false
    }));
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-[#f4f5f6] flex flex-col md:flex-row antialiased font-sans">
      
      {/* ========================================================================= */}
      {/* 1. AUTHENTICATION PAGES (Login / Signup Switch) */}
      {/* ========================================================================= */}
      {authState !== 'authenticated' && (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#090a0f] relative overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e2030_1px,transparent_1px),linear-gradient(to_bottom,#1e2030_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 z-0"></div>
          
          <motion.div 
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-[#0e0f15] border border-[#1e2030] rounded-xl p-8 shadow-2xl relative z-10 space-y-6"
          >
            {/* Header branding */}
            <div className="text-center space-y-2">
              <div className="w-10 h-10 bg-[#0066ff] p-2 rounded-xl inline-flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                MyVisa<span className="text-[#0066ff]">.mn</span>
              </h2>
              <p className="text-xs text-[#8f95b2]">Нэгдсэн Виз Зуучлал & Консулын Төлөвлөгч</p>
            </div>

            {/* Role switch in Auth */}
            <div className="flex p-0.5 bg-[#090a0f] rounded-lg border border-[#1e2030]">
              <button 
                onClick={() => setAuthRole('individual')}
                className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${authRole === 'individual' ? 'bg-[#181922] text-[#0066ff] border border-[#1e2030]' : 'text-[#8f95b2]'}`}
              >
                Иргэн (B2C)
              </button>
              <button 
                onClick={() => setAuthRole('business_admin')}
                className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${authRole === 'business_admin' ? 'bg-[#181922] text-[#0066ff] border border-[#1e2030]' : 'text-[#8f95b2]'}`}
              >
                Байгууллага (B2B)
              </button>
            </div>

            {authState === 'login' ? (
              <div className="space-y-4 text-left">
                {/* Form fields */}
                <div className="space-y-1">
                  <label className="text-[10px] text-[#8f95b2] uppercase tracking-wider font-mono">Нэвтрэх нэр / Имэйл</label>
                  <input 
                    type="email" 
                    placeholder="bold@example.com" 
                    defaultValue={profile.email}
                    className="w-full bg-[#090a0f] border border-[#1e2030] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0066ff]"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-[#8f95b2] uppercase tracking-wider font-mono">Нууц үг</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    className="w-full bg-[#090a0f] border border-[#1e2030] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0066ff]"
                  />
                </div>

                <button 
                  onClick={() => setAuthState('authenticated')}
                  className="w-full py-2.5 rounded bg-[#0066ff] hover:bg-opacity-95 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/15"
                >
                  Аюулгүйгээр нэвтрэх
                </button>

                <div className="h-px bg-[#1e2030] my-4"></div>

                {/* DAN system button */}
                <button 
                  onClick={() => setIsDanModalOpen(true)}
                  className="w-full py-2 rounded bg-slate-800 hover:bg-zinc-800 border border-[#1e2030] text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-all"
                >
                  <Shield className="w-4 h-4 text-blue-500" />
                  DAN системээр хурдан нэвтрэх
                </button>

                <p className="text-xs text-center text-[#8f95b2]">
                  Шинэ хэрэглэгч үү?{" "}
                  <button onClick={() => setAuthState('register')} className="text-[#0066ff] font-bold hover:underline">
                    Бүртгэл үүсгэх
                  </button>
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-left">
                {/* Create Account Fields */}
                <div className="space-y-1">
                  <label className="text-[10px] text-[#8f95b2] uppercase tracking-wider font-mono">Овог Нэр</label>
                  <input 
                    type="text" 
                    placeholder="Бат-Эрдэнэ Болд" 
                    value={profile.name} 
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[#090a0f] border border-[#1e2030] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0066ff]"
                  />
                </div>

                {authRole === 'business_admin' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#8f95b2] uppercase tracking-wider font-mono">Байгууллагын Нэр</label>
                      <input 
                        type="text" 
                        value={profile.companyName}
                        onChange={(e) => setProfile(prev => ({ ...prev, companyName: e.target.value }))}
                        className="w-full bg-[#090a0f] border border-[#1e2030] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0066ff]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-[#8f95b2] uppercase tracking-wider font-mono">Байгууллагын РД</label>
                      <input 
                        type="text" 
                        value={profile.companyReg}
                        onChange={(e) => setProfile(prev => ({ ...prev, companyReg: e.target.value }))}
                        className="w-full bg-[#090a0f] border border-[#1e2030] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0066ff]"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#8f95b2] uppercase tracking-wider font-mono">Иргэний РД</label>
                    <input 
                      type="text" 
                      placeholder="УУ94021512" 
                      value={profile.registerNo} 
                      onChange={(e) => setProfile(prev => ({ ...prev, registerNo: e.target.value.toUpperCase() }))}
                      maxLength={10}
                      className="w-full bg-[#090a0f] border border-[#1e2030] rounded px-3 py-2 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-[#8f95b2] uppercase tracking-wider font-mono">Утасны дугаар</label>
                    <input 
                      type="text" 
                      placeholder="+976 9911-2233" 
                      value={profile.phone} 
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-[#090a0f] border border-[#1e2030] rounded px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-[#8f95b2] uppercase tracking-wider font-mono">Имэйл хаяг</label>
                  <input 
                    type="email" 
                    placeholder="bold@example.com" 
                    value={profile.email} 
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-[#090a0f] border border-[#1e2030] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0066ff]"
                  />
                </div>

                <button 
                  onClick={() => {
                    setUserRole(authRole);
                    setAuthState('authenticated');
                  }}
                  className="w-full py-2.5 rounded bg-[#0066ff] hover:bg-opacity-95 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/15"
                >
                  Бүртгэл үүсгэж дуусгах
                </button>

                <p className="text-xs text-center text-[#8f95b2]">
                  Бүртгэлтэй юу?{" "}
                  <button onClick={() => setAuthState('login')} className="text-[#0066ff] font-bold hover:underline">
                    Нэвтрэх хэсэг рүү
                  </button>
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. AUTHENTICATED PLATFORM */}
      {/* ========================================================================= */}
      {authState === 'authenticated' && (
        <>
          {/* SIDEBAR NAVIGATION */}
          <aside className="w-full md:w-64 bg-[#0e0f15] border-b md:border-b-0 md:border-r border-[#1e2030] flex flex-col justify-between shrink-0 h-auto md:h-screen sticky top-0 z-30">
            <div>
              {/* Brand Logo & Role Toggle */}
              <div className="p-6 border-b border-[#1e2030] space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#0066ff] p-1.5 rounded-lg">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-0.5">
                      MyVisa<span className="text-[#0066ff]">.mn</span>
                    </h1>
                    <p className="text-[9px] text-[#8f95b2] tracking-wider uppercase font-mono">Consular Systems</p>
                  </div>
                </div>

                {/* Role Switcher */}
                <div className="flex p-0.5 bg-[#090a0f] rounded-lg border border-[#1e2030]">
                  <button 
                    onClick={() => handleRoleToggle('individual')}
                    className={`flex-1 py-1 text-[9.5px] font-bold rounded transition-all ${userRole === 'individual' ? 'bg-[#181922] text-[#0066ff] border border-[#1e2030]' : 'text-[#8f95b2]'}`}
                  >
                    Иргэн (B2C)
                  </button>
                  <button 
                    onClick={() => handleRoleToggle('business_admin')}
                    className={`flex-1 py-1 text-[9.5px] font-bold rounded transition-all ${userRole === 'business_admin' ? 'bg-[#181922] text-[#0066ff] border border-[#1e2030]' : 'text-[#8f95b2]'}`}
                  >
                    Байгууллага
                  </button>
                </div>
              </div>

              {/* Desktop Nav Items */}
              <nav className="hidden md:block p-4 space-y-1.5">
                <button 
                  onClick={() => setActiveTab('dashboard')} 
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-[#181922] text-[#0066ff] border-l-2 border-[#0066ff]' : 'text-[#8f95b2] hover:text-white hover:bg-[#12131a]/50'}`}
                >
                  <Database className="w-4 h-4" />
                  Хянах самбар
                </button>
                <button 
                  onClick={() => setActiveTab('apply')} 
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'apply' ? 'bg-[#181922] text-[#0066ff] border-l-2 border-[#0066ff]' : 'text-[#8f95b2] hover:text-white hover:bg-[#12131a]/50'}`}
                >
                  <Plus className="w-4 h-4" />
                  Шинэ виз мэдүүлэг
                </button>
                <button 
                  onClick={() => setActiveTab('chat')} 
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'chat' ? 'bg-[#181922] text-[#0066ff] border-l-2 border-[#0066ff]' : 'text-[#8f95b2] hover:text-white hover:bg-[#12131a]/50'}`}
                >
                  <span className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4" />
                    Зөвлөхтэй чатлах
                  </span>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                </button>
              </nav>
            </div>

            {/* Logout / User Info */}
            <div className="p-4 border-t border-[#1e2030] space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-[#12131a] border border-[#1e2030]">
                <div className="w-8 h-8 rounded-lg bg-[#1e2030] border border-[#1e2030] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[11px] font-bold text-white truncate">{profile.name}</p>
                  <p className="text-[9px] font-mono text-[#8f95b2] truncate">{profile.registerNo}</p>
                </div>
              </div>
              <button 
                onClick={() => setAuthState('login')}
                className="w-full py-1.5 rounded bg-[#1e2030] hover:bg-red-950/20 text-[#8f95b2] hover:text-red-400 text-[10px] font-bold border border-[#1e2030] hover:border-red-500/20 transition-all"
              >
                Гарах
              </button>
            </div>
          </aside>

          {/* MOBILE BOTTOM NAVIGATION (Capacitor web wrapper style) */}
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
              onClick={() => setActiveTab('chat')} 
              className={`flex flex-col items-center gap-1 text-[9px] font-bold transition-all ${activeTab === 'chat' ? 'text-[#0066ff]' : 'text-[#8f95b2]'}`}
            >
              <MessageSquare className="w-5 h-5" />
              <span>Зөвлөх чат</span>
            </button>
          </div>

          {/* MAIN VIEWPORT */}
          <main className="flex-1 flex flex-col min-h-0 bg-[#090a0f] p-4 md:p-8 overflow-y-auto">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: DASHBOARD */}
              {activeTab === 'dashboard' && (
                <motion.div 
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6 max-w-5xl"
                >
                  {userRole === 'business_admin' ? (
                    // B2B Corporate Dashboard
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                          <h2 className="text-xl font-bold text-white tracking-tight">Байгууллагын Хянах Самбар</h2>
                          <p className="text-xs text-[#8f95b2]">{profile.companyName} ({profile.companyReg}) • Корпорейт портал.</p>
                        </div>
                        <button 
                          onClick={() => {
                            setNewApp(prev => ({
                              ...prev,
                              applicantType: 'employee',
                              applicantName: "",
                              registerNo: "",
                              step: 1,
                              khurChecked: false
                            }));
                            setActiveTab('apply');
                          }}
                          className="px-4 py-2 rounded-lg bg-[#0066ff] hover:bg-opacity-95 text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow animate-pulse"
                        >
                          <Plus className="w-4 h-4" /> Ажилтан нэмэх
                        </button>
                      </div>

                      {/* Main Corporate Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="premium-card p-5 space-y-1">
                          <p className="text-[9.5px] text-[#8f95b2] font-mono uppercase tracking-wider">Байгууллагын Статус</p>
                          <p className="text-sm font-bold text-white">Гэрээт Харилцагч</p>
                          <p className="text-[10px] text-[#10b981] font-mono">Баталгаажсан (Verified)</p>
                        </div>

                        <div className="premium-card p-5 space-y-1">
                          <p className="text-[9.5px] text-[#8f95b2] font-mono uppercase tracking-wider">Идэвхтэй мэдүүлэг</p>
                          <p className="text-sm font-bold text-white">Нийт {applications.filter(a => a.applicantType === 'employee').length} ажилтан</p>
                          <p className="text-[10px] text-[#8f95b2]">БНСУ, Япон, Шенген</p>
                        </div>

                        <div className="premium-card p-5 space-y-1">
                          <p className="text-[9.5px] text-[#8f95b2] font-mono uppercase tracking-wider">Бөөн Төлбөр (Bulk Invoice)</p>
                          <p className="text-sm font-bold text-white">
                            {applications.filter(a => a.applicantType === 'employee' && a.paymentStatus === 'unpaid').length} Мэдүүлэг Хүлээгдэж буй
                          </p>
                          <p className="text-[10px] text-amber-500 font-mono font-bold">
                            Нийт: {applications
                              .filter(a => a.applicantType === 'employee' && a.paymentStatus === 'unpaid')
                              .reduce((sum, a) => sum + a.embassyFee + a.serviceFee, 0)
                              .toLocaleString()} ₮
                          </p>
                        </div>
                      </div>

                      {/* Employee Visa Application List (B2B Table View) */}
                      <div className="premium-card p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-[#1e2030] pb-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#8f95b2] font-mono">Ажилчдын виз мэдүүлгийн явц</h4>
                          
                          {applications.some(a => a.applicantType === 'employee' && a.paymentStatus === 'unpaid') && (
                            <button 
                              onClick={() => {
                                const unpaidApps = applications.filter(a => a.applicantType === 'employee' && a.paymentStatus === 'unpaid');
                                const totalAmount = unpaidApps.reduce((sum, a) => sum + a.embassyFee + a.serviceFee, 0);
                                const bulkId = `BULK-${Math.floor(100000 + Math.random() * 900000)}`;
                                openQPayInvoice(bulkId, totalAmount);
                              }}
                              className="px-3.5 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white transition-all shadow"
                            >
                              Нэгдсэн QPay төлбөр хийх
                            </button>
                          )}
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-[#1e2030] text-[#8f95b2] font-mono">
                                <th className="pb-3 font-semibold">Ажилтны нэр</th>
                                <th className="pb-3 font-semibold">Регистр</th>
                                <th className="pb-3 font-semibold">Улс / Виз</th>
                                <th className="pb-3 font-semibold">Төлөв</th>
                                <th className="pb-3 font-semibold">Төлбөр</th>
                                <th className="pb-3 font-semibold text-right">Үйлдэл</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#1e2030]">
                              {applications.filter(a => a.applicantType === 'employee').map(app => (
                                <tr key={app.id} className="hover:bg-[#12131a]/30">
                                  <td className="py-3.5 font-semibold text-white">{app.applicantName}</td>
                                  <td className="py-3.5 font-mono text-[#8f95b2]">{app.userRegister}</td>
                                  <td className="py-3.5">
                                    <p className="text-white font-medium">{app.country}</p>
                                    <p className="text-[10px] text-[#8f95b2]">{app.visaType}</p>
                                  </td>
                                  <td className="py-3.5">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                      app.status === 'approved' ? 'bg-[#10b981]/15 text-[#10b981]' :
                                      app.status === 'payment_pending' ? 'bg-amber-500/15 text-amber-500' :
                                      app.status === 'submitted' ? 'bg-blue-500/15 text-blue-500' : 'bg-zinc-800 text-slate-300'
                                    }`}>
                                      {app.status === 'approved' ? 'Зөвшөөрсөн' :
                                       app.status === 'payment_pending' ? 'Төлбөр хүлээгдэж буй' :
                                       app.status === 'submitted' ? 'Илгээсэн' : 'Ноорог'}
                                    </span>
                                  </td>
                                  <td className="py-3.5">
                                    <span className={`font-semibold font-mono ${app.paymentStatus === 'paid' ? 'text-[#10b981]' : 'text-amber-500'}`}>
                                      {app.paymentStatus === 'paid' ? 'Төлсөн' : 'Дутуу'}
                                    </span>
                                  </td>
                                  <td className="py-3.5 text-right">
                                    {app.paymentStatus === 'unpaid' && (
                                      <button 
                                        onClick={() => openQPayInvoice(app.id, app.embassyFee + app.serviceFee)}
                                        className="text-[10px] font-bold text-white bg-[#0066ff] hover:bg-opacity-95 px-2.5 py-1 rounded transition-all"
                                      >
                                        Төлөх
                                      </button>
                                    )}
                                    {app.paymentStatus === 'paid' && (
                                      <span className="text-[10px] text-[#8f95b2] font-mono">Баримт хэвлэх</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // B2C Consumer Dashboard
                    <div className="space-y-6">
                      {/* B2C Consultation Trigger Section */}
                      <div className="premium-card p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-[#0066ff]/20 bg-[#0066ff]/5 relative overflow-hidden">
                        <div className="space-y-2 relative z-10">
                          <span className="text-[9.5px] font-mono font-bold bg-[#0066ff] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Шууд зөвлөгөө</span>
                          <h3 className="text-base font-bold text-white">Визний зөвлөхтэй холбогдох</h3>
                          <p className="text-xs text-[#8f95b2] max-w-md">Виз мэдүүлгийн бичиг баримт, нийгмийн даатгал эсвэл зураг хуулахад асуудал гарвал манай консулын багтай шууд дуу болон дүрс дуудлага хийж тусламж аваарай.</p>
                        </div>

                        <div className="flex gap-2.5 shrink-0 w-full sm:w-auto relative z-10">
                          <button 
                            onClick={() => startCall('voice')}
                            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg bg-[#1e2030] hover:bg-zinc-800 border border-[#1e2030] text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow"
                          >
                            <Phone className="w-4 h-4 text-emerald-400" />
                            Дуудлага хийх
                          </button>
                          <button 
                            onClick={() => startCall('video')}
                            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg bg-[#0066ff] hover:bg-opacity-95 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow"
                          >
                            <Video className="w-4 h-4 text-white" />
                            Дүрсээ харах
                          </button>
                        </div>
                      </div>

                      {/* Main Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="premium-card p-5 space-y-1">
                          <p className="text-[9.5px] text-[#8f95b2] font-mono uppercase tracking-wider">Мэдээлэл Баталгаажилт</p>
                          <p className="text-sm font-bold text-white">DAN систем холбогдсон</p>
                          <p className="text-[10px] text-[#10b981] font-mono">Нийгмийн даатгал идэвхтэй</p>
                        </div>

                        <div className="premium-card p-5 space-y-1">
                          <p className="text-[9.5px] text-[#8f95b2] font-mono uppercase tracking-wider">Миний мэдүүлгүүд</p>
                          <p className="text-sm font-bold text-white">Нийт {applications.length} мэдүүлэг</p>
                          <p className="text-[10px] text-[#8f95b2]">БНСУ, Япон орнууд</p>
                        </div>

                        <div className="premium-card p-5 space-y-1">
                          <p className="text-[9.5px] text-[#8f95b2] font-mono uppercase tracking-wider">Хураамж төлөлт</p>
                          <p className="text-sm font-bold text-white">QPay сүлжээ холбогдсон</p>
                          <p className="text-[10px] text-[#0066ff] font-mono">Шууд апп-руу шилжүүлнэ</p>
                        </div>
                      </div>

                      {/* Document and Passport Capture quick launch */}
                      <div className="premium-card p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-[#1e2030] pb-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#8f95b2] font-mono">Хурдан Камер / Гадаад Паспорт Баталгаажуулах</h4>
                          <span className="text-[10px] text-[#10b981] font-bold font-mono">OCR Active</span>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <p className="text-xs text-[#8f95b2] max-w-lg">
                            Гадаад паспортын зургаа утасны камераар шууд дарж уншуулан визний зуучлагч компанид аюулгүй илгээх боломжтой. Камер уншигч нь паспортын MRZ бүсийг автоматаар уншиж баталгаажуулна.
                          </p>
                          
                          <button 
                            onClick={openPassportCamera}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#0066ff] hover:bg-opacity-95 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all shadow shrink-0"
                          >
                            <Camera className="w-4 h-4" />
                            Паспорт Сканнердах
                          </button>
                        </div>
                      </div>

                      {/* Standard Visas Grid list */}
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
                                  <span className="text-[10px] text-[#10b981] font-bold">KHUR API</span>
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
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 2: STEP-BY-STEP APPLICATION FORM */}
              {activeTab === 'apply' && (
                <motion.div 
                  key="apply"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6 max-w-3xl"
                >
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

                  {/* Form step contents */}
                  <div className="premium-card p-6 md:p-8">
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
                                <p className="text-[10px] text-[#8f95b2] mt-0.5">Нийт: {(country.eFee + country.sFee).toLocaleString()} ₮</p>
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

                    {/* Step 2: KHUR */}
                    {newApp.step === 2 && (
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <h3 className="text-base font-bold text-white">Нийгмийн Даатгалын мэдээлэл (KHUR)</h3>
                          <p className="text-xs text-[#8f95b2]">Мэдүүлгийг баталгаажуулахын тулд иргэний РД-аар ХУР системээс лавлагаа татна.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-[#0e0f15] border border-[#1e2030] space-y-1">
                            <span className="text-[10px] text-[#8f95b2] font-mono uppercase tracking-wider block">Регистрийн дугаар</span>
                            <input 
                              type="text" 
                              value={newApp.registerNo} 
                              onChange={(e) => setNewApp(prev => ({ ...prev, registerNo: e.target.value.toUpperCase() }))}
                              maxLength={10}
                              className="w-full bg-[#090a0f] border border-[#1e2030] rounded px-3 py-1.5 text-xs font-mono font-bold text-white focus:outline-none"
                            />
                          </div>
                          <div className="p-4 rounded-xl bg-[#0e0f15] border border-[#1e2030] space-y-1">
                            <span className="text-[10px] text-[#8f95b2] font-mono">Дамжуулах суваг</span>
                            <p className="text-xs font-mono font-bold text-white">150.129.143.18 (Static VPS IP)</p>
                          </div>
                        </div>

                        {khurLoading ? (
                          <div className="p-8 rounded-xl bg-[#0e0f15] border border-[#1e2030] flex flex-col items-center justify-center gap-3 text-center">
                            <RefreshCw className="w-6 h-6 text-[#0066ff] animate-spin" />
                            <p className="text-xs font-bold text-white">Төрийн ХУР систем рүү холбогдож байна...</p>
                          </div>
                        ) : newApp.khurChecked ? (
                          <div className="p-4 bg-[#10b981]/5 border border-[#10b981]/25 rounded-xl space-y-2 text-xs">
                            <p className="font-bold text-white flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-[#10b981]" /> Нийгмийн Даатгалын мэдээлэл холбогдлоо.
                            </p>
                            <p className="font-mono text-[#8f95b2] mt-2">Ажил олгогч: {newApp.khurEmployer} / Дундаж цалин: {newApp.khurSalary.toLocaleString()} ₮</p>
                          </div>
                        ) : (
                          <button 
                            onClick={pullKhurData}
                            className="w-full py-2.5 rounded-lg bg-[#0066ff] hover:bg-opacity-95 text-xs font-bold text-white transition-all shadow"
                          >
                            ХУР лавлагаа шалгаж эхлэх
                          </button>
                        )}

                        <div className="flex justify-between pt-4 border-t border-[#1e2030]">
                          <button 
                            onClick={() => setNewApp(prev => ({ ...prev, step: 1 }))}
                            className="px-4 py-2 rounded-lg border border-[#1e2030] hover:bg-[#12131a] text-xs font-semibold text-[#8f95b2]"
                          >
                            Өмнөх
                          </button>
                          <button 
                            onClick={() => setNewApp(prev => ({ ...prev, step: 3 }))}
                            disabled={!newApp.khurChecked}
                            className="px-5 py-2.5 rounded-lg bg-[#0066ff] hover:bg-opacity-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                          >
                            Дараах <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Material uploads with camera trigger */}
                    {newApp.step === 3 && (
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <h3 className="text-base font-bold text-white">Бичиг баримт бүрдүүлэлт</h3>
                          <p className="text-xs text-[#8f95b2]">Гадаад паспортоо камер ашиглан шууд сканнердаж эсвэл файлаар хуулна уу.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {/* Passport trigger */}
                          <div className="p-5 rounded-xl border border-[#1e2030] bg-[#0e0f15]/50 flex flex-col justify-between h-48">
                            <h4 className="text-xs font-bold text-white">Гадаад Паспорт</h4>
                            {newApp.passportFile ? (
                              <div className="p-2 rounded bg-[#10b981]/5 border border-[#10b981]/25 flex items-center justify-between text-[9.5px] font-mono text-[#10b981] overflow-hidden">
                                <span className="truncate">{newApp.passportFile}</span>
                                <Check className="w-3.5 h-3.5 shrink-0" />
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <button 
                                  onClick={openPassportCamera}
                                  className="w-full py-2.5 rounded-lg bg-[#0066ff] hover:bg-opacity-95 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all"
                                >
                                  <Camera className="w-3.5 h-3.5" /> Камер уншуулах
                                </button>
                                <button 
                                  onClick={() => handleFileUpload('passport')}
                                  className="w-full py-1.5 rounded-lg border border-[#1e2030] text-[#8f95b2] hover:text-white text-[10px] font-semibold flex items-center justify-center gap-1.5 bg-[#090a0f]"
                                >
                                  <Upload className="w-3 h-3" /> Файлаас оруулах
                                </button>
                              </div>
                            )}
                          </div>

                          {/* 3x4 Photo */}
                          <div className="p-5 rounded-xl border border-[#1e2030] bg-[#0e0f15]/50 flex flex-col justify-between h-48">
                            <h4 className="text-xs font-bold text-white">Цээж зураг (3х4)</h4>
                            {newApp.photoFile ? (
                              <div className="p-2 rounded bg-[#10b981]/5 border border-[#10b981]/25 flex items-center justify-between text-[9.5px] font-mono text-[#10b981] overflow-hidden">
                                <span className="truncate">{newApp.photoFile}</span>
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            ) : (
                              <button 
                                onClick={() => handleFileUpload('photo')}
                                className="w-full py-2.5 rounded-lg border border-dashed border-[#1e2030] hover:border-zinc-600 text-xs font-bold text-[#8f95b2] hover:text-white flex items-center justify-center gap-1.5 bg-[#090a0f]/50"
                              >
                                <Upload className="w-3.5 h-3.5" /> Файл оруулах
                              </button>
                            )}
                          </div>

                          {/* Bank statement */}
                          <div className="p-5 rounded-xl border border-[#1e2030] bg-[#0e0f15]/50 flex flex-col justify-between h-48">
                            <h4 className="text-xs font-bold text-white">Дансны хуулга</h4>
                            {newApp.bankStatementFile ? (
                              <div className="p-2 rounded bg-[#10b981]/5 border border-[#10b981]/25 flex items-center justify-between text-[9.5px] font-mono text-[#10b981] overflow-hidden">
                                <span className="truncate">{newApp.bankStatementFile}</span>
                                <Check className="w-3.5 h-3.5" />
                              </div>
                            ) : (
                              <button 
                                onClick={() => handleFileUpload('statement')}
                                className="w-full py-2.5 rounded-lg border border-dashed border-[#1e2030] hover:border-zinc-600 text-xs font-bold text-[#8f95b2] hover:text-white flex items-center justify-center gap-1.5 bg-[#090a0f]/50"
                              >
                                <Upload className="w-3.5 h-3.5" /> Файл оруулах
                              </button>
                            )}
                          </div>
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

                    {/* Step 4: Checkout review */}
                    {newApp.step === 4 && (
                      <div className="space-y-6 max-w-lg mx-auto py-2">
                        <div className="space-y-1 text-center">
                          <h3 className="text-base font-bold text-white">Мэдүүлгийг хянах</h3>
                          <p className="text-xs text-[#8f95b2]">ЭСЯ руу илгээхээс өмнө өөрийн мэдүүлгийн дүн болон мэдээллээ хянана уу.</p>
                        </div>

                        <div className="premium-card p-5 space-y-4">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-[#8f95b2]">Мэдүүлэгч:</span>
                            <span className="font-semibold text-white">{newApp.applicantName}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-[#8f95b2]">Улс / Виз:</span>
                            <span className="font-semibold text-white">{newApp.country} ({newApp.visaType})</span>
                          </div>
                          <div className="h-px bg-[#1e2030]"></div>
                          <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-[#8f95b2]">Нийт төлөх дүн:</span>
                            <span className="font-mono text-[#0066ff]">{(newApp.embassyFee + newApp.serviceFee).toLocaleString()} ₮</span>
                          </div>
                        </div>

                        <div className="flex justify-between pt-4 border-t border-[#1e2030] gap-3">
                          <button 
                            onClick={() => setNewApp(prev => ({ ...prev, step: 3 }))}
                            className="px-4 py-2 rounded-lg border border-[#1e2030] hover:bg-[#12131a] text-xs font-semibold text-[#8f95b2]"
                          >
                            Өмнөх
                          </button>
                          <button 
                            onClick={handleGenerateInvoice}
                            className="px-5 py-2.5 rounded-lg bg-[#0066ff] hover:bg-opacity-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow"
                          >
                            Төлбөр төлөх <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Success / Completion */}
                    {newApp.step === 5 && (
                      <div className="space-y-6 text-center max-w-md mx-auto py-4">
                        <div className="w-16 h-16 bg-[#10b981]/15 border border-[#10b981]/30 rounded-full flex items-center justify-center mx-auto text-[#10b981]">
                          <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-base font-bold text-white">Виз мэдүүлэг амжилттай хүлээн авлаа</h3>
                          <p className="text-xs text-[#8f95b2]">
                            Таны визний мэдүүлэг амжилттай илгээгдлээ. Бид шаардлагатай бичиг баримтуудыг Элчин Сайдын Яаманд хүргүүлэх болно.
                          </p>
                        </div>
                        <div className="premium-card p-4 text-left text-xs font-mono bg-[#090a0f] border border-[#1e2030] space-y-2">
                          <p className="text-[#8f95b2]">Нэхэмжлэх ID: <span className="text-white">{newApp.qpayInvoice || activePaymentId}</span></p>
                          <p className="text-[#8f95b2]">Төлөв: <span className="text-[#10b981] font-bold">ТӨЛСӨН</span></p>
                        </div>
                        <button 
                          onClick={() => {
                            const newAppObj: VisaApplication = {
                              id: `VISA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                              applicantType: newApp.applicantType,
                              applicantName: newApp.applicantName,
                              country: newApp.country,
                              countryCode: newApp.countryCode,
                              visaType: newApp.visaType,
                              status: 'submitted',
                              userRegister: newApp.registerNo,
                              embassyFee: newApp.embassyFee,
                              serviceFee: newApp.serviceFee,
                              createdAt: new Date().toISOString().split('T')[0],
                              paymentStatus: 'paid'
                            };
                            setApplications(prev => [newAppObj, ...prev]);
                            setNewApp(prev => ({
                              ...prev,
                              step: 1,
                              khurChecked: false,
                              passportFile: null,
                              bankStatementFile: null,
                              photoFile: null
                            }));
                            setActiveTab('dashboard');
                          }}
                          className="w-full py-2.5 rounded-lg bg-[#0066ff] hover:bg-opacity-95 text-white text-xs font-bold transition-all shadow"
                        >
                          Хянах самбар руу буцах
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 3: REAL-TIME CONSULTATION CHAT */}
              {activeTab === 'chat' && (
                <motion.div 
                  key="chat"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] premium-card overflow-hidden"
                >
                  {/* Chat Header with video/audio icons */}
                  <div className="px-6 py-4 bg-[#12131a] border-b border-[#1e2030] flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#181922] border border-[#1e2030] flex items-center justify-center text-slate-300 font-bold text-xs relative">
                        Х
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10b981] border border-[#12131a]"></span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Визний зөвлөх: Хатантуул</h4>
                        <p className="text-[10px] text-[#8f95b2]">Онлайн байна</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => startCall('voice')}
                        className="p-2 rounded-lg bg-[#181922] hover:bg-zinc-800 border border-[#1e2030] text-slate-300 hover:text-white transition-all"
                        title="Start Voice Call"
                      >
                        <Phone className="w-4 h-4 text-emerald-400" />
                      </button>
                      <button 
                        onClick={() => startCall('video')}
                        className="p-2 rounded-lg bg-[#181922] hover:bg-zinc-800 border border-[#1e2030] text-slate-300 hover:text-white transition-all"
                        title="Start Video Call"
                      >
                        <Video className="w-4 h-4 text-[#0066ff]" />
                      </button>
                    </div>
                  </div>

                  {/* Messages list */}
                  <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#090a0f]/50">
                    {chatMessages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] rounded-xl px-4 py-2.5 text-xs ${
                          msg.sender === 'user' 
                            ? 'bg-[#0066ff] text-white rounded-tr-none' 
                            : 'bg-[#12131a] text-slate-200 border border-[#1e2030] rounded-tl-none'
                        }`}>
                          <p className="leading-relaxed">{msg.text}</p>
                          
                          {/* Attached document snippet (captured passport) */}
                          {msg.attachment && (
                            <div className="mt-3 p-2 rounded bg-black/30 border border-white/5 flex items-center gap-3">
                              {msg.attachment.type === 'passport' ? (
                                <div className="w-16 h-10 bg-zinc-800 rounded border border-white/10 overflow-hidden relative">
                                  {msg.attachment.url ? (
                                    <img src={msg.attachment.url} alt="Passport Attachment" className="w-full h-full object-cover" />
                                  ) : (
                                    <Camera className="w-4 h-4 mx-auto my-3 text-slate-500" />
                                  )}
                                </div>
                              ) : (
                                <FileText className="w-8 h-8 text-[#0066ff]" />
                              )}
                              <div className="overflow-hidden">
                                <p className="text-[10px] font-bold text-white truncate">{msg.attachment.name}</p>
                                <span className="text-[8px] text-[#8f95b2] font-mono">Encrypted AES-256</span>
                              </div>
                            </div>
                          )}

                          <span className="text-[8.5px] text-[#8f95b2] font-mono block text-right mt-1.5">{msg.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer message editor with Camera Shortcut */}
                  <div className="p-4 bg-[#12131a] border-t border-[#1e2030] flex items-center gap-3 shrink-0">
                    <button 
                      onClick={openPassportCamera}
                      className="p-2 rounded-lg bg-[#181922] hover:bg-zinc-800 border border-[#1e2030] text-[#8f95b2] hover:text-white transition-all"
                      title="Take Photo of Passport"
                    >
                      <Camera className="w-4.5 h-4.5" />
                    </button>
                    <input 
                      type="text" 
                      placeholder="Зөвлөхөөс асуух зүйлээ бичнэ үү..." 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 bg-[#090a0f] border border-[#1e2030] rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:border-[#0066ff] transition-all"
                    />
                    <button 
                      onClick={handleSendMessage}
                      className="p-2 rounded-lg bg-[#0066ff] hover:bg-opacity-95 text-white transition-all"
                    >
                      <Send className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </main>

          {/* ========================================================================= */}
          {/* 3. DYNAMIC PASSPORT CAMERA COMPONENT & OCR FRAME OVERLAY */}
          {/* ========================================================================= */}
          <AnimatePresence>
            {isCameraOpen && (
              <div className="fixed inset-0 z-50 flex flex-col bg-black">
                {/* Live stream section */}
                <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="absolute inset-0 w-full h-full object-cover"
                  ></video>
                  
                  {/* Dotted camera rectangle guiding frame overlay */}
                  <div className="absolute inset-0 border-[32px] border-black/75 flex items-center justify-center pointer-events-none">
                    <div className="w-[85vw] max-w-[480px] h-[55vw] max-h-[300px] border-2 border-dashed border-[#0066ff] rounded-xl relative flex flex-col justify-between p-4">
                      {/* Corner marks */}
                      <span className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></span>
                      <span className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></span>
                      <span className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></span>
                      <span className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></span>
                      
                      <div className="text-[10px] text-white bg-black/60 px-3 py-1 rounded-full mx-auto font-sans font-bold leading-normal text-center shadow-lg">
                        Гадаад паспорт уншуулах тэгш өнцөгт
                      </div>

                      <div className="text-[9px] text-[#8f95b2] bg-black/60 px-3 py-1.5 rounded-lg mx-auto text-center leading-normal max-w-[280px]">
                        Паспортын зурагтай нүүрийг босоо тусгалтай цонхонд багтаан утасны сүүдэр тусгалгүй тод авна уу.
                      </div>
                    </div>
                  </div>

                  {/* captured display overview */}
                  {capturedPhoto && (
                    <div className="absolute inset-0 bg-[#090a0f] z-10 flex flex-col justify-between p-6">
                      <div className="text-center space-y-1">
                        <h4 className="text-sm font-bold text-white">Паспорт зураг авалт</h4>
                        <p className="text-[10.5px] text-[#8f95b2]">Мэдээллийг хянах эсвэл дахин зураг авах боломжтой</p>
                      </div>

                      <div className="max-w-md w-full h-[55vw] max-h-[300px] mx-auto border border-[#1e2030] rounded-xl overflow-hidden shadow-2xl relative bg-zinc-900">
                        <img src={capturedPhoto} alt="Captured Passport" className="w-full h-full object-cover" />
                        
                        {/* Fake OCR highlight effect */}
                        {isOcrProcessing && (
                          <div className="absolute inset-0 bg-blue-500/10 flex flex-col items-center justify-center gap-3 backdrop-blur-xs">
                            <RefreshCw className="w-8 h-8 text-[#0066ff] animate-spin" />
                            <span className="text-xs font-mono font-bold text-white bg-black/80 px-3 py-1 rounded">MRZ бүсийг уншиж байна...</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4 max-w-sm mx-auto w-full">
                        <button 
                          onClick={openPassportCamera}
                          disabled={isOcrProcessing}
                          className="flex-1 py-3 rounded-lg border border-[#1e2030] bg-[#12131a] hover:bg-[#181922] text-slate-300 text-xs font-bold transition-all disabled:opacity-50"
                        >
                          Дахин авах
                        </button>
                        <button 
                          onClick={submitPassportPhoto}
                          disabled={isOcrProcessing}
                          className="flex-1 py-3 rounded-lg bg-[#10b981] hover:bg-opacity-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow"
                        >
                          {isOcrProcessing ? "Баталгаажуулж байна..." : "Илгээх (Secure)"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Camera controls */}
                {!capturedPhoto && (
                  <div className="h-24 bg-[#0e0f15] border-t border-[#1e2030] flex items-center justify-between px-8 shrink-0 relative z-10">
                    <button 
                      onClick={closePassportCamera}
                      className="text-xs text-[#8f95b2] hover:text-white"
                    >
                      Цуцлах
                    </button>
                    
                    <button 
                      onClick={capturePhoto}
                      className="w-14 h-14 rounded-full border-4 border-white bg-red-600 active:scale-90 transition-all flex items-center justify-center shadow-lg"
                      title="Capture Frame"
                    >
                      <span className="w-10 h-10 rounded-full border-2 border-[#0e0f15] bg-transparent"></span>
                    </button>

                    <div className="w-12 h-12 bg-[#12131a] border border-[#1e2030] rounded flex items-center justify-center">
                      {/* Hidden canvas for snapshot rendering */}
                      <canvas ref={canvasRef} className="hidden"></canvas>
                      <ImageIcon className="w-5 h-5 text-[#8f95b2]" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </AnimatePresence>

          {/* ========================================================================= */}
          {/* 4. DYNAMIC CALL PANEL SIMULATOR (Voice & Video overlay layout) */}
          {/* ========================================================================= */}
          <AnimatePresence>
            {callState !== 'idle' && (
              <div className="fixed inset-0 z-50 flex flex-col bg-[#090a0f] items-center justify-center p-6 backdrop-blur-md">
                
                {/* Voice Call Layout */}
                {callType === 'voice' && (
                  <div className="max-w-xs w-full text-center space-y-8 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-[#12131a] border-2 border-[#1e2030] flex items-center justify-center text-slate-300 font-bold text-2xl relative shadow-2xl">
                      X
                      {callState === 'ringing' && (
                        <span className="absolute inset-0 rounded-full border-2 border-[#0066ff] animate-ping opacity-75"></span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-white">Визний зөвлөх: Хатантуул</h4>
                      <p className="text-xs text-[#8f95b2]">
                        {callState === 'ringing' && 'Дуудаж байна...'}
                        {callState === 'connected' && 'Холбогдсон'}
                        {callState === 'ended' && 'Дуудлага дууссан'}
                      </p>
                    </div>

                    {/* Controls Grid */}
                    <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-3 rounded-full border border-[#1e2030] transition-all ${isMuted ? 'bg-[#0066ff] text-white' : 'bg-[#12131a] text-slate-400'}`}
                      >
                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>
                      <button 
                        onClick={endCall}
                        className="p-3 rounded-full bg-red-600 text-white hover:bg-red-500 transition-all shadow-lg"
                      >
                        <PhoneOff className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Video Call Layout */}
                {callType === 'video' && (
                  <div className="relative w-full max-w-3xl h-[70vh] rounded-2xl border border-[#1e2030] bg-[#12131a] overflow-hidden flex flex-col justify-between shadow-2xl">
                    {/* Simulated Consular Agent stream */}
                    <div className="absolute inset-0 bg-[#0e0f15] flex flex-col items-center justify-center">
                      {callState === 'ringing' ? (
                        <div className="text-center space-y-4">
                          <div className="w-20 h-20 rounded-full bg-[#12131a] border border-[#1e2030] flex items-center justify-center text-slate-300 font-bold text-xl relative mx-auto">
                            X
                            <span className="absolute inset-0 rounded-full border border-blue-500 animate-ping"></span>
                          </div>
                          <p className="text-xs text-[#8f95b2]">Дүрс дуудлага хийж байна...</p>
                        </div>
                      ) : (
                        // Mock Remote Stream Video using a clean static presentation
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                          {/* Dotted consular box */}
                          <div className="w-24 h-24 rounded-full bg-blue-900/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-3xl">
                            Х
                          </div>
                          <h5 className="mt-4 font-bold text-white text-sm">Консулын зөвлөх: Хатантуул</h5>
                          <span className="text-[10px] text-[#10b981] bg-[#10b981]/15 px-2 py-0.5 rounded-full mt-2 font-mono">Consular Line Protected</span>
                        </div>
                      )}
                    </div>

                    {/* Local Camera view (captured dynamically if user permits) */}
                    {callState === 'connected' && (
                      <div className="absolute bottom-4 right-4 w-32 h-44 rounded-lg border border-zinc-700 bg-zinc-950/80 overflow-hidden shadow-lg z-10 flex items-center justify-center">
                        {isVideoOff ? (
                          <VideoOff className="w-6 h-6 text-slate-600" />
                        ) : (
                          <video 
                            ref={localVideoRef} 
                            autoPlay 
                            muted 
                            playsInline 
                            className="w-full h-full object-cover transform -scale-x-100"
                          ></video>
                        )}
                      </div>
                    )}

                    {/* Top overlay details */}
                    <div className="relative p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center text-xs text-white">
                      <span className="font-bold flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#0066ff]" />
                        End-to-End Encrypted Consultation
                      </span>
                      {callState === 'connected' && <span className="font-mono bg-red-600 px-2 py-0.5 rounded">LIVE</span>}
                    </div>

                    {/* Bottom controls panel */}
                    <div className="relative p-6 bg-gradient-to-t from-black/85 to-transparent flex justify-center gap-4 items-center">
                      <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-3 rounded-full border border-zinc-800 transition-all ${isMuted ? 'bg-[#0066ff] text-white' : 'bg-black/60 text-slate-300'}`}
                      >
                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>
                      
                      <button 
                        onClick={endCall}
                        className="p-3.5 rounded-full bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg mx-2"
                      >
                        <PhoneOff className="w-5.5 h-5.5" />
                      </button>

                      <button 
                        onClick={() => setIsVideoOff(!isVideoOff)}
                        className={`p-3 rounded-full border border-zinc-800 transition-all ${isVideoOff ? 'bg-[#0066ff] text-white' : 'bg-black/60 text-slate-300'}`}
                      >
                        {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}
          </AnimatePresence>

          {/* ========================================================================= */}
          {/* 5. QPAY GATEWAY SIMULATION CHECKOUT POPUP */}
          {/* ========================================================================= */}
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
                    <h4 className="text-sm font-bold text-white">Төлбөрийн нэхэмжлэх</h4>
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
                        {(newApp.embassyFee + newApp.serviceFee).toLocaleString()} ₮
                      </p>
                      <p className="text-[10px] text-[#8f95b2] font-mono font-semibold">Нэхэмжлэх ID: {activePaymentId || newApp.qpayInvoice}</p>
                      <p className="text-[10.5px] text-amber-500 font-mono flex items-center justify-center gap-1.5 mt-1 font-bold">
                        <Clock className="w-3.5 h-3.5" /> {formatTime(qpayCountdown)}
                      </p>
                    </div>
                  </div>

                  {/* App-to-App direct banking deep links (B2C touch) */}
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

          {/* ========================================================================= */}
          {/* 6. DAN SYSTEM MODAL SIMULATOR */}
          {/* ========================================================================= */}
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
                            value={profile.registerNo} 
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
                            <p className="text-[9.5px] text-[#10b981] font-mono text-center">Таны +976 9911-2233 дугаарт код илгээгдлээ.</p>
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
        </>
      )}

    </div>
  );
}
