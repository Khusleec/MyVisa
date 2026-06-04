"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, User, MessageSquare, RefreshCw, Globe, ArrowLeft, Building } from "lucide-react";
import { supabase } from "../lib/supabase";
import PageHeader from "./ui/PageHeader";

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

export default function Chat({ currentProfile }: ChatProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeMobileView, setActiveMobileView] = useState<'contacts' | 'conversation'>('contacts');
  const [contactFilter, setContactFilter] = useState<'all' | 'individual' | 'business_admin'>('all');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadContacts = async () => {
    setLoadingContacts(true);
    try {
      // 1. Fetch all profiles who are not visa issuers
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .neq('role', 'visa_issuer')
        .order('name', { ascending: true });

      if (profilesError) throw profilesError;

      // 2. Fetch companies if any B2B contacts exist
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*');

      const companyMap = new Map<string, string>();
      if (!companiesError && companiesData) {
        companiesData.forEach(c => companyMap.set(c.id, c.name));
      }

      if (profilesData) {
        const formattedContacts: Contact[] = profilesData.map(p => ({
          id: p.id,
          name: p.name,
          role: p.role,
          company_id: p.company_id,
          company_name: p.company_id ? companyMap.get(p.company_id) : undefined
        }));
        setContacts(formattedContacts);

        // Auto-select first contact on desktop if none selected
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
      // Fetch the first visa issuer in the database
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
        setContacts([issuerContact]);
        setSelectedContact(issuerContact);
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
      // Fetch messages between current user and selected contact
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`and(sender_id.eq.${currentProfile.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${currentProfile.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        setMessages(data as Message[]);
      }
    } catch (e) {
      console.error("Error fetching message history:", e);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load contacts list (Only for Visa Issuer)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentProfile.role === 'visa_issuer') {
        loadContacts();
      } else {
        // B2C/B2B users directly chat with the Visa Issuer
        loadVisaIssuerContact();
      }
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProfile]);

  // Real-time messages subscription
  useEffect(() => {
    if (!selectedContact) return;

    // 1. Fetch initial message history
    const timer = setTimeout(() => {
      fetchMessageHistory(selectedContact.id);
    }, 0);

    // 2. Subscribe to INSERT inserts on chat_messages table
    const channel = supabase
      .channel(`chat_${currentProfile.id}_${selectedContact.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Verify if message belongs to the current conversation
          if (
            (newMsg.sender_id === currentProfile.id && newMsg.receiver_id === selectedContact.id) ||
            (newMsg.sender_id === selectedContact.id && newMsg.receiver_id === currentProfile.id)
          ) {
            setMessages((prev) => {
              // Avoid duplicates if already inserted by sender
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContact, currentProfile.id]);

  // Auto-select contact when filters change
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentProfile.role === 'visa_issuer') {
      const filtered = contacts.filter(contact => {
        if (contactFilter === 'all') return true;
        return contact.role === contactFilter;
      });
      if (filtered.length > 0 && (!selectedContact || !filtered.some(c => c.id === selectedContact.id))) {
        timer = setTimeout(() => {
          setSelectedContact(filtered[0]);
        }, 0);
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
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
        .insert({
          sender_id: currentProfile.id,
          receiver_id: selectedContact.id,
          message: messageText
        })
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setMessages((prev) => [...prev, data as Message]);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  const selectContactMobile = (contact: Contact) => {
    setSelectedContact(contact);
    setActiveMobileView('conversation');
  };

  // Filter contacts list based on selected tab
  const filteredContacts = contacts.filter(contact => {
    if (contactFilter === 'all') return true;
    return contact.role === contactFilter;
  });

  return (
    <motion.div
      key="chat"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      className="space-y-4 flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-80px)] max-w-5xl"
    >
      <PageHeader
        title="Мэдээлэл холбоо"
        description="Визний асуудал болон материалын талаар ЭСЯ-ны визний ажилтантай шууд холбогдож чатлах хэсэг."
      />

      <div className="flex-1 flex gap-4 min-h-0 bg-[#0e0f15] border border-[#1e2030] rounded-xl overflow-hidden">
        
        {/* SIDEBAR: Contacts List (Shown for Visa Issuer, or mobile state) */}
        {currentProfile.role === 'visa_issuer' && (
          <div className={`w-full md:w-80 border-r border-[#1e2030] flex flex-col shrink-0 ${
            activeMobileView === 'conversation' ? 'hidden md:flex' : 'flex'
          }`}>
            <div className="p-4 border-b border-[#1e2030] bg-[#12131a]/55 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Харилцагчид</h3>
              
              <div className="flex p-0.5 bg-[#090a0f] rounded-lg border border-[#1e2030]" role="tablist">
                <button
                  type="button"
                  onClick={() => setContactFilter('all')}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${
                    contactFilter === 'all'
                      ? "bg-[#181922] text-[#0066ff] border border-[#1e2030]"
                      : "text-[#8f95b2] hover:text-white"
                  }`}
                >
                  Бүгд
                </button>
                <button
                  type="button"
                  onClick={() => setContactFilter('individual')}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${
                    contactFilter === 'individual'
                      ? "bg-[#181922] text-[#0066ff] border border-[#1e2030]"
                      : "text-[#8f95b2] hover:text-white"
                  }`}
                >
                  Иргэд
                </button>
                <button
                  type="button"
                  onClick={() => setContactFilter('business_admin')}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded transition-all ${
                    contactFilter === 'business_admin'
                      ? "bg-[#181922] text-[#0066ff] border border-[#1e2030]"
                      : "text-[#8f95b2] hover:text-white"
                  }`}
                >
                  Байгууллага
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#1e2030]/60 p-2 space-y-1">
              {loadingContacts ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="w-5 h-5 text-[#0066ff] animate-spin" />
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#8f95b2]">Харилцагч олдсонгүй.</div>
              ) : (
                filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => selectContactMobile(contact)}
                    className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all ${
                      selectedContact?.id === contact.id
                        ? "bg-[#181922] text-[#0066ff] border border-[#1e2030]"
                        : "text-[#8f95b2] hover:text-white hover:bg-[#12131a]/40"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#1a1c29] border border-[#1e2030] flex items-center justify-center text-slate-300 shrink-0">
                      {contact.role === 'business_admin' ? <Building className="w-3.5 h-3.5 text-[#0066ff]" /> : <User className="w-3.5 h-3.5" />}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-white truncate">
                        {contact.role === 'business_admin' ? (contact.company_name || 'Бизнес харилцагч') : contact.name}
                      </p>
                      <p className="text-[9.5px] text-[#8f95b2] font-mono truncate">
                        {contact.role === 'business_admin' ? `Админ: ${contact.name}` : 'Хувь хүн'}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* MAIN CHAT AREA */}
        <div className={`flex-1 flex flex-col min-w-0 ${
          currentProfile.role === 'visa_issuer' && activeMobileView === 'contacts' ? 'hidden md:flex' : 'flex'
        }`}>
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[#1e2030] bg-[#12131a]/55 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {currentProfile.role === 'visa_issuer' && (
                    <button
                      onClick={() => setActiveMobileView('contacts')}
                      className="md:hidden p-1.5 rounded-lg hover:bg-[#1a1c29] text-[#8f95b2]"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <div className="w-8 h-8 rounded-lg bg-[#1a1c29] border border-[#1e2030] flex items-center justify-center text-slate-300 shrink-0">
                    {selectedContact.role === 'visa_issuer' ? (
                      <Globe className="w-3.5 h-3.5 text-[#0066ff]" />
                    ) : selectedContact.role === 'business_admin' ? (
                      <Building className="w-3.5 h-3.5 text-[#0066ff]" />
                    ) : (
                      <User className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-white truncate">
                      {selectedContact.role === 'business_admin' ? (selectedContact.company_name || 'Бизнес харилцагч') : selectedContact.name}
                    </h4>
                    <p className="text-[9.5px] text-[#8f95b2] font-mono uppercase tracking-wider">
                      {selectedContact.role === 'visa_issuer' 
                        ? 'Визний Ажилтан' 
                        : selectedContact.role === 'business_admin' 
                          ? `Бизнес • Төлөөлөгч: ${selectedContact.name}` 
                          : 'Мэдүүлэгч'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#090a0f]/40">
                {loadingMessages && messages.length === 0 ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="w-5 h-5 text-[#0066ff] animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 text-[#8f95b2] space-y-2">
                    <MessageSquare className="w-8 h-8 text-[#1e2030]" />
                    <p className="text-xs">Шинэ харилцаа үүслээ. Та зурвас бичиж эхлүүлнэ үү.</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === currentProfile.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="max-w-[75%] space-y-1">
                          <div className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                            isMe 
                              ? 'bg-[#0066ff] text-white rounded-tr-none' 
                              : 'bg-[#181922] text-[#f4f5f6] border border-[#1e2030] rounded-tl-none'
                          }`}>
                            <p>{msg.message}</p>
                          </div>
                          <span className={`text-[8.5px] text-[#8f95b2] block font-mono ${isMe ? 'text-right' : 'text-left'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-[#1e2030] bg-[#12131a]/40 flex gap-2">
                <input
                  type="text"
                  placeholder="Зурвас бичих..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-[#090a0f] border border-[#1e2030] hover:border-zinc-700 focus:border-[#0066ff] rounded-xl px-4 py-2 text-xs text-white focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="w-9 h-9 rounded-xl bg-[#0066ff] hover:bg-opacity-95 text-white flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-[#8f95b2] space-y-3">
              <MessageSquare className="w-12 h-12 text-[#1e2030]" />
              <div>
                <p className="text-sm font-bold text-white">Зурвас сонгоогүй байна</p>
                <p className="text-xs mt-1">Чатлах харилцагчаа зүүн цэснээс сонгоно уу.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
