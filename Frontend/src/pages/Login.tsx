import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (error) {
            toast.error('Username or password didn\'t match');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0E0E0E] via-[#1A0A0A] to-[#0E0E0E] relative overflow-hidden">
            {/* Toast container for login errors */}
            <Toaster
                position="top-center"
                toastOptions={{
                    style: {
                        background: '#1A1A1A',
                        color: '#FFFFFF',
                        border: '1px solid #FF444F',
                        borderRadius: '12px',
                        padding: '16px',
                    },
                    error: {
                        iconTheme: { primary: '#FF444F', secondary: '#FFFFFF' },
                    },
                    duration: 4000,
                }}
            />
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute w-96 h-96 bg-[#FF444F]/10 rounded-full blur-3xl"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -100, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                    style={{ top: '10%', left: '10%' }}
                />
                <motion.div
                    className="absolute w-96 h-96 bg-[#FF444F]/5 rounded-full blur-3xl"
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 100, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                    style={{ bottom: '10%', right: '10%' }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-md px-6"
            >
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FF444F] to-[#D32F2F] rounded-2xl mb-4 shadow-lg shadow-[#FF444F]/20"
                    >
                        <Shield className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold mb-2" style={{ color: '#FFFFFF' }}>Deriv Sentinel</h1>
                    <p className="mb-0" style={{ color: '#E0E0E0' }}>AI Security Command Center</p>
                </div>

                {/* Login Card */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="glass rounded-2xl p-8 shadow-2xl"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#666666' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full py-3 border rounded-lg focus:outline-none focus:border-[#FF444F] transition-colors"
                                    style={{ paddingLeft: '48px', paddingRight: '16px', backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', color: '#333333' }}
                                    placeholder="analyst@deriv.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#333333' }}>
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#666666' }} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full py-3 border rounded-lg focus:outline-none focus:border-[#FF444F] transition-colors"
                                    style={{ paddingLeft: '48px', paddingRight: '16px', backgroundColor: '#FFFFFF', borderColor: '#E0E0E0', color: '#333333' }}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-[#FF444F] to-[#D32F2F] text-white font-semibold rounded-lg shadow-lg shadow-[#FF444F]/30 hover:shadow-[#FF444F]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Authenticating...' : 'Sign In'}
                            </motion.button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-[#999999]">
                        Demo credentials: analyst@deriv.com / 12345678
                    </div>
                </motion.div>

                {/* Footer */}
                <div className="mt-8 text-center text-sm" style={{ color: '#B0B0B0' }}>
                    <p>© 2026 Deriv Sentinel. All rights reserved.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
