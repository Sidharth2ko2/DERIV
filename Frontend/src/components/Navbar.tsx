import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, Shield, FileText, Settings, Activity,
    LogOut, Search, Menu, X, Moon, Sun
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import GlobalSearch from './GlobalSearch';

const Navbar: React.FC = () => {
    const location = useLocation();
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
            if (e.key === 'Escape') setIsSearchOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const menuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/attacks', icon: Activity, label: 'Attacks' },
        { path: '/audits', icon: FileText, label: 'Audits' },
        { path: '/guardrails', icon: Shield, label: 'Guardrails' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <>
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="fixed top-8 left-0 right-0 z-50 px-6 pointer-events-none"
            >
                <div className="max-w-7xl mx-auto flex items-start justify-between relative">
                    {/* Left: Branding */}
                    <div className="pointer-events-auto">
                        <Link to="/dashboard" className="group block">
                            <div className={`liquid-glass rounded-2xl flex items-center gap-4 transition-all duration-300 premium-shadow
                ${scrolled ? 'px-6 py-4 bg-[rgba(26,26,26,0.85)]' : 'px-7 py-5 bg-[rgba(26,26,26,0.7)]'}
                border border-white/15 shadow-2xl
              `}>
                                <div className="w-14 h-14 bg-gradient-to-br from-[#FF444F] to-[#D32F2F] rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30 transition-transform group-hover:scale-105">
                                    <Shield className="w-8 h-8 text-white" />
                                </div>
                                <div className="hidden lg:block pr-2">
                                    <h1 className="text-2xl font-bold text-white tracking-tight">Deriv Sentinel</h1>
                                    <p className="text-sm text-[#999999] uppercase tracking-wider font-medium mt-1">Security Center</p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Center: Navigation – larger */}
                    <div className="pointer-events-auto absolute left-1/2 -translate-x-1/2 hidden md:block">
                        <div className={`liquid-glass rounded-full transition-all duration-300 premium-shadow border border-white/15 shadow-2xl
              ${scrolled ? 'px-10 py-5 bg-[rgba(26,26,26,0.85)]' : 'px-12 py-6 bg-[rgba(26,26,26,0.7)]'}
            `}>
                            <div className="flex items-center gap-4">
                                {menuItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;

                                    return (
                                        <Link key={item.path} to={item.path}>
                                            <motion.div
                                                whileHover={{ scale: 1.06 }}
                                                whileTap={{ scale: 0.94 }}
                                                className={`flex items-center gap-3 px-8 py-4 rounded-full text-base font-semibold transition-all
                          ${isActive
                                                        ? 'bg-[#FF444F] text-white shadow-lg shadow-red-600/30'
                                                        : 'text-white hover:bg-white/15'
                                                    }`}
                                            >
                                                <Icon className="w-6 h-6" />
                                                <span>{item.label}</span>
                                            </motion.div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="pointer-events-auto">
                        <div className={`liquid-glass rounded-full flex items-center gap-4 transition-all duration-300 premium-shadow border border-white/15 shadow-2xl
              ${scrolled ? 'p-3 bg-[rgba(26,26,26,0.85)]' : 'p-4 bg-[rgba(26,26,26,0.7)]'}
            `}>
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="w-14 h-14 flex items-center justify-center bg-white/5 hover:bg-white/15 rounded-full text-white transition-all group"
                                title="Search (⌘K)"
                            >
                                <Search className="w-6 h-6 group-hover:scale-110" />
                            </button>

                            <div className="w-px h-10 bg-white/15 mx-2"></div>

                            <button
                                onClick={toggleTheme}
                                className="w-14 h-14 flex items-center justify-center bg-white/5 hover:bg-white/15 rounded-full text-white transition-all group"
                                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                            >
                                {theme === 'dark' ? (
                                    <Moon className="w-7 h-7 group-hover:-rotate-12 text-[#FF444F]" />
                                ) : (
                                    <Sun className="w-7 h-7 group-hover:rotate-12 text-amber-400" />
                                )}
                            </button>

                            <button
                                onClick={logout}
                                className="w-14 h-14 flex items-center justify-center bg-white/5 hover:bg-[#FF444F]/90 rounded-full text-white transition-all hover:shadow-lg hover:shadow-red-500/30"
                                title="Logout"
                            >
                                <LogOut className="w-6 h-6" />
                            </button>

                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden w-14 h-14 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white"
                            >
                                {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.header>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-28 left-6 right-6 z-40 md:hidden"
                    >
                        <div className="liquid-glass rounded-2xl p-5 space-y-3 premium-shadow bg-[#1A1A1A]/95 border border-white/10">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <div className={`flex items-center gap-4 px-5 py-4 rounded-xl text-base font-medium
                      ${isActive ? 'bg-[#FF444F] text-white shadow-md shadow-red-500/20' : 'text-white hover:bg-white/10'}`}
                                        >
                                            <Icon className="w-6 h-6" />
                                            <span>{item.label}</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
};

export default Navbar;