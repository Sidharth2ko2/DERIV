import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Shield,
    FileText,
    Settings,
    Activity,
    LogOut,
    Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GlobalSearch from './GlobalSearch';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const { logout } = useAuth();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Keyboard shortcut for search (Cmd+K or Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
            if (e.key === 'Escape') {
                setIsSearchOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const menuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/attacks', icon: Activity, label: 'Attack Monitor' },
        { path: '/audits', icon: FileText, label: 'Audit Results' },
        { path: '/guardrails', icon: Shield, label: 'Guardrails' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <>
            <div className="w-64 h-screen bg-[#151515] border-r border-[#2A2A2A] flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-[#2A2A2A]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#FF444F] to-[#D32F2F] rounded-lg flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">Deriv Sentinel</h1>
                            <p className="text-xs text-[#999999]">Security Center</p>
                        </div>
                    </div>
                </div>

                {/* Search Button */}
                <div className="p-4 border-b border-[#2A2A2A]">
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-[#1A1A1A] hover:bg-[#2A2A2A] rounded-lg text-[#999999] transition-colors"
                    >
                        <Search className="w-5 h-5" />
                        <span className="flex-1 text-left text-sm">Search...</span>
                        <kbd className="px-2 py-1 bg-[#0E0E0E] rounded text-xs">⌘K</kbd>
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link key={item.path} to={item.path}>
                                <motion.div
                                    whileHover={{ x: 4 }}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                            ? 'bg-[#FF444F]/10 text-[#FF444F] border border-[#FF444F]/20'
                                            : 'text-[#C2C2C2] hover:bg-[#1A1A1A]'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-[#2A2A2A]">
                    <motion.button
                        whileHover={{ x: 4 }}
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#C2C2C2] hover:bg-[#1A1A1A] hover:text-[#FF444F] transition-colors w-full"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </motion.button>
                </div>
            </div>

            {/* Global Search Modal */}
            <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
};

export default Sidebar;
