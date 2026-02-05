import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Shield,
    FileText,
    Settings,
    Activity,
    LogOut,
    Moon,
    Sun,
    Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import GlobalSearch from './GlobalSearch';

export const NAVBAR_HEIGHT = 72;

const Navbar: React.FC = () => {
    const location = useLocation();
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const [scrolled, setScrolled] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleConfirmLogout = () => {
        setShowLogoutModal(false);
        logout();
    };

    const handleCancelLogout = () => {
        setShowLogoutModal(false);
    };

    /* SCROLL EFFECT */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    /* SEARCH SHORTCUT */
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
            if (e.key === 'Escape') {
                setIsSearchOpen(false);
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
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
            {/* NAVBAR */}
            <header
                className="fixed top-0 left-0 right-0 z-50"
                style={{
                    height: NAVBAR_HEIGHT,
                    backdropFilter: 'blur(18px)',
                    WebkitBackdropFilter: 'blur(18px)',
                    background:
                        theme === 'dark'
                            ? 'rgba(18,18,18,0.65)'
                            : 'rgba(255,255,255,0.65)',
                    borderBottom: scrolled
                        ? '1px solid rgba(255,255,255,0.12)'
                        : '1px solid transparent',
                }}
            >
                <div className="h-full max-w-[1600px] mx-auto px-6 flex items-center justify-between">
                    {/* LEFT — BRAND */}
                    <Link to="/dashboard" className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#FF444F] to-[#D32F2F] rounded-xl flex items-center justify-center shadow-lg">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-semibold leading-tight">
                                Deriv Sentinel
                            </h1>
                            <p className="text-xs opacity-60">
                                Security Center
                            </p>
                        </div>
                    </Link>

                    {/* CENTER — NAV */}
                    <nav className="hidden md:flex items-center gap-4">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = location.pathname === item.path;

                            return (
                                <Link key={item.path} to={item.path}>
                                    <div
                                        className={`
                                            nav-pill-custom
                                            flex items-center gap-4
                                            rounded-full
                                            transition-all duration-200
                                            ${active
                                                ? 'bg-[#FF444F] text-white shadow-lg shadow-red-500/30'
                                                : theme === 'dark'
                                                    ? 'hover:bg-white/10'
                                                    : 'hover:bg-black/5'
                                            }
                                        `}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-[15px] font-medium tracking-wide">
                                            {item.label}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* RIGHT — ACTIONS */}
                    <div className="flex items-center gap-3">
                        {/* SEARCH */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className={`
                                w-11 h-11 rounded-xl
                                flex items-center justify-center
                                transition cursor-pointer
                                ${theme === 'dark'
                                    ? 'hover:bg-white/10'
                                    : 'hover:bg-black/5'
                                }
                            `}
                            aria-label="Search"
                        >
                            <Search className="w-5 h-5" />
                        </button>

                        {/* THEME */}
                        <button
                            onClick={toggleTheme}
                            className={`
                                w-11 h-11 rounded-xl
                                flex items-center justify-center
                                transition
                                ${theme === 'dark'
                                    ? 'hover:bg-white/10'
                                    : 'hover:bg-black/5'
                                }
                            `}
                        >
                            {theme === 'dark' ? (
                                <Moon className="w-5 h-5 text-[#FF444F]" />
                            ) : (
                                <Sun className="w-5 h-5 text-amber-400" />
                            )}
                        </button>

                        {/* LOGOUT */}
                        <button
                            onClick={handleLogoutClick}
                            className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-[#FF444F] hover:text-white transition"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* SPACER */}
            <div style={{ height: NAVBAR_HEIGHT }} />

            {/* GLOBAL SEARCH */}
            <GlobalSearch
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />

            {/* LOGOUT CONFIRMATION MODAL */}
            {showLogoutModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center"
                    style={{
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.4)',
                    }}
                    onClick={handleCancelLogout}
                >
                    <div
                        className={`
                            relative p-8 rounded-2xl max-w-md w-[90%]
                            ${theme === 'dark'
                                ? 'bg-[#1A1A1A] border border-[#2A2A2A]'
                                : 'bg-white border border-gray-200'
                            }
                            shadow-2xl
                        `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#FF444F] to-[#D32F2F] rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
                                <LogOut className="w-8 h-8 text-white" />
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className={`text-xl font-bold text-center mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Confirm Logout
                        </h2>

                        {/* Message */}
                        <p className={`text-center mb-8 ${theme === 'dark' ? 'text-[#C2C2C2]' : 'text-gray-600'}`}>
                            Are you sure you want to logout from Deriv Sentinel?
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={handleCancelLogout}
                                className={`
                                    flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200
                                    ${theme === 'dark'
                                        ? 'bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                    }
                                `}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmLogout}
                                className="flex-1 py-3 px-6 rounded-xl font-medium bg-gradient-to-r from-[#FF444F] to-[#D32F2F] text-white hover:shadow-lg hover:shadow-red-500/30 transition-all duration-200"
                            >
                                Yes, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
