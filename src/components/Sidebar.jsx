import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import {
    LayoutGrid, CalendarDays, UserCheck, Users, Calendar,
    FileText, Shield, LogOut, Menu, X, ChevronRight, Layout,
    ChevronDown, Database
} from 'lucide-react';

const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutGrid, color: 'sunset' },
    {
        label: 'Master Data',
        icon: Database,
        color: 'emerald-600',
        items: [
            { path: '/tahun-ajaran', label: 'Tahun Ajaran', icon: CalendarDays, color: 'sunset' },
            { path: '/events', label: 'Nama Ujian', icon: CalendarDays, color: 'blue-500' },
            { path: '/proctors', label: 'Data Pengawas', icon: UserCheck, color: 'pink-500' },
            { path: '/rooms', label: 'Data Ruang', icon: Layout, color: 'emerald-500' },
        ],
    },
    { path: '/students', label: 'Peserta Ujian', icon: Users, color: 'amber-500' },
    { path: '/exam-schedule', label: 'Jadwal Ujian', icon: Calendar, color: 'violet' },
    { path: '/reports', label: 'Laporan', icon: FileText, color: 'slate-500' },
    { path: '/users', label: 'Kelola Pengguna', icon: Shield, color: 'emerald-500' },
];

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [openGroups, setOpenGroups] = useState({});

    const toggleGroup = (groupLabel) => {
        setOpenGroups(prev => ({
            ...prev,
            [groupLabel]: !prev[groupLabel]
        }));
    };

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const SidebarContent = () => (
        <div className={`flex flex-col h-full bg-white/80 dark:bg-slate-950/90 backdrop-blur-2xl border-r border-slate-100 dark:border-slate-800/50 transition-all duration-300 ${collapsed ? 'w-[80px]' : 'w-[280px]'}`}>
            {/* Brand Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-sunset to-violet rounded-xl flex items-center justify-center shadow-lg shadow-sunset/20 shrink-0">
                        <LayoutGrid className="text-white w-5 h-5" />
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <h1 className="text-sm font-black tracking-tight bg-gradient-to-r from-sunset to-violet bg-clip-text text-transparent whitespace-nowrap">
                                E-Berita Acara
                            </h1>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wide">
                                Admin Panel
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* User Info */}
            {!collapsed && (
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-gradient-to-br from-sunset/20 to-violet/20 rounded-xl flex items-center justify-center text-sunset font-black text-sm shrink-0 border border-sunset/10">
                            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-black text-slate-700 dark:text-slate-200 truncate">{user?.name || 'Administrator'}</p>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Administrator</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {!collapsed && (
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-3 mb-3">
                        Menu Utama
                    </p>
                )}
                {menuItems.map((item) => {
                    const hasSubItems = item.items && item.items.length > 0;
                    const Icon = item.icon;

                    if (hasSubItems) {
                        const isOpen = openGroups[item.label];
                        // Check if any child is active
                        const isAnyChildActive = item.items.some(subItem => isActive(subItem.path));

                        return (
                            <div key={item.label} className="space-y-1">
                                <button
                                    onClick={() => {
                                        if (collapsed) setCollapsed(false);
                                        toggleGroup(item.label);
                                    }}
                                    title={collapsed ? item.label : undefined}
                                    className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 relative
                                        ${isAnyChildActive
                                            ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-600 dark:text-emerald-500 font-black border border-emerald-500/15 shadow-sm'
                                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-700 dark:hover:text-slate-200 font-bold'
                                        }
                                        ${collapsed ? 'justify-center' : ''}
                                    `}
                                >
                                    {isAnyChildActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-500 rounded-r-full" />
                                    )}
                                    <div className="flex items-center gap-3 w-full">
                                        <Icon size={20} className={`shrink-0 transition-transform ${isAnyChildActive ? 'scale-110 text-emerald-600' : 'group-hover:scale-105'}`} />
                                        {!collapsed && (
                                            <span className="text-[13px] tracking-tight truncate flex-1 text-left">{item.label}</span>
                                        )}
                                    </div>
                                    {!collapsed && (
                                        <ChevronDown size={14} className={`shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600' : 'text-slate-400'}`} />
                                    )}
                                </button>

                                {/* Dropdown Items */}
                                {!collapsed && isOpen && (
                                    <div className="pl-11 pr-2 py-1 space-y-1 animate-in slide-in-from-top-2 fade-in duration-200">
                                        {item.items.map((subItem) => {
                                            const active = isActive(subItem.path);
                                            const SubIcon = subItem.icon;
                                            return (
                                                <Link
                                                    key={subItem.path}
                                                    to={subItem.path}
                                                    onClick={() => setMobileOpen(false)}
                                                    className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 
                                                        ${active
                                                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 font-bold border border-emerald-500/10 shadow-sm'
                                                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-700 dark:hover:text-slate-200 font-medium'
                                                        }
                                                    `}
                                                >
                                                    <SubIcon size={16} className={`shrink-0 transition-transform ${active ? 'scale-110' : 'group-hover:scale-105'}`} />
                                                    <span className="text-xs truncate">{subItem.label}</span>
                                                    {active && <ChevronRight size={12} className="ml-auto text-emerald-500/50" />}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    // Normal rendering for single items
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                            title={collapsed ? item.label : undefined}
                            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative
                                ${active
                                    ? 'bg-gradient-to-r from-sunset/10 to-violet/5 text-sunset dark:text-sunset font-black border border-sunset/15 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-700 dark:hover:text-slate-200 font-bold'
                                }
                                ${collapsed ? 'justify-center' : ''}
                            `}
                        >
                            {active && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-sunset rounded-r-full" />
                            )}
                            <Icon size={20} className={`shrink-0 transition-transform ${active ? 'scale-110' : 'group-hover:scale-105'}`} />
                            {!collapsed && (
                                <>
                                    <span className="text-[13px] tracking-tight truncate">{item.label}</span>
                                    {active && <ChevronRight size={14} className="ml-auto text-sunset/50" />}
                                </>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800/50 space-y-2">
                <div className={`flex ${collapsed ? 'flex-col' : 'flex-row'} items-center gap-2`}>
                    <ThemeToggle className="h-10 w-10 shrink-0" />
                    {!collapsed && (
                        <button
                            onClick={logout}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-sunset hover:border-sunset/30 hover:bg-sunset/5 transition-all font-bold text-xs active:scale-95"
                        >
                            <LogOut size={15} />
                            Keluar
                        </button>
                    )}
                    {collapsed && (
                        <button
                            onClick={logout}
                            title="Keluar"
                            className="h-10 w-10 flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:text-sunset hover:border-sunset/30 hover:bg-sunset/5 transition-all active:scale-95"
                        >
                            <LogOut size={15} />
                        </button>
                    )}
                </div>
                {/* Collapse toggle - desktop only */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:flex w-full items-center justify-center gap-2 py-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-[11px] font-bold"
                >
                    <ChevronRight size={14} className={`transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} />
                    {!collapsed && <span>Perkecil</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile hamburger */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 h-11 w-11 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-lg hover:shadow-xl transition-all active:scale-90"
            >
                <Menu size={20} />
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="relative h-full w-fit animate-in slide-in-from-left duration-300">
                        <SidebarContent />
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="absolute top-4 right-[-48px] h-10 w-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-xl flex items-center justify-center text-slate-500 border border-slate-200 dark:border-slate-800"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <div className="hidden lg:block h-screen sticky top-0 shrink-0">
                <SidebarContent />
            </div>
        </>
    );
};

export default Sidebar;
