"use client";

import React, { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { getAdminData, updateLeadStatus, deleteLead, logout, updateAdminPassword, getClientsWithResponses, addClient, sendNextForm } from "../actions";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Download, 
  Trash2,
  TrendingUp,
  TrendingDown,
  MousePointerClick,
  UserPlus,
  RefreshCw,
  Sun,
  Moon,
  Search,
  Eye,
  X,
  Bell,
  LogOut,
  BarChart2,
  Key,
  Menu
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

type Lead = {
  id: string; // uuid
  name: string;
  email: string;
  phone: string;
  service?: string;
  budget?: string;
  message: string;
  status: string;
  created_at: string;
};

type Visit = {
  id: string; // uuid
  page: string;
  referrer: string;
  visited_at: string;
};

type Client = {
  id: string;
  email: string;
  name: string;
  token: string;
  status: string;
  created_at: string;
};

type OnboardingResponse = {
  client_id: string;
  form_type: string;
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  
  const [clients, setClients] = useState<Client[]>([]);
  const [responses, setResponses] = useState<OnboardingResponse[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  
  // Theme state
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Header additions
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [timeAgo, setTimeAgo] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Settings additions
  const [newPassword, setNewPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");

  useEffect(() => {
    const match = document.cookie.match(new RegExp('(^| )recolt-theme=([^;]+)'));
    if (match && (match[2] === 'dark' || match[2] === 'light')) {
      setTheme(match[2] as "dark" | "light");
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.cookie = `recolt-theme=${newTheme}; path=/; max-age=31536000`;
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminData();
      const onboardingResponse = await getClientsWithResponses();
      if (!response.success) {
        setError(String(response.error));
        setConnected(false);
        setLoading(false);
        return;
      }
      setLeads(response.leads);
      setVisits(response.visits);
      if (onboardingResponse.success) {
        setClients(onboardingResponse.clients);
        setResponses(onboardingResponse.responses);
      }
      setConnected(true);
      setLastUpdated(new Date());
      setTimeAgo(0);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to fetch data from Supabase.");
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up Realtime subscriptions for immediate updates
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase.channel('admin-dashboard')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'visits' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setVisits(prev => [...prev, payload.new as Visit]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLeads(prev => [payload.new as Lead, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setLeads(prev => prev.map(l => l.id === payload.new.id ? payload.new as Lead : l));
            setSelectedLead(prev => prev?.id === payload.new.id ? payload.new as Lead : prev);
          } else if (payload.eventType === 'DELETE') {
            setLeads(prev => prev.filter(l => l.id !== payload.old.id));
            setSelectedLead(prev => prev?.id === payload.old.id ? null : prev);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
    if (selectedLead?.id === id) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
    try {
      await updateLeadStatus(id, newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    setLeads(leads.filter(lead => lead.id !== id));
    if (selectedLead?.id === id) setSelectedLead(null);
    try {
      await deleteLead(id);
    } catch (error) {
      console.error("Error deleting lead:", error);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    const res = await updateAdminPassword(newPassword);
    if (res.success) {
      setPasswordStatus("Password updated successfully.");
    } else {
      setPasswordStatus("Error updating password.");
    }
    setNewPassword("");
    setTimeout(() => setPasswordStatus(""), 4000);
  };

  const exportCSV = () => {
    const headers = ["Name,Email,Phone,Service,Budget,Message,Date,Status"];
    const rows = leads.map(lead => {
      const formattedDate = new Date(lead.created_at).toLocaleString();
      return `"${lead.name}","${lead.email}","${lead.phone}","${lead.service || ''}","${lead.budget || ''}","${lead.message.replace(/"/g, '""')}","${formattedDate}","${lead.status}"`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "recolt_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalVisits = visits.length;
  const totalLeads = leads.length;
  const newLeadsCount = leads.filter((l) => l.status?.toLowerCase() === "new").length;
  const conversionRate = totalVisits > 0 ? ((totalLeads / totalVisits) * 100).toFixed(1) + "%" : "0%";

  const getRecentChartData = () => {
    const dataMap: Record<string, number> = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { weekday: "short" });
      dataMap[dateStr] = 0;
    }
    visits.forEach((v) => {
      const dateStr = new Date(v.visited_at).toLocaleDateString("en-US", { weekday: "short" });
      if (dataMap[dateStr] !== undefined) {
        dataMap[dateStr]++;
      }
    });
    return Object.keys(dataMap).map((key) => ({ name: key, visits: dataMap[key] }));
  };

  const getAnalyticsChartData = (type: "visits" | "leads") => {
    const dataMap: Record<string, number> = {};
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dataMap[dateStr] = 0;
    }
    const source = type === "visits" ? visits : leads;
    source.forEach((item) => {
      const dateKey = type === "visits" ? (item as Visit).visited_at : (item as Lead).created_at;
      const dateStr = new Date(dateKey).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (dataMap[dateStr] !== undefined) {
        dataMap[dateStr]++;
      }
    });
    return Object.keys(dataMap).map((key) => ({ name: key, count: dataMap[key] }));
  };

  const getTopReferrers = () => {
    const counts: Record<string, number> = {};
    visits.forEach(v => {
      const ref = v.referrer === "direct" || !v.referrer ? "Direct Traffic" : v.referrer;
      counts[ref] = (counts[ref] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  };

  const chartData = getRecentChartData();
  const recentLeads = leads.slice(0, 5);
  const unreadLeads = leads.filter(l => l.status?.toLowerCase() === "new").slice(0, 5);
  const topReferrers = getTopReferrers();

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const StatusBadge = ({ status, id }: { status: string, id: string }) => {
    const s = status?.toLowerCase() || 'new';
    
    let colorClass = "";
    if (s === 'new') colorClass = "bg-[#00C9A7]/10 text-[#00C9A7] border-[#00C9A7]/20";
    else if (s === 'in progress') colorClass = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    else colorClass = "bg-black/5 text-black/60 border-black/10 dark:bg-white/5 dark:text-white/60 dark:border-white/10";

    return (
      <select 
        value={status || 'New'}
        onChange={(e) => handleStatusChange(id, e.target.value)}
        className={`px-3 py-1 text-xs font-medium border rounded-full outline-none appearance-none cursor-pointer transition-all duration-300 ${colorClass}`}
      >
        <option value="New" className="bg-white dark:bg-[#0c0c0c] text-black dark:text-white">New</option>
        <option value="In Progress" className="bg-white dark:bg-[#0c0c0c] text-black dark:text-white">In Progress</option>
        <option value="Closed" className="bg-white dark:bg-[#0c0c0c] text-black dark:text-white">Closed</option>
      </select>
    );
  };

  const cardClasses = "bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 rounded-2xl p-6 transition-all duration-300 shadow-sm dark:shadow-none hover:border-[#00C9A7]/50 hover:shadow-[0_0_15px_rgba(0,201,167,0.15)] relative overflow-hidden z-10";

  return (
    <div className="flex h-screen bg-[#f5f5f5] dark:bg-[#080808] text-[#0a0a0a] dark:text-white font-[family-name:var(--font-geist-sans)] selection:bg-[#00C9A7]/30 selection:text-black dark:selection:text-white transition-colors duration-300 relative">
        
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-0" style={{ backgroundImage: 'radial-gradient(#000000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute inset-0 z-0 opacity-0 dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

        {/* MOBILE SIDEBAR (Drawer) */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
              onClick={() => setIsSidebarOpen(false)}
            />
            {/* Drawer */}
            <aside className="relative w-64 max-w-[80vw] bg-white dark:bg-[#0c0c0c] h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300 border-r border-black/10 dark:border-white/10">
              <div className="p-6 h-20 flex items-center justify-between border-b border-black/10 dark:border-white/10">
                <span className="font-vintage text-2xl font-bold tracking-tight">
                  Recolt<span className="text-[#00C9A7]">.</span>
                </span>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                {[
                  { name: "Dashboard", icon: LayoutDashboard },
                  { name: "Leads", icon: Users },
                  { name: "Onboarding", icon: UserPlus },
                  { name: "Analytics", icon: BarChart2 },
                  { name: "Settings", icon: Settings },
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => { setActiveTab(item.name); setIsSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${
                      activeTab === item.name 
                        ? "text-[#00C9A7] bg-[#00C9A7]/10" 
                        : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${activeTab === item.name ? "text-[#00C9A7]" : "text-black/40 dark:text-white/40"}`} />
                    {item.name}
                  </button>
                ))}
              </nav>

              <div className="p-6 border-t border-black/10 dark:border-white/10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00FFD1] flex items-center justify-center text-sm font-bold text-[#000000] shadow-[0_0_15px_rgba(0,255,209,0.3)] shrink-0">
                    ZA
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-sm font-medium truncate">Recolt Admin</div>
                    <div className="text-xs text-black/40 dark:text-white/40 truncate">harshith557@gmail.com</div>
                  </div>
                </div>
                <button 
                  onClick={() => logout()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-black/60 dark:text-white/60 hover:text-red-500 dark:hover:text-red-500 bg-black/5 dark:bg-white/5 hover:bg-red-500/10 dark:hover:bg-red-500/10 rounded-xl transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:flex w-64 border-r border-black/10 dark:border-white/10 bg-white dark:bg-[#0c0c0c] flex-col transition-colors duration-300 z-10 relative shadow-xl">
          <div className="p-6 h-20 flex items-center justify-between border-b border-black/10 dark:border-white/10">
            <span className="font-vintage text-2xl font-bold tracking-tight">
              Recolt<span className="text-[#00C9A7]">.</span>
            </span>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 rounded-lg bg-black/5 dark:bg-white/5">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="flex-1 py-6 px-4 space-y-2">
            {[
              { name: "Dashboard", icon: LayoutDashboard },
              { name: "Leads", icon: Users },
              { name: "Onboarding", icon: UserPlus },
              { name: "Analytics", icon: BarChart2 },
              { name: "Settings", icon: Settings },
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${
                  activeTab === item.name 
                    ? "text-[#00C9A7]" 
                    : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <item.icon className={`w-5 h-5 ${activeTab === item.name ? "text-[#00C9A7]" : "text-black/40 dark:text-white/40"}`} />
                {item.name}
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-black/10 dark:border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00FFD1] flex items-center justify-center text-sm font-bold text-[#000000] shadow-[0_0_15px_rgba(0,255,209,0.3)] shrink-0">
                ZA
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-medium truncate">Recolt Admin</div>
                <div className="text-xs text-black/40 dark:text-white/40 truncate">harshith557@gmail.com</div>
              </div>
            </div>
            <button 
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-black/60 dark:text-white/60 hover:text-red-500 dark:hover:text-red-500 bg-black/5 dark:bg-white/5 hover:bg-red-500/10 dark:hover:bg-red-500/10 rounded-xl transition-all duration-300"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto relative z-10 w-full">
          <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6 md:space-y-10">
            
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="font-[family-name:var(--font-syne)] text-2xl sm:text-3xl font-bold tracking-tight transition-all duration-300">
                    {activeTab} Overview
                  </h1>
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-black/40 dark:text-white/40 text-xs sm:text-sm">Welcome back to the Recolt dashboard.</p>
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded text-black/40 dark:text-white/40 border border-black/5 dark:border-white/5 whitespace-nowrap">
                    Updated: {timeAgo}s ago
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4 flex-wrap w-full md:w-auto">
                
                {/* Notifications Bell */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2.5 rounded-lg bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-300"
                  >
                    <Bell className="w-4 h-4" />
                    {newLeadsCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#121212] animate-pulse"></span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 rounded-2xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2">
                      <h4 className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">Unread Leads</h4>
                      {unreadLeads.length > 0 ? unreadLeads.map(l => (
                        <div key={l.id} className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl cursor-pointer transition-colors" onClick={() => { setSelectedLead(l); setShowNotifications(false); }}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-sm">{l.name}</span>
                            <span className="text-[10px] text-[#00C9A7] bg-[#00C9A7]/10 px-1.5 py-0.5 rounded">New</span>
                          </div>
                          <div className="text-xs text-black/60 dark:text-white/60 truncate">{l.message}</div>
                        </div>
                      )) : <div className="p-4 text-center text-sm text-black/40 dark:text-white/40">No new leads</div>}
                    </div>
                  )}
                </div>

                <button
                  onClick={toggleTheme}
                  className="p-2.5 rounded-lg bg-white dark:bg-[#121212] border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-300"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button 
                  onClick={fetchData}
                  disabled={loading}
                  className="flex items-center gap-2 bg-white dark:bg-[#121212] hover:bg-black/5 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                {(activeTab === "Dashboard" || activeTab === "Leads" || activeTab === "Analytics") && (
                  <button 
                    onClick={exportCSV}
                    className="flex items-center gap-2 bg-[#00C9A7] hover:bg-[#00C9A7]/90 text-black px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(0,201,167,0.2)]"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                )}
              </div>
            </header>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                {error}
              </div>
            )}

            {loading && leads.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-black/40 dark:text-white/40 flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Loading...
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                {activeTab === "Dashboard" && (
                  <div className="space-y-10">
                    {/* STAT CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                      <div className={cardClasses}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center">
                            <MousePointerClick className="w-5 h-5 text-black/60 dark:text-white/60" />
                          </div>
                          <div className="text-sm font-medium text-black/50 dark:text-white/50">Total Visits</div>
                        </div>
                        <div className="font-[family-name:var(--font-syne)] text-3xl font-bold">{totalVisits.toLocaleString()}</div>
                      </div>

                      <div className={cardClasses}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center">
                            <Users className="w-5 h-5 text-black/60 dark:text-white/60" />
                          </div>
                          <div className="text-sm font-medium text-black/50 dark:text-white/50">Total Leads</div>
                        </div>
                        <div className="font-[family-name:var(--font-syne)] text-3xl font-bold">{totalLeads.toLocaleString()}</div>
                      </div>

                      <div className={cardClasses}>
                        <div className="flex items-center gap-3 mb-4 relative">
                          <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center">
                            <UserPlus className="w-5 h-5 text-[#00C9A7]" />
                          </div>
                          <div className="text-sm font-medium text-black/50 dark:text-white/50">New Leads</div>
                        </div>
                        <div className="font-[family-name:var(--font-syne)] text-3xl font-bold relative text-[#00C9A7]">{newLeadsCount.toLocaleString()}</div>
                      </div>

                      <div className={cardClasses}>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-black/60 dark:text-white/60" />
                          </div>
                          <div className="text-sm font-medium text-black/50 dark:text-white/50">Conversion Rate</div>
                        </div>
                        <div className="font-[family-name:var(--font-syne)] text-3xl font-bold">{conversionRate}</div>
                      </div>
                    </div>

                    {/* CHART & LEADS ROW */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* CHART */}
                      <div className="lg:col-span-3 bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none transition-all duration-300">
                        <h3 className="font-[family-name:var(--font-syne)] text-lg font-semibold mb-6">Visits (Last 7 Days)</h3>
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} vertical={false} />
                              <XAxis 
                                dataKey="name" 
                                stroke={theme === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} 
                                axisLine={false} 
                                tickLine={false}
                                tick={{ fontSize: 12 }}
                                dy={10}
                              />
                              <YAxis 
                                stroke={theme === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} 
                                axisLine={false} 
                                tickLine={false}
                                tick={{ fontSize: 12 }}
                                dx={-10}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: theme === "dark" ? '#0c0c0c' : '#ffffff', 
                                  borderColor: theme === "dark" ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                                  borderRadius: '12px',
                                  color: theme === "dark" ? 'white' : 'black',
                                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                }} 
                                itemStyle={{ color: '#00C9A7' }}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="visits" 
                                stroke="#00C9A7" 
                                strokeWidth={3}
                                dot={{ r: 4, fill: theme === "dark" ? '#080808' : '#ffffff', stroke: '#00C9A7', strokeWidth: 2 }}
                                activeDot={{ r: 6, fill: '#00C9A7', stroke: theme === "dark" ? '#080808' : '#ffffff', strokeWidth: 2 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* TABLE */}
                      <div className="lg:col-span-3 bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 rounded-2xl p-0 overflow-hidden shadow-sm dark:shadow-none transition-all duration-300">
                        <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                          <h3 className="font-[family-name:var(--font-syne)] text-lg font-semibold">Recent Leads</h3>
                          <button onClick={() => setActiveTab('Leads')} className="text-sm text-[#00C9A7] hover:underline cursor-pointer font-medium">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="text-xs text-black/40 dark:text-white/40 uppercase bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/5">
                              <tr>
                                <th className="px-6 py-4 font-medium">Name</th>
                                <th className="px-6 py-4 font-medium">Service</th>
                                <th className="px-6 py-4 font-medium">Contact</th>
                                <th className="px-6 py-4 font-medium">Message</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recentLeads.length === 0 ? (
                                <tr>
                                  <td colSpan={7} className="px-6 py-8 text-center text-black/40 dark:text-white/40">No recent leads found.</td>
                                </tr>
                              ) : recentLeads.map((lead, idx) => (
                                <tr key={lead.id} className={`border-b border-black/5 dark:border-white/5 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors ${idx % 2 === 0 ? 'bg-black/[0.01] dark:bg-white/[0.01]' : ''}`}>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-[#00C9A7]/20 flex items-center justify-center text-[#00C9A7] font-bold text-xs shrink-0 uppercase">
                                        {lead.name.charAt(0)}
                                      </div>
                                      <span className="font-medium truncate max-w-[150px]">{lead.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    {lead.service ? (
                                      <span className="text-xs bg-black/5 dark:bg-white/5 text-black/80 dark:text-white/80 px-2 py-1 rounded-md whitespace-nowrap">{lead.service}</span>
                                    ) : <span className="text-black/30 dark:text-white/30">-</span>}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-sm">{lead.email}</div>
                                    <div className="text-xs text-black/40 dark:text-white/40 mt-0.5">{lead.phone}</div>
                                  </td>
                                  <td className="px-6 py-4 text-black/60 dark:text-white/60">
                                    <div className="max-w-[200px]">
                                      {lead.message.length > 40 ? lead.message.substring(0, 40) + "..." : lead.message}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-black/60 dark:text-white/60 whitespace-nowrap">
                                    {new Date(lead.created_at).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-4">
                                    <StatusBadge status={lead.status} id={lead.id} />
                                  </td>
                                  <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                                    <button 
                                      onClick={() => setSelectedLead(lead)}
                                      className="p-2 text-black/40 dark:text-white/40 hover:text-[#00C9A7] hover:bg-[#00C9A7]/10 rounded-lg transition-colors cursor-pointer"
                                      title="View Details"
                                    >
                                      <Eye className="w-4 h-4" />
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
                )}

                {activeTab === "Leads" && (
                  <div className="bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 rounded-2xl p-0 overflow-hidden shadow-sm dark:shadow-none transition-all duration-300">
                    <div className="p-6 border-b border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <h3 className="font-[family-name:var(--font-syne)] text-lg font-semibold">All Leads</h3>
                        <span className="text-xs px-2 py-1 bg-black/5 dark:bg-white/5 rounded-md text-black/60 dark:text-white/60 font-medium">
                          {leads.length} total
                        </span>
                      </div>
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30" />
                        <input 
                          type="text" 
                          placeholder="Search by name or email..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 pr-4 py-2 bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl text-sm outline-none focus:border-[#00C9A7]/50 transition-colors w-full sm:w-64"
                        />
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs text-black/40 dark:text-white/40 uppercase bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/5">
                          <tr>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Service</th>
                            <th className="px-6 py-4 font-medium">Budget</th>
                            <th className="px-6 py-4 font-medium">Contact</th>
                            <th className="px-6 py-4 font-medium">Message</th>
                            <th className="px-6 py-4 font-medium">Date</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLeads.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="px-6 py-12 text-center">
                                <div className="text-black/40 dark:text-white/40 mb-2">No leads found matching your search.</div>
                                {searchQuery && (
                                  <button onClick={() => setSearchQuery("")} className="text-[#00C9A7] text-sm hover:underline">
                                    Clear search
                                  </button>
                                )}
                              </td>
                            </tr>
                          ) : filteredLeads.map((lead, idx) => (
                            <tr key={lead.id} className={`border-b border-black/5 dark:border-white/5 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors ${idx % 2 === 0 ? 'bg-black/[0.01] dark:bg-white/[0.01]' : ''}`}>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#00C9A7]/20 flex items-center justify-center text-[#00C9A7] font-bold text-xs shrink-0 uppercase">
                                    {lead.name.charAt(0)}
                                  </div>
                                  <span className="font-medium truncate max-w-[150px]">{lead.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {lead.service ? (
                                  <span className="text-[11px] bg-[#00C9A7]/10 text-[#00C9A7] px-2 py-1 rounded-md whitespace-nowrap">{lead.service}</span>
                                ) : <span className="text-black/30 dark:text-white/30">-</span>}
                              </td>
                              <td className="px-6 py-4">
                                {lead.budget ? (
                                  <span className="text-[11px] bg-black/5 dark:bg-white/10 text-black/60 dark:text-white/60 px-2 py-1 rounded-md whitespace-nowrap">{lead.budget}</span>
                                ) : <span className="text-black/30 dark:text-white/30">-</span>}
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm">{lead.email}</div>
                                <div className="text-xs text-black/40 dark:text-white/40 mt-0.5">{lead.phone}</div>
                              </td>
                              <td className="px-6 py-4 text-black/60 dark:text-white/60">
                                <div className="max-w-[150px]">
                                  {lead.message.length > 30 ? lead.message.substring(0, 30) + "..." : lead.message}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-black/60 dark:text-white/60 whitespace-nowrap">
                                {new Date(lead.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4">
                                <StatusBadge status={lead.status} id={lead.id} />
                              </td>
                              <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                                <button 
                                  onClick={() => setSelectedLead(lead)}
                                  className="p-2 text-black/40 dark:text-white/40 hover:text-[#00C9A7] hover:bg-[#00C9A7]/10 rounded-lg transition-colors cursor-pointer"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(lead.id)}
                                  className="p-2 text-black/40 dark:text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Lead"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === "Onboarding" && (
                  <div className="space-y-6">
                    <div className="bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none transition-all duration-300">
                      <h3 className="font-[family-name:var(--font-syne)] text-lg font-semibold mb-6">Invite New Client</h3>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <input type="text" placeholder="Client Name" value={inviteName} onChange={e => setInviteName(e.target.value)} className="flex-1 bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#00C9A7]/50" />
                        <input type="email" placeholder="Client Email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="flex-1 bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#00C9A7]/50" />
                        <button disabled={inviteLoading || !inviteEmail} onClick={async () => {
                          setInviteLoading(true);
                          const res = await addClient(inviteEmail, inviteName);
                          if(res.success) {
                            setInviteEmail(""); setInviteName(""); fetchData();
                          } else alert(res.error);
                          setInviteLoading(false);
                        }} className="bg-[#00C9A7] text-black font-bold px-6 py-2.5 rounded-xl disabled:opacity-50">
                          {inviteLoading ? "Sending..." : "Send Invite"}
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 rounded-2xl p-0 overflow-hidden shadow-sm dark:shadow-none transition-all duration-300">
                      <div className="p-6 border-b border-black/5 dark:border-white/5">
                        <h3 className="font-[family-name:var(--font-syne)] text-lg font-semibold">Active Clients</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-black/40 dark:text-white/40 uppercase bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/5">
                            <tr>
                              <th className="px-6 py-4 font-medium">Client</th>
                              <th className="px-6 py-4 font-medium">Completed Forms</th>
                              <th className="px-6 py-4 font-medium">Status</th>
                              <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {clients.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-black/40 dark:text-white/40">No clients yet.</td>
                              </tr>
                            ) : clients.map(client => {
                              const clientResponses = responses.filter(r => r.client_id === client.id).map(r => r.form_type);
                              const allForms = ["welcome", "project-brief", "brand-assets", "terms", "feedback"];
                              return (
                                <tr key={client.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors">
                                  <td className="px-6 py-4">
                                    <div className="font-medium">{client.name || "Unknown"}</div>
                                    <div className="text-xs text-black/40 dark:text-white/40">{client.email}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                      {allForms.map(f => (
                                        <span key={f} className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${clientResponses.includes(f) ? 'bg-[#00C9A7]/10 text-[#00C9A7]' : 'bg-black/5 dark:bg-white/5 text-black/30 dark:text-white/30'}`}>
                                          {f.replace("-", " ")}
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-xs bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md capitalize">{client.status}</span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <button onClick={async (e) => {
                                      const btn = e.currentTarget;
                                      btn.disabled = true;
                                      btn.innerText = "Sending...";
                                      const res = await sendNextForm(client.id);
                                      if(res.success) {
                                        alert("Sent next form: " + res.nextForm);
                                      } else {
                                        alert(res.error);
                                      }
                                      btn.disabled = false;
                                      btn.innerText = "Send Next Form";
                                    }} className="text-xs font-medium text-[#00C9A7] hover:underline cursor-pointer disabled:opacity-50">
                                      Send Next Form
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "Analytics" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none transition-all duration-300">
                        <h3 className="font-[family-name:var(--font-syne)] text-lg font-semibold mb-6">Leads (Last 30 Days)</h3>
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getAnalyticsChartData("leads")}>
                              <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} vertical={false} />
                              <XAxis dataKey="name" stroke={theme === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                              <YAxis stroke={theme === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                              <Tooltip contentStyle={{ backgroundColor: theme === "dark" ? '#0c0c0c' : '#ffffff', borderColor: theme === "dark" ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: '12px' }} />
                              <Bar dataKey="count" fill="#00C9A7" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none transition-all duration-300">
                        <h3 className="font-[family-name:var(--font-syne)] text-lg font-semibold mb-6">Visits (Last 30 Days)</h3>
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getAnalyticsChartData("visits")}>
                              <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} vertical={false} />
                              <XAxis dataKey="name" stroke={theme === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                              <YAxis stroke={theme === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                              <Tooltip contentStyle={{ backgroundColor: theme === "dark" ? '#0c0c0c' : '#ffffff', borderColor: theme === "dark" ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: '12px' }} />
                              <Bar dataKey="count" fill="#4F9EFF" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none max-w-xl transition-all duration-300">
                      <h3 className="font-[family-name:var(--font-syne)] text-lg font-semibold mb-6">Top Referrer Sources</h3>
                      <div className="space-y-4">
                        {topReferrers.length === 0 ? (
                          <div className="text-sm text-black/40 dark:text-white/40">No referrer data available.</div>
                        ) : topReferrers.map(([source, count], i) => (
                          <div key={source} className="flex items-center justify-between p-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-xl border border-black/5 dark:border-white/5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-xs font-bold text-black/50 dark:text-white/50">
                                {i + 1}
                              </div>
                              <span className="font-medium text-sm truncate max-w-[200px]">{source}</span>
                            </div>
                            <div className="font-semibold">{count} <span className="text-xs text-black/40 dark:text-white/40 font-normal">visits</span></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "Settings" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none transition-all duration-300">
                      <h3 className="font-[family-name:var(--font-syne)] text-lg font-semibold mb-6">Database Connection</h3>
                      
                      <div className="flex items-center justify-between p-4 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-xl mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center">
                            <Settings className="w-5 h-5 text-black/60 dark:text-white/60" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">Supabase Link</div>
                            <div className="text-xs text-black/40 dark:text-white/40">{process.env.NEXT_PUBLIC_SUPABASE_URL || 'Configured via .env'}</div>
                          </div>
                        </div>
                        {connected ? (
                          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-xs font-medium text-green-600 dark:text-green-500">Connected</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="text-xs font-medium text-red-600 dark:text-red-500">Disconnected</span>
                          </div>
                        )}
                      </div>

                      <h3 className="font-[family-name:var(--font-syne)] text-lg font-semibold mb-6 mt-8">Admin Profile</h3>
                      
                      <div className="space-y-4 mb-8">
                        <div>
                          <label className="block text-xs font-medium text-black/40 dark:text-white/40 mb-1">Email Address</label>
                          <input 
                            type="email" 
                            value="harshith557@gmail.com" 
                            readOnly 
                            className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-black/60 dark:text-white/60 outline-none cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-black/40 dark:text-white/40 mb-1">Role</label>
                          <input 
                            type="text" 
                            value="Super Admin" 
                            readOnly 
                            className="w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-black/60 dark:text-white/60 outline-none cursor-not-allowed"
                          />
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => logout()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all duration-300"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out of Admin
                      </button>
                    </div>

                    <div className="bg-white dark:bg-[#121212] border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none transition-all duration-300">
                      <h3 className="font-[family-name:var(--font-syne)] text-lg font-semibold mb-6">Security Settings</h3>
                      <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-black/40 dark:text-white/40 mb-1">Update Admin Password</label>
                          <div className="relative">
                            <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30" />
                            <input 
                              type="password" 
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Enter new password" 
                              required
                              className="w-full pl-9 pr-4 py-2.5 bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-lg text-sm text-black dark:text-white outline-none focus:border-[#00C9A7]/50 transition-colors"
                            />
                          </div>
                        </div>
                        <button 
                          type="submit"
                          className="w-full bg-[#00C9A7] hover:bg-[#00C9A7]/90 text-black font-bold py-2.5 rounded-lg text-sm transition-all duration-300 shadow-[0_0_15px_rgba(0,201,167,0.2)]"
                        >
                          Save New Password
                        </button>
                        {passwordStatus && (
                          <p className={`text-sm text-center font-medium ${passwordStatus.includes("success") ? "text-green-500" : "text-red-500"}`}>
                            {passwordStatus}
                          </p>
                        )}
                      </form>
                      <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-500 text-xs leading-relaxed">
                        <strong>Note:</strong> Updating your password will write to the `.env.local` file. If running in a production environment (like Vercel), you must update environment variables through their dashboard instead.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </main>
        
        {/* LEAD DETAILS MODAL */}
        {selectedLead && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-white dark:bg-[#121212] rounded-2xl border border-black/10 dark:border-white/10 p-6 shadow-2xl relative">
              <button 
                onClick={() => setSelectedLead(null)}
                className="absolute top-4 right-4 p-2 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-bold font-[family-name:var(--font-syne)] mb-6 pr-8">Lead Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <div className="text-xs font-medium text-black/40 dark:text-white/40 mb-1 uppercase tracking-wider">Name</div>
                  <div className="font-medium text-lg">{selectedLead.name}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-black/40 dark:text-white/40 mb-1 uppercase tracking-wider">Date Received</div>
                  <div className="font-medium">{new Date(selectedLead.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-black/40 dark:text-white/40 mb-1 uppercase tracking-wider">Email</div>
                  <a href={`mailto:${selectedLead.email}`} className="font-medium text-[#00C9A7] hover:underline font-system tracking-normal">{selectedLead.email}</a>
                </div>
                <div>
                  <div className="text-xs font-medium text-black/40 dark:text-white/40 mb-1 uppercase tracking-wider">Phone</div>
                  <a href={`tel:${selectedLead.phone}`} className="font-medium text-[#00C9A7] hover:underline">{selectedLead.phone}</a>
                </div>
                
                {selectedLead.service && (
                  <div>
                    <div className="text-xs font-medium text-black/40 dark:text-white/40 mb-1 uppercase tracking-wider">Service Requested</div>
                    <div className="inline-flex px-3 py-1 bg-[#00C9A7]/10 text-[#00C9A7] border border-[#00C9A7]/20 rounded-full text-sm font-medium">
                      {selectedLead.service}
                    </div>
                  </div>
                )}
                
                {selectedLead.budget && (
                  <div>
                    <div className="text-xs font-medium text-black/40 dark:text-white/40 mb-1 uppercase tracking-wider">Budget</div>
                    <div className="inline-flex px-3 py-1 bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-full text-sm font-medium">
                      {selectedLead.budget}
                    </div>
                  </div>
                )}
                
                <div className="md:col-span-2">
                  <div className="text-xs font-medium text-black/40 dark:text-white/40 mb-1 uppercase tracking-wider">Status</div>
                  <StatusBadge status={selectedLead.status} id={selectedLead.id} />
                </div>
              </div>
              
              <div>
                <div className="text-xs font-medium text-black/40 dark:text-white/40 mb-2 uppercase tracking-wider">Message / Project Details</div>
                <div className="p-4 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-xl whitespace-pre-wrap text-sm leading-relaxed text-black/80 dark:text-white/80">
                  {selectedLead.message}
                </div>
              </div>
            </div>
          </div>
        )}

    </div>
  );
}
