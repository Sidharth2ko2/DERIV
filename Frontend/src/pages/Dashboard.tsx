import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
    Shield,
    Activity,
    AlertTriangle,
    CheckCircle,
    TrendingUp,
    Clock,
    Wifi,
    WifiOff,
    Play,
    Loader2,
    Zap
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useWebSocket } from '../hooks/useWebSocket';
import api from '../services/api';

interface SystemStats {
    totalAttacks: number;
    blockedAttacks: number;
    activeGuardrails: number;
    successRate: number;
    lastAudit: string;
    systemHealth: string;
    bastionStatus?: string;
    shieldgemmaStatus?: string;
    pyritStatus?: string;
}

const Dashboard: React.FC = () => {
    const { isConnected, attacks: liveAttacks } = useWebSocket();
    const [stats, setStats] = useState<SystemStats>({
        totalAttacks: 0,
        blockedAttacks: 0,
        activeGuardrails: 0,
        successRate: 100,
        lastAudit: 'Never',
        systemHealth: 'checking...',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isRunningCampaign, setIsRunningCampaign] = useState(false);
    const [campaignProgress, setCampaignProgress] = useState<string>('');
    const [apiConnected, setApiConnected] = useState(false);

    // Fetch stats from API
    const fetchStats = useCallback(async () => {
        try {
            const data = await api.getStats();
            setStats({
                totalAttacks: data.totalAttacks + liveAttacks.length,
                blockedAttacks: data.blockedAttacks + liveAttacks.filter(a => !a.success).length,
                activeGuardrails: data.activeGuardrails,
                successRate: data.successRate,
                lastAudit: data.lastAudit,
                systemHealth: data.systemHealth,
                bastionStatus: data.bastionStatus,
                shieldgemmaStatus: data.shieldgemmaStatus,
                pyritStatus: data.pyritStatus,
            });
            setApiConnected(true);
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            setApiConnected(false);
            // Use fallback data
            setStats({
                totalAttacks: 1247 + liveAttacks.length,
                blockedAttacks: 1189 + liveAttacks.filter(a => !a.success).length,
                activeGuardrails: 42,
                successRate: 95.3,
                lastAudit: '2 hours ago',
                systemHealth: 'offline',
            });
            setIsLoading(false);
        }
    }, [liveAttacks]);

    useEffect(() => {
        fetchStats();
        // Refresh stats every 10 seconds
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    // Show toast for new attacks
    useEffect(() => {
        if (liveAttacks.length > 0) {
            const latestAttack = liveAttacks[0];
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} glass rounded-lg p-4 shadow-lg max-w-md`}>
                    <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${latestAttack.success ? 'bg-red-500/20' : 'bg-green-500/20'
                            }`}>
                            {latestAttack.success ? (
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                            ) : (
                                <Shield className="w-5 h-5 text-green-500" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-semibold">{latestAttack.category}</p>
                            <p className="text-[#C2C2C2] text-sm">{latestAttack.objective}</p>
                            <p className="text-[#999999] text-xs mt-1">
                                {latestAttack.success ? 'Attack Successful ⚠️ → Vaccine Injected 💉' : 'Attack Blocked ✓'}
                            </p>
                        </div>
                    </div>
                </div>
            ), { duration: 4000 });
        }
    }, [liveAttacks]);

    // Run Campaign Handler
    const handleRunCampaign = async () => {
        setIsRunningCampaign(true);
        setCampaignProgress('Initializing red team campaign...');

        toast.loading('Starting Red Team Campaign...', { id: 'campaign' });

        try {
            setCampaignProgress('Running attacks against Bastion...');
            const result = await api.runCampaign();

            toast.success(
                `Campaign complete! ${result.summary.passed}/${result.summary.totalTests} attacks blocked`,
                { id: 'campaign', duration: 5000 }
            );

            // Refresh stats
            await fetchStats();

            setCampaignProgress(`✅ Campaign complete! ${result.summary.failed} vulnerabilities found and healed.`);

        } catch (error) {
            toast.error('Campaign failed. Is the API server running?', { id: 'campaign' });
            setCampaignProgress('❌ Campaign failed. Make sure api_server.py is running.');
        } finally {
            setIsRunningCampaign(false);
        }
    };

    // Chart data (can be enhanced with real data later)
    const chartData = [
        { time: '00:00', attacks: 45, blocked: 43 },
        { time: '04:00', attacks: 32, blocked: 30 },
        { time: '08:00', attacks: 67, blocked: 64 },
        { time: '12:00', attacks: 89, blocked: 85 },
        { time: '16:00', attacks: 123, blocked: 118 },
        { time: '20:00', attacks: 98 + liveAttacks.length, blocked: 94 + liveAttacks.filter(a => !a.success).length },
    ];

    const statCards = [
        {
            title: 'Total Attacks',
            value: stats.totalAttacks.toLocaleString(),
            icon: Activity,
            color: 'from-blue-500 to-blue-600',
            change: '+12%',
        },
        {
            title: 'Blocked Attacks',
            value: stats.blockedAttacks.toLocaleString(),
            icon: Shield,
            color: 'from-green-500 to-green-600',
            change: '+8%',
        },
        {
            title: 'Active Guardrails',
            value: stats.activeGuardrails,
            icon: CheckCircle,
            color: 'from-[#FF444F] to-[#D32F2F]',
            change: '+3',
        },
        {
            title: 'Success Rate',
            value: `${stats.successRate.toFixed(1)}%`,
            icon: TrendingUp,
            color: 'from-purple-500 to-purple-600',
            change: '+2.3%',
        },
    ];

    const recentAttacks = liveAttacks.length > 0 ? liveAttacks.slice(0, 5) : [
        { id: '1', type: 'Prompt Injection', category: 'PROMPT_INJECTION', severity: 'high', time: '2 min ago', blocked: true, success: false },
        { id: '2', type: 'Jailbreak Attempt', category: 'STRUCTURAL_JAILBREAK', severity: 'critical', time: '5 min ago', blocked: true, success: false },
        { id: '3', type: 'Data Extraction', category: 'DATA_LEAKAGE', severity: 'medium', time: '12 min ago', blocked: true, success: false },
    ];

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'text-red-500 bg-red-500/10';
            case 'high': return 'text-orange-500 bg-orange-500/10';
            case 'medium': return 'text-yellow-500 bg-yellow-500/10';
            default: return 'text-blue-500 bg-blue-500/10';
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#FF444F] animate-spin mx-auto mb-4" />
                    <p className="text-[#C2C2C2]">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <Toaster position="top-right" />

            {/* Header with Connection Status */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Security Dashboard</h1>
                    <p className="text-[#C2C2C2]">Real-time monitoring and threat analysis</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Run Campaign Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRunCampaign}
                        disabled={isRunningCampaign}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${isRunningCampaign
                                ? 'bg-[#2A2A2A] text-[#666666] cursor-not-allowed'
                                : 'bg-gradient-to-r from-[#FF444F] to-[#D32F2F] text-white hover:shadow-lg hover:shadow-red-500/25'
                            }`}
                    >
                        {isRunningCampaign ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Running Campaign...
                            </>
                        ) : (
                            <>
                                <Zap className="w-5 h-5" />
                                Run Red Team
                            </>
                        )}
                    </motion.button>

                    {/* Connection Status */}
                    <div className="flex items-center gap-2 px-4 py-2 glass rounded-lg">
                        {apiConnected ? (
                            <>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-green-500 font-medium">API</span>
                            </>
                        ) : (
                            <>
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                                <span className="text-red-500 font-medium">API Offline</span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 glass rounded-lg">
                        {isConnected ? (
                            <>
                                <Wifi className="w-5 h-5 text-green-500" />
                                <span className="text-green-500 font-medium">Live</span>
                            </>
                        ) : (
                            <>
                                <WifiOff className="w-5 h-5 text-[#999999]" />
                                <span className="text-[#999999] font-medium">Offline</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Campaign Progress */}
            {campaignProgress && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-xl p-4 flex items-center gap-3"
                >
                    {isRunningCampaign ? (
                        <Loader2 className="w-5 h-5 text-[#FF444F] animate-spin" />
                    ) : campaignProgress.includes('✅') ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="text-[#C2C2C2]">{campaignProgress}</span>
                </motion.div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={card.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass rounded-xl p-6 card-hover"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-sm text-green-500 font-medium">{card.change}</span>
                            </div>
                            <h3 className="text-[#C2C2C2] text-sm mb-1">{card.title}</h3>
                            <p className="text-3xl font-bold text-white">{card.value}</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Attack Trends Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass rounded-xl p-6"
            >
                <h2 className="text-xl font-bold text-white mb-6">Attack Trends (24h)</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FF444F" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#FF444F" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4BB543" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#4BB543" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                        <XAxis dataKey="time" stroke="#999999" />
                        <YAxis stroke="#999999" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1A1A1A',
                                border: '1px solid #2A2A2A',
                                borderRadius: '8px',
                                color: '#FFFFFF'
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="attacks"
                            stroke="#FF444F"
                            fillOpacity={1}
                            fill="url(#colorAttacks)"
                            strokeWidth={2}
                        />
                        <Area
                            type="monotone"
                            dataKey="blocked"
                            stroke="#4BB543"
                            fillOpacity={1}
                            fill="url(#colorBlocked)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Attack Timeline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 glass rounded-xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Recent Attacks</h2>
                        <button className="text-[#FF444F] hover:text-[#FF6B6B] text-sm font-medium">
                            View All →
                        </button>
                    </div>

                    <div className="space-y-3">
                        {recentAttacks.map((attack: any) => (
                            <div
                                key={attack.id}
                                className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A] hover:border-[#FF444F]/30 transition-colors"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(attack.severity || 'medium')}`}>
                                        {(attack.severity || 'medium').toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{attack.type || attack.category}</p>
                                        <p className="text-[#999999] text-sm flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {attack.time || new Date(attack.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {(attack.blocked !== undefined ? attack.blocked : !attack.success) ? (
                                        <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-medium">
                                            Blocked
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-medium flex items-center gap-1">
                                            Passed → Healed 💉
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* System Health */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass rounded-xl p-6"
                >
                    <h2 className="text-xl font-bold text-white mb-6">System Health</h2>

                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[#C2C2C2] text-sm">Bastion API</span>
                                <span className={`text-sm font-medium ${stats.bastionStatus === 'online' || apiConnected ? 'text-green-500' : 'text-red-500'}`}>
                                    {stats.bastionStatus === 'online' || apiConnected ? 'Online' : 'Offline'}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                                <div className={`h-full ${apiConnected ? 'w-full bg-gradient-to-r from-green-500 to-green-600' : 'w-0'}`}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[#C2C2C2] text-sm">PyRIT Scanner</span>
                                <span className={`text-sm font-medium ${apiConnected ? 'text-green-500' : 'text-[#999999]'}`}>
                                    {apiConnected ? 'Ready' : 'Unavailable'}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                                <div className={`h-full ${apiConnected ? 'w-[95%] bg-gradient-to-r from-green-500 to-green-600' : 'w-0'}`}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[#C2C2C2] text-sm">ShieldGemma</span>
                                <span className={`text-sm font-medium ${apiConnected ? 'text-green-500' : 'text-[#999999]'}`}>
                                    {apiConnected ? 'Running' : 'Unavailable'}
                                </span>
                            </div>
                            <div className="w-full h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                                <div className={`h-full ${apiConnected ? 'w-full bg-gradient-to-r from-green-500 to-green-600' : 'w-0'}`}></div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#2A2A2A]">
                            <div className="flex items-center gap-2 text-[#C2C2C2] text-sm mb-2">
                                <Clock className="w-4 h-4" />
                                <span>Last Audit</span>
                            </div>
                            <p className="text-white font-medium">{stats.lastAudit}</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
