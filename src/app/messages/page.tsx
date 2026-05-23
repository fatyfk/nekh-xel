"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const navItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: "🏠" },
  { href: "/courses", label: "Mes cours", icon: "📚" },
  { href: "/exercises", label: "Exercices", icon: "✏️" },
  { href: "/results", label: "Résultats", icon: "📊" },
  { href: "/messages", label: "Messages", icon: "💬", active: true },
  { href: "#", label: "Paramètres", icon: "⚙️" },
];

type Message = { id: number; from: "me" | "other"; text: string; time: string };

type Contact = {
  id: number;
  name: string;
  role: string;
  avatar: string;
  avatarBg: string;
  lastMsg: string;
  time: string;
  unread: number;
  online: boolean;
  messages: Message[];
};

const contacts: Contact[] = [
  {
    id: 1,
    name: "M. Konaté",
    role: "Prof. Mathématiques",
    avatar: "K",
    avatarBg: "bg-indigo-500",
    lastMsg: "Très bien, continuez comme ça !",
    time: "10:32",
    unread: 2,
    online: true,
    messages: [
      { id: 1, from: "other", text: "Bonjour Fatou, comment avancez-vous sur le chapitre des équations du 2ème degré ?", time: "10:15" },
      { id: 2, from: "me", text: "Bonjour M. Konaté ! J'ai du mal avec le discriminant, les formules ne sont pas encore claires pour moi.", time: "10:18" },
      { id: 3, from: "other", text: "C'est normal au début. Retenez : Δ = b² - 4ac. Si Δ > 0, deux racines. Si Δ = 0, une racine double. Si Δ < 0, aucune racine réelle.", time: "10:22" },
      { id: 4, from: "me", text: "Ah oui ! Et les racines sont x = (-b ± √Δ) / 2a, c'est bien ça ?", time: "10:25" },
      { id: 5, from: "other", text: "Exactement ! Vous avez très bien compris. Pratiquez avec les exercices du chapitre 3.", time: "10:28" },
      { id: 6, from: "other", text: "Très bien, continuez comme ça !", time: "10:32" },
    ],
  },
  {
    id: 2,
    name: "Mme Diallo",
    role: "Prof. Français",
    avatar: "D",
    avatarBg: "bg-green-500",
    lastMsg: "N'oubliez pas le devoir de demain.",
    time: "Hier",
    unread: 1,
    online: false,
    messages: [
      { id: 1, from: "other", text: "Bonjour Fatou, j'ai corrigé votre exercice sur les accords du participe passé.", time: "Hier 14:10" },
      { id: 2, from: "me", text: "Bonjour madame ! Quel est mon résultat ?", time: "Hier 14:20" },
      { id: 3, from: "other", text: "Vous avez obtenu 75%. C'est bien ! Mais faites attention aux verbes pronominaux, c'est là que vous perdez des points.", time: "Hier 14:25" },
      { id: 4, from: "me", text: "Merci, je vais retravailler cette partie.", time: "Hier 14:30" },
      { id: 5, from: "other", text: "N'oubliez pas le devoir de demain.", time: "Hier 15:00" },
    ],
  },
  {
    id: 3,
    name: "Support NEKH XËL",
    role: "Équipe NEKH XËL",
    avatar: "G",
    avatarBg: "bg-violet-500",
    lastMsg: "Votre compte a été mis à jour.",
    time: "Lun",
    unread: 0,
    online: true,
    messages: [
      { id: 1, from: "other", text: "Bienvenue sur NEKH XËL, Fatou ! Nous sommes ravis de vous avoir parmi nous. 🎉", time: "Lun 09:00" },
      { id: 2, from: "other", text: "N'hésitez pas à nous contacter si vous avez des questions sur la plateforme.", time: "Lun 09:01" },
      { id: 3, from: "me", text: "Merci ! Est-ce que je peux changer mon avatar ?", time: "Lun 10:15" },
      { id: 4, from: "other", text: "Bien sûr ! Rendez-vous dans votre profil, section « Modifier le profil ».", time: "Lun 10:20" },
      { id: 5, from: "other", text: "Votre compte a été mis à jour.", time: "Lun 10:22" },
    ],
  },
  {
    id: 4,
    name: "M. Traoré",
    role: "Prof. Histoire-Géo",
    avatar: "T",
    avatarBg: "bg-yellow-500",
    lastMsg: "Le quiz de vendredi couvrira tout le chapitre.",
    time: "Dim",
    unread: 0,
    online: false,
    messages: [
      { id: 1, from: "other", text: "Bonjour la classe, je rappelle que le quiz de vendredi couvrira tout le chapitre sur la Révolution française.", time: "Dim 08:00" },
      { id: 2, from: "me", text: "Bonjour M. Traoré, est-ce que les dates importantes seront demandées ?", time: "Dim 09:30" },
      { id: 3, from: "other", text: "Oui, surtout 1789, 1793 et 1799. Révisez bien vos cours.", time: "Dim 10:00" },
      { id: 4, from: "other", text: "Le quiz de vendredi couvrira tout le chapitre.", time: "Dim 10:01" },
    ],
  },
];

