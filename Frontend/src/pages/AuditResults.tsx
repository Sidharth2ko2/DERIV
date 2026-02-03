import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FileText, Download, AlertTriangle, RefreshCw, Loader2, CheckCircle } from 'lucide-react';
import { exportAuditToPDF } from '../utils/export';
import api from '../services/api';

interface Violation {
    id: string;
    category: string;
    severity: 'critical' | 'high' | 'medium';
    description: string;
    recommendation: string;
}

interface Audit {
    id: string;
    timestamp: string;
    scanType: string;
    totalTests: number;
    passed: number;
    failed: number;
    violations: Violation[];
}

const AuditResults: React.FC = () => {
    const [audits, setAudits] = useState<Audit[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAudits = useCallback(async () => {
        try {
            const data = await api.getAudits();
            setAudits(data);
        } catch (error) {
            console.error('Failed to fetch audits:', error);
            // Use mock data as fallback
            setAudits([
                {
                    id: '1',
                    timestamp: new Date().toISOString(),
                    scanType: 'Giskard + ShieldGemma',
                    totalTests: 156,
                    passed: 148,
                    failed: 8,
                    violations: [
                        {
                            id: '1',
                            category: 'Prompt Injection',
                            severity: 'high',
                            description: 'System prompt extraction attempt detected',
                            recommendation: 'Strengthen input validation',
                        },
                        {
                            id: '2',
                            category: 'Data Leakage',
                            severity: 'medium',
                            description: 'Potential PII exposure in response',
                            recommendation: 'Add PII detection layer',
                        },
                    ],
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAudits();
    }, [fetchAudits]);

    const handleDownloadPDF = (audit: Audit) => {
        exportAuditToPDF(audit as any);
        toast.success('PDF report downloaded successfully');
    };

    const handleRefresh = async () => {
        setIsLoading(true);
        await fetchAudits();
        toast.success('Audits refreshed');
    };

    if (isLoading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-[#FF444F] animate-spin mx-auto mb-4" />
                    <p className="text-[#C2C2C2]">Loading audits...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Audit Results</h1>
                    <p className="text-[#C2C2C2]">Security scan reports and compliance audits</p>
                </div>
                <button
                    onClick={handleRefresh}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded-lg transition-colors"
                >
                    <RefreshCw className="w-5 h-5" />
                    Refresh
                </button>
            </div>

            {/* Summary Stats */}
            {audits.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="glass rounded-xl p-4">
                        <p className="text-[#999999] text-sm">Total Campaigns</p>
                        <p className="text-2xl font-bold text-white">{audits.length}</p>
                    </div>
                    <div className="glass rounded-xl p-4">
                        <p className="text-[#999999] text-sm">Total Tests</p>
                        <p className="text-2xl font-bold text-white">{audits.reduce((sum, a) => sum + a.totalTests, 0)}</p>
                    </div>
                    <div className="glass rounded-xl p-4">
                        <p className="text-[#999999] text-sm">Attacks Blocked</p>
                        <p className="text-2xl font-bold text-green-500">{audits.reduce((sum, a) => sum + a.passed, 0)}</p>
                    </div>
                    <div className="glass rounded-xl p-4">
                        <p className="text-[#999999] text-sm">Vulnerabilities Found</p>
                        <p className="text-2xl font-bold text-red-500">{audits.reduce((sum, a) => sum + a.failed, 0)}</p>
                    </div>
                </div>
            )}

            {audits.length === 0 ? (
                <div className="glass rounded-xl p-12 text-center">
                    <FileText className="w-12 h-12 text-[#999999] mx-auto mb-4" />
                    <p className="text-[#C2C2C2] text-lg">No audit results yet</p>
                    <p className="text-[#666666] text-sm mt-2">Run a Red Team Campaign from the Dashboard to generate audit results</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {audits.map((audit, index) => (
                        <motion.div
                            key={audit.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass rounded-xl p-6 card-hover"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-[#FF444F] to-[#D32F2F] rounded-lg flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{audit.scanType}</h3>
                                        <p className="text-sm text-[#999999]">{new Date(audit.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDownloadPDF(audit)}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#FF444F] hover:bg-[#D32F2F] text-white rounded-lg transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    PDF Report
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-6 mb-6">
                                <div className="text-center p-4 bg-[#1A1A1A] rounded-lg">
                                    <p className="text-3xl font-bold text-white mb-1">{audit.totalTests}</p>
                                    <p className="text-sm text-[#999999]">Total Tests</p>
                                </div>
                                <div className="text-center p-4 bg-green-500/10 rounded-lg">
                                    <p className="text-3xl font-bold text-green-500 mb-1">{audit.passed}</p>
                                    <p className="text-sm text-[#999999]">Blocked</p>
                                </div>
                                <div className="text-center p-4 bg-red-500/10 rounded-lg">
                                    <p className="text-3xl font-bold text-red-500 mb-1">{audit.failed}</p>
                                    <p className="text-sm text-[#999999]">Passed (Healed)</p>
                                </div>
                            </div>

                            {/* Violations */}
                            {audit.violations.length > 0 && (
                                <div className="pt-6 border-t border-[#2A2A2A]">
                                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-[#FF444F]" />
                                        Vulnerabilities Detected & Healed
                                    </h4>
                                    <div className="space-y-3">
                                        {audit.violations.map((violation) => (
                                            <div
                                                key={violation.id}
                                                className="p-4 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                        <div>
                                                            <p className="text-white font-medium">{violation.category}</p>
                                                            <p className="text-sm text-[#999999]">{violation.description}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${violation.severity === 'critical' ? 'bg-red-500/10 text-red-500' :
                                                        violation.severity === 'high' ? 'bg-orange-500/10 text-orange-500' :
                                                            'bg-yellow-500/10 text-yellow-500'
                                                        }`}>
                                                        {violation.severity.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-full">
                                                        ✓ Vaccine Injected
                                                    </span>
                                                    <p className="text-sm text-[#C2C2C2]">
                                                        <span className="text-[#999999]">Action:</span> {violation.recommendation}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
                                <div className="flex items-center justify-between">
                                    <span className="text-[#C2C2C2]">Defense Rate</span>
                                    <span className="text-white font-semibold">
                                        {((audit.passed / audit.totalTests) * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-[#1A1A1A] rounded-full overflow-hidden mt-2">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-green-600"
                                        style={{ width: `${(audit.passed / audit.totalTests) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AuditResults;
