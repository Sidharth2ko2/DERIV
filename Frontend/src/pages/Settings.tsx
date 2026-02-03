import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Save, Server, Cpu, Bell, CheckCircle, XCircle, Loader2, Zap, RefreshCw } from 'lucide-react';
import api from '../services/api';

const Settings: React.FC = () => {
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('sentinel-settings');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            bastionEndpoint: 'http://localhost:8000',
            ollamaEndpoint: 'http://localhost:11434',
            bastionModel: 'deepseek-r1:8b',
            attackerModel: 'foundation-sec-4b:latest',
            shieldgemmaModel: 'shieldgemma:2b',
            alertThreshold: 'high',
            autoHeal: true,
        };
    });

    const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
    const [isTestingConnection, setIsTestingConnection] = useState(false);

    // Check API status on mount
    useEffect(() => {
        checkApiHealth();
    }, []);

    const checkApiHealth = async () => {
        setIsTestingConnection(true);
        try {
            await api.health();
            setApiStatus('online');
        } catch (error) {
            setApiStatus('offline');
        } finally {
            setIsTestingConnection(false);
        }
    };

    const handleSave = () => {
        localStorage.setItem('sentinel-settings', JSON.stringify(settings));
        toast.success('Settings saved successfully!');
    };

    const handleTestConnection = async () => {
        setIsTestingConnection(true);
        toast.loading('Testing connection...', { id: 'test-conn' });

        try {
            const health = await api.health();
            toast.success(`API is online! Status: ${health.status}`, { id: 'test-conn' });
            setApiStatus('online');
        } catch (error) {
            toast.error('Failed to connect to API. Is the server running?', { id: 'test-conn' });
            setApiStatus('offline');
        } finally {
            setIsTestingConnection(false);
        }
    };

    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                <p className="text-[#C2C2C2]">Configure system parameters</p>
            </div>

            {/* API Status Banner */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass rounded-xl p-4 flex items-center justify-between ${apiStatus === 'online' ? 'border-l-4 border-l-green-500' :
                        apiStatus === 'offline' ? 'border-l-4 border-l-red-500' :
                            'border-l-4 border-l-yellow-500'
                    }`}
            >
                <div className="flex items-center gap-3">
                    {apiStatus === 'checking' || isTestingConnection ? (
                        <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
                    ) : apiStatus === 'online' ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                        <XCircle className="w-6 h-6 text-red-500" />
                    )}
                    <div>
                        <p className="text-white font-semibold">
                            API Server: {apiStatus === 'checking' ? 'Checking...' : apiStatus === 'online' ? 'Online' : 'Offline'}
                        </p>
                        <p className="text-sm text-[#999999]">
                            {apiStatus === 'offline' ?
                                'Run: python api_server.py from the Backend folder' :
                                'Connected to Deriv Sentinel API'
                            }
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleTestConnection}
                    disabled={isTestingConnection}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded-lg transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${isTestingConnection ? 'animate-spin' : ''}`} />
                    Test Connection
                </button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-6 space-y-6"
            >
                {/* API Endpoints */}
                <div className="pt-6 border-t border-[#2A2A2A]">
                    <div className="flex items-center gap-2 mb-4">
                        <Server className="w-5 h-5 text-[#FF444F]" />
                        <h2 className="text-xl font-semibold text-white">API Endpoints</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[#C2C2C2] mb-2">
                                Sentinel API
                            </label>
                            <input
                                type="text"
                                value={settings.bastionEndpoint}
                                onChange={(e) => setSettings({ ...settings, bastionEndpoint: e.target.value })}
                                className="w-full px-4 py-3 bg-[#151515] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-[#FF444F] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#C2C2C2] mb-2">
                                Ollama Endpoint
                            </label>
                            <input
                                type="text"
                                value={settings.ollamaEndpoint}
                                onChange={(e) => setSettings({ ...settings, ollamaEndpoint: e.target.value })}
                                className="w-full px-4 py-3 bg-[#151515] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-[#FF444F] transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Model Configuration */}
                <div className="pt-6 border-t border-[#2A2A2A]">
                    <div className="flex items-center gap-2 mb-4">
                        <Cpu className="w-5 h-5 text-[#FF444F]" />
                        <h2 className="text-xl font-semibold text-white">Model Configuration</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#C2C2C2] mb-2">
                                Bastion LLM
                            </label>
                            <input
                                type="text"
                                value={settings.bastionModel}
                                onChange={(e) => setSettings({ ...settings, bastionModel: e.target.value })}
                                className="w-full px-4 py-3 bg-[#151515] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-[#FF444F] transition-colors"
                            />
                            <p className="text-xs text-[#666666] mt-1">The defended trading assistant</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#C2C2C2] mb-2">
                                Attacker LLM
                            </label>
                            <input
                                type="text"
                                value={settings.attackerModel}
                                onChange={(e) => setSettings({ ...settings, attackerModel: e.target.value })}
                                className="w-full px-4 py-3 bg-[#151515] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-[#FF444F] transition-colors"
                            />
                            <p className="text-xs text-[#666666] mt-1">Red team model (Foundation-Sec)</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#C2C2C2] mb-2">
                                ShieldGemma
                            </label>
                            <input
                                type="text"
                                value={settings.shieldgemmaModel}
                                onChange={(e) => setSettings({ ...settings, shieldgemmaModel: e.target.value })}
                                className="w-full px-4 py-3 bg-[#151515] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-[#FF444F] transition-colors"
                            />
                            <p className="text-xs text-[#666666] mt-1">Policy auditor model</p>
                        </div>
                    </div>
                </div>

                {/* Self-Healing Settings */}
                <div className="pt-6 border-t border-[#2A2A2A]">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-[#FF444F]" />
                        <h2 className="text-xl font-semibold text-white">Self-Healing Engine</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg">
                            <div>
                                <p className="text-white font-medium">Auto-Heal</p>
                                <p className="text-sm text-[#999999]">Automatically inject vaccine guardrails when attacks succeed</p>
                            </div>
                            <button
                                onClick={() => setSettings({ ...settings, autoHeal: !settings.autoHeal })}
                                className={`w-14 h-8 rounded-full transition-colors ${settings.autoHeal ? 'bg-[#FF444F]' : 'bg-[#2A2A2A]'
                                    }`}
                            >
                                <div
                                    className={`w-6 h-6 bg-white rounded-full transition-transform ${settings.autoHeal ? 'translate-x-7' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Alert Settings */}
                <div className="pt-6 border-t border-[#2A2A2A]">
                    <div className="flex items-center gap-2 mb-4">
                        <Bell className="w-5 h-5 text-[#FF444F]" />
                        <h2 className="text-xl font-semibold text-white">Alert Settings</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[#C2C2C2] mb-2">
                                Alert Threshold
                            </label>
                            <select
                                value={settings.alertThreshold}
                                onChange={(e) => setSettings({ ...settings, alertThreshold: e.target.value })}
                                className="w-full px-4 py-3 bg-[#151515] border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:border-[#FF444F] transition-colors"
                            >
                                <option value="low">Low (All attacks)</option>
                                <option value="medium">Medium (Medium and above)</option>
                                <option value="high">High (High and above)</option>
                                <option value="critical">Critical Only</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="pt-6 border-t border-[#2A2A2A]">
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF444F] to-[#D32F2F] text-white font-semibold rounded-lg shadow-lg shadow-[#FF444F]/30 hover:shadow-[#FF444F]/50 transition-all"
                    >
                        <Save className="w-5 h-5" />
                        Save Settings
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Settings;