export default function MessagesPage() {
  const [activeId, setActiveId] = useState(contacts[0].id);
  const [allContacts, setAllContacts] = useState(contacts);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeContact = allContacts.find((c) => c.id === activeId)!;

  const filtered = allContacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase())
  );

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    setAllContacts((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              lastMsg: trimmed,
              time,
              messages: [...c.messages, { id: Date.now(), from: "me", text: trimmed, time }],
            }
          : c
      )
    );
    setInput("");
  };

  // Marquer comme lu à l'ouverture
  useEffect(() => {
    setAllContacts((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, unread: 0 } : c))
    );
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeContact?.messages.length]);

  const totalUnread = allContacts.reduce((a, c) => a + c.unread, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar nav */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full z-10">
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/" className="text-2xl font-bold text-indigo-600 tracking-tight">NEKH XËL</Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(({ href, label, icon, active }) => (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <span>{icon}</span>
              <span className="flex-1">{label}</span>
              {label === "Messages" && totalUnread > 0 && (
                <span className="w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {totalUnread}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-gray-100">
          <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">F</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">Fatou Diallo</p>
              <p className="text-xs text-gray-400 truncate">Étudiante</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Zone messagerie */}
      <div className="ml-64 flex-1 flex h-screen">

        {/* Liste contacts */}
        <div className="w-80 bg-white border-r border-gray-100 flex flex-col h-full">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900 mb-3">Messages</h2>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setActiveId(contact.id)}
                className={`w-full flex items-center gap-3 px-5 py-3.5 transition-colors text-left ${
                  activeId === contact.id ? "bg-indigo-50 border-r-2 border-indigo-600" : "hover:bg-gray-50"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className={`w-11 h-11 rounded-full ${contact.avatarBg} flex items-center justify-center text-white font-bold text-base`}>
                    {contact.avatar}
                  </div>
                  {contact.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-sm font-semibold truncate ${activeId === contact.id ? "text-indigo-700" : "text-gray-800"}`}>
                      {contact.name}
                    </span>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{contact.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 truncate">{contact.lastMsg}</p>
                    {contact.unread > 0 && (
                      <span className="ml-2 w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {contact.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Zone de chat */}
        <div className="flex-1 flex flex-col h-full bg-gray-50">
          {/* Header chat */}
          <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 flex-shrink-0">
            <div className="relative">
              <div className={`w-10 h-10 rounded-full ${activeContact.avatarBg} flex items-center justify-center text-white font-bold`}>
                {activeContact.avatar}
              </div>
              {activeContact.online && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">{activeContact.name}</p>
              <p className="text-xs text-gray-400">
                {activeContact.online ? (
                  <span className="text-green-500 font-medium">● En ligne</span>
                ) : (
                  "Hors ligne"
                )}{" "}
                · {activeContact.role}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors" title="Appel vidéo">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M4 8h8a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2z" />
                </svg>
              </button>
              <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors" title="Infos">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {activeContact.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
                {msg.from === "other" && (
                  <div className={`w-8 h-8 rounded-full ${activeContact.avatarBg} flex items-center justify-center text-white font-bold text-sm mr-2 flex-shrink-0 self-end`}>
                    {activeContact.avatar}
                  </div>
                )}
                <div className={`max-w-xs lg:max-w-md xl:max-w-lg`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.from === "me"
                      ? "bg-indigo-600 text-white rounded-br-sm"
                      : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"
                  }`}>
                    {msg.text}
                  </div>
                  <p className={`text-xs text-gray-400 mt-1 ${msg.from === "me" ? "text-right" : "text-left"}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Zone de saisie */}
          <div className="bg-white border-t border-gray-100 px-6 py-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors flex-shrink-0" title="Joindre un fichier">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              <input
                type="text"
                placeholder={`Écrire à ${activeContact.name}…`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-400 text-gray-800"
              />
              <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors flex-shrink-0" title="Emoji">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex-shrink-0"
                title="Envoyer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
