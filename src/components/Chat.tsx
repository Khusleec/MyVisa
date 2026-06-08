"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, User, MessageSquare, RefreshCw, Globe,
  ArrowLeft, Building, Search, X, Plus, ChevronRight
} from "lucide-react";
import { supabase } from "../lib/supabase";
import PageHeader from "./ui/PageHeader";
import { useVisaAppContext } from "./providers/VisaAppContext";

interface ChatProps {
  currentProfile: {
    id: string;
    role: 'individual' | 'business_admin' | 'business_employee' | 'visa_issuer';
    name: string;
    company_id: string | null;
  };
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  company_id: string | null;
  company_name?: string;
}

interface CompanyEntry {
  id: string;           // profile id of the business_admin
  company_id: string;
  company_name: string;
  admin_name: string;
}

/* ─────────────────────────────────────────────
   New Chat Modal — lists all companies
───────────────────────────────────────────── */
function NewChatModal({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (contact: Contact) => void;
}) {
  const [query, setQuery] = useState("");
  const [companies, setCompanies] = useState<CompanyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      // Get all business_admin profiles with their company
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, company_id, role")
        .eq("role", "business_admin");

      if (!profiles?.length) { setLoading(false); return; }

      const companyIds = profiles
        .map(p => p.company_id)
        .filter(Boolean) as string[];

      const { data: companiesData } = await supabase
        .from("companies")
        .select("id, name")
        .in("id", companyIds);

      const companyMap = new Map<string, string>();
      companiesData?.forEach(c => companyMap.set(c.id, c.name));

      const entries: CompanyEntry[] = profiles
        .filter(p => p.company_id && companyMap.has(p.company_id))
        .map(p => ({
          id: p.id,
          company_id: p.company_id!,
          company_name: companyMap.get(p.company_id!) ?? "Байгууллага",
          admin_name: p.name,
        }));

      setCompanies(entries);
    } catch (e) {
      console.error("fetchCompanies error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchRef.current?.focus();
    const timer = setTimeout(() => {
      fetchCompanies();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const filtered = companies.filter(c =>
    c.company_name.toLowerCase().includes(query.toLowerCase()) ||
    c.admin_name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (entry: CompanyEntry) => {
    onSelect({
      id: entry.id,
      name: entry.admin_name,
      role: "business_admin",
      company_id: entry.company_id,
      company_name: entry.company_name,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "var(--bg-card)", border: "1px solid var(--color-border)" }}
      >
        {/* Header */}
        <div
          className="px-5 pt-5 pb-4 flex items-center justify-between border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div>
            <h2 className="text-sm font-bold text-foreground">Шинэ чат эхлүүлэх</h2>
            <p className="text-xs text-muted mt-0.5">Байгууллагыг сонгоно уу</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-overlay text-muted hover:text-foreground transition-colors"
            aria-label="Хаах"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--color-border)" }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Байгууллагын нэр хайх..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none transition-all"
              style={{
                background: "var(--bg-main)",
                borderColor: "var(--color-border)",
                color: "var(--color-text-main)",
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Company List */}
        <div className="overflow-y-auto max-h-72 p-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <RefreshCw className="w-5 h-5 text-accent animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-2 text-muted">
              <Building className="w-8 h-8 text-line" />
              <p className="text-xs">
                {query ? `"${query}" олдсонгүй` : "Байгууллага олдсонгүй"}
              </p>
            </div>
          ) : (
            filtered.map(entry => (
              <button
                key={entry.id}
                type="button"
                onClick={() => handleSelect(entry)}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group hover:bg-overlay"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                  style={{
                    background: "var(--color-panel-hover-val)",
                    borderColor: "var(--color-border)",
                  }}
                >
                  <Building className="w-4 h-4 text-accent" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold text-foreground truncate">{entry.company_name}</p>
                  <p className="text-xs text-muted font-mono truncate">Төлөөлөгч: {entry.admin_name}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted group-hover:text-accent transition-colors shrink-0" />
              </button>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Chat Component
───────────────────────────────────────────── */
export default function Chat({ currentProfile }: ChatProps) {
  const { activeChatContact, setActiveChatContact } = useVisaAppContext();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeMobileView, setActiveMobileView] = useState<'contacts' | 'conversation'>('contacts');
  const [contactFilter, setContactFilter] = useState<'all' | 'individual' | 'business_admin'>('all');
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  useEffect(() => {
    if (activeChatContact) {
      const contact = { ...activeChatContact };
      const handler = setTimeout(() => {
        setContacts(prev => {
          if (prev.some(c => c.id === contact.id)) return prev;
          return [contact, ...prev];
        });
        setSelectedContact(contact);
        setActiveMobileView('conversation');
        setActiveChatContact(null);
      }, 0);
      return () => clearTimeout(handler);
    }
  }, [activeChatContact, setActiveChatContact]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadContacts = async () => {
    setLoadingContacts(true);
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'visa_issuer')
        .order('name', { ascending: true });

      if (profilesError) throw profilesError;

      const { data: companiesData } = await supabase.from('companies').select('*');
      const companyMap = new Map<string, string>();
      companiesData?.forEach(c => companyMap.set(c.id, c.name));

      if (profilesData) {
        const formattedContacts: Contact[] = profilesData.map(p => ({
          id: p.id,
          name: p.name,
          role: p.role,
          company_id: p.company_id,
          company_name: p.company_id ? companyMap.get(p.company_id) : undefined
        }));
        setContacts(formattedContacts);

        if (formattedContacts.length > 0 && !selectedContact) {
          setSelectedContact(formattedContacts[0]);
          setActiveMobileView('conversation');
        }
      }
    } catch (e) {
      console.error("Error loading contacts:", e);
    } finally {
      setLoadingContacts(false);
    }
  };

  const loadVisaIssuerContact = async () => {
    setLoadingContacts(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'visa_issuer')
        .limit(1)
        .single();

      if (!error && data) {
        const issuerContact: Contact = {
          id: data.id,
          name: data.name,
          role: data.role,
          company_id: data.company_id
        };
        setContacts(prev => {
          // keep any extra contacts the user already opened, add issuer if not present
          if (prev.some(c => c.id === issuerContact.id)) return prev;
          return [issuerContact, ...prev];
        });
        setSelectedContact(prev => prev || issuerContact);
      }
    } catch (e) {
      console.error("Error loading visa issuer:", e);
    } finally {
      setLoadingContacts(false);
    }
  };

  const fetchMessageHistory = async (contactId: string) => {
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`and(sender_id.eq.${currentProfile.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${currentProfile.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) setMessages(data as Message[]);
    } catch (e) {
      console.error("Error fetching message history:", e);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentProfile.role === 'visa_issuer') {
        loadContacts();
      } else {
        loadVisaIssuerContact();
      }
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProfile]);

  // Real-time subscription
  useEffect(() => {
    if (!selectedContact) return;
    const timer = setTimeout(() => fetchMessageHistory(selectedContact.id), 0);
    const channel = supabase
      .channel(`chat_${currentProfile.id}_${selectedContact.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        const newMsg = payload.new as Message;
        if (
          (newMsg.sender_id === currentProfile.id && newMsg.receiver_id === selectedContact.id) ||
          (newMsg.sender_id === selectedContact.id && newMsg.receiver_id === currentProfile.id)
        ) {
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      })
      .subscribe();

    return () => { clearTimeout(timer); supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContact, currentProfile.id]);

  // Auto-select when filter changes (visa issuer only)
  useEffect(() => {
    if (currentProfile.role !== 'visa_issuer') return;
    const filtered = contacts.filter(c => contactFilter === 'all' || c.role === contactFilter);
    if (filtered.length > 0 && (!selectedContact || !filtered.some(c => c.id === selectedContact.id))) {
      const timer = setTimeout(() => setSelectedContact(filtered[0]), 0);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactFilter, contacts, currentProfile.role]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact || sending) return;
    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage("");
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({ sender_id: currentProfile.id, receiver_id: selectedContact.id, message: messageText })
        .select('*')
        .single();
      if (error) throw error;
      if (data) setMessages(prev => [...prev, data as Message]);
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  // When user picks a company from the modal
  const handleNewChatSelect = (contact: Contact) => {
    setContacts(prev => {
      if (prev.some(c => c.id === contact.id)) return prev;
      return [...prev, contact];
    });
    setSelectedContact(contact);
    setActiveMobileView('conversation');
  };

  const filteredContacts = contacts.filter(contact => {
    if (contactFilter === 'all') return true;
    return contact.role === contactFilter;
  });

  const isUserSide = currentProfile.role !== 'visa_issuer';

  return (
    <>
      <motion.div
        key="chat"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.15 }}
        className="space-y-4 flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-80px)] max-w-5xl"
      >
        <div className="flex items-center justify-between gap-4">
          <PageHeader
            title="Мэдээлэл холбоо"
            description="Визний асуудал болон материалын талаар шууд холбогдож чатлах хэсэг."
          />

          {/* New Chat button — visible for individual/business_admin */}
          {isUserSide && (
            <button
              type="button"
              onClick={() => setShowNewChatModal(true)}
              className="btn-primary flex items-center gap-1.5 px-4 py-2 text-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Шинэ чат
            </button>
          )}
        </div>

        <div className="flex-1 flex gap-4 min-h-0 bg-surface border border-line rounded-xl overflow-hidden">

          {/* ── Contacts sidebar: visa issuer view ── */}
          {currentProfile.role === 'visa_issuer' && (
            <div className={`w-full md:w-80 border-r border-line flex flex-col shrink-0 ${
              activeMobileView === 'conversation' ? 'hidden md:flex' : 'flex'
            }`}>
              <div className="p-4 border-b border-line bg-elevated/55 space-y-3">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">Харилцагчид</h3>
                <div className="flex p-0.5 bg-surface rounded-lg border border-line" role="tablist">
                  {(['all', 'individual', 'business_admin'] as const).map((f, i) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setContactFilter(f)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded transition-all ${
                        contactFilter === f ? "bg-elevated text-accent border border-line" : "text-muted hover:text-foreground"
                      }`}
                    >
                      {["Бүгд", "Иргэд", "Байгууллага"][i]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {loadingContacts ? (
                  <div className="flex justify-center py-8"><RefreshCw className="w-5 h-5 text-accent animate-spin" /></div>
                ) : filteredContacts.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted">Харилцагч олдсонгүй.</div>
                ) : (
                  filteredContacts.map(contact => (
                    <button
                      key={contact.id}
                      onClick={() => { setSelectedContact(contact); setActiveMobileView('conversation'); }}
                      className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${
                        selectedContact?.id === contact.id
                          ? "bg-elevated text-accent border border-line"
                          : "text-muted hover:text-foreground hover:bg-elevated/40"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-overlay border border-line flex items-center justify-center shrink-0">
                        {contact.role === 'business_admin' ? <Building className="w-3.5 h-3.5 text-accent" /> : <User className="w-3.5 h-3.5" />}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-foreground truncate">
                          {contact.role === 'business_admin' ? (contact.company_name || 'Бизнес харилцагч') : contact.name}
                        </p>
                        <p className="text-xs text-muted font-mono truncate">
                          {contact.role === 'business_admin' ? `Админ: ${contact.name}` : 'Хувь хүн'}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── Contacts sidebar: user side (shows opened chats) ── */}
          {isUserSide && contacts.length > 1 && (
            <div className={`w-full md:w-64 border-r border-line flex flex-col shrink-0 ${
              activeMobileView === 'conversation' ? 'hidden md:flex' : 'flex'
            }`}>
              <div className="p-3 border-b border-line bg-elevated/55">
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider font-mono">Чатууд</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {contacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => { setSelectedContact(contact); setActiveMobileView('conversation'); }}
                    className={`w-full text-left p-3 rounded-lg flex items-center gap-2.5 transition-all ${
                      selectedContact?.id === contact.id
                        ? "bg-elevated text-accent border border-line"
                        : "text-muted hover:text-foreground hover:bg-elevated/40"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-overlay border border-line flex items-center justify-center shrink-0">
                      {contact.role === 'visa_issuer' ? (
                        <Globe className="w-3 h-3 text-accent" />
                      ) : contact.role === 'business_admin' ? (
                        <Building className="w-3 h-3 text-accent" />
                      ) : (
                        <User className="w-3 h-3" />
                      )}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <p className="text-xs font-bold text-foreground truncate">
                        {contact.role === 'visa_issuer' ? 'Визний Ажилтан' : contact.company_name || contact.name}
                      </p>
                      <p className="text-xs text-muted font-mono truncate">
                        {contact.role === 'visa_issuer' ? 'ЭСЯ' : `Төлөөлөгч: ${contact.name}`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Main chat area ── */}
          <div className={`flex-1 flex flex-col min-w-0 ${
            (currentProfile.role === 'visa_issuer' || contacts.length > 1) && activeMobileView === 'contacts'
              ? 'hidden md:flex'
              : 'flex'
          }`}>
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-line bg-elevated/55 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {(currentProfile.role === 'visa_issuer' || contacts.length > 1) && (
                      <button
                        onClick={() => setActiveMobileView('contacts')}
                        className="md:hidden p-1.5 rounded-lg hover:bg-overlay text-muted"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    )}
                    <div className="w-8 h-8 rounded-lg bg-overlay border border-line flex items-center justify-center shrink-0">
                      {selectedContact.role === 'visa_issuer' ? (
                        <Globe className="w-3.5 h-3.5 text-accent" />
                      ) : selectedContact.role === 'business_admin' ? (
                        <Building className="w-3.5 h-3.5 text-accent" />
                      ) : (
                        <User className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-foreground truncate">
                        {selectedContact.role === 'visa_issuer'
                          ? 'Визний Ажилтан'
                          : selectedContact.role === 'business_admin'
                          ? (selectedContact.company_name || 'Бизнес харилцагч')
                          : selectedContact.name}
                      </h4>
                      <p className="text-xs text-muted font-mono uppercase tracking-wider">
                        {selectedContact.role === 'visa_issuer'
                          ? 'ЭСЯ • Визний Ажилтан'
                          : selectedContact.role === 'business_admin'
                          ? `Бизнес • ${selectedContact.name}`
                          : 'Мэдүүлэгч'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface/40">
                  {loadingMessages && messages.length === 0 ? (
                    <div className="flex justify-center py-8"><RefreshCw className="w-5 h-5 text-accent animate-spin" /></div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted space-y-2">
                      <MessageSquare className="w-8 h-8 text-line" />
                      <p className="text-xs">Шинэ харилцаа үүслээ. Та зурвас бичиж эхлүүлнэ үү.</p>
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isMe = msg.sender_id === currentProfile.id;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className="max-w-[75%] space-y-1">
                            <div className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                              isMe
                                ? 'bg-accent text-white rounded-tr-none'
                                : 'bg-elevated text-foreground border border-line rounded-tl-none'
                            }`}>
                              <p>{msg.message}</p>
                            </div>
                            <span className={`text-xs text-muted block font-mono ${isMe ? 'text-right' : 'text-left'}`}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-line bg-elevated/40 flex gap-2">
                  <input
                    type="text"
                    placeholder="Зурвас бичих..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    className="flex-1 bg-surface border border-line hover:border-muted focus:border-accent rounded-xl px-4 py-2 text-xs text-foreground focus:outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="w-9 h-9 rounded-xl bg-accent hover:bg-opacity-95 text-white flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-muted space-y-3">
                <MessageSquare className="w-12 h-12 text-line" />
                <div>
                  <p className="text-sm font-bold text-foreground">Зурвас сонгоогүй байна</p>
                  <p className="text-xs mt-1">
                    {isUserSide
                      ? '"Шинэ чат" дарж байгууллагатай холбогдоно уу.'
                      : 'Чатлах харилцагчаа зүүн цэснээс сонгоно уу.'}
                  </p>
                </div>
                {isUserSide && (
                  <button
                    type="button"
                    onClick={() => setShowNewChatModal(true)}
                    className="btn-primary flex items-center gap-1.5 px-4 py-2 text-xs mt-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Шинэ чат эхлүүлэх
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChatModal && (
          <NewChatModal
            onClose={() => setShowNewChatModal(false)}
            onSelect={handleNewChatSelect}
          />
        )}
      </AnimatePresence>
    </>
  );
}
