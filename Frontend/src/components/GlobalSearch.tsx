import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText, Shield, Activity, Settings as SettingsIcon } from 'lucide-react';

interface SearchResult {
    id: string;
    title: string;
    description: string;
    category: 'attack' | 'audit' | 'guardrail' | 'setting';
    path: string;
}

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const navigate = useNavigate();

    // Mock search data
    const searchData: SearchResult[] = [
        { id: '1', title: 'Prompt Injection Attack', description: 'High severity attack detected', category: 'attack', path: '/attacks' },
        { id: '2', title: 'Jailbreak Attempt', description: 'Critical security breach attempt', category: 'attack', path: '/attacks' },
        { id: '3', title: 'Giskard Audit Report', description: 'Latest compliance scan results', category: 'audit', path: '/audits' },
        { id: '4', title: 'Trading Compliance Guardrail', description: 'Never provide BUY/SELL signals', category: 'guardrail', path: '/guardrails' },
        { id: '5', title: 'API Endpoint Configuration', description: 'Bastion and Ollama settings', category: 'setting', path: '/settings' },
        { id: '6', title: 'Model Configuration', description: 'AI model settings', category: 'setting', path: '/settings' },
    ];

    useEffect(() => {
        if (query.trim()) {
            const filtered = searchData.filter(item =>
                item.title.toLowerCase().includes(query.toLowerCase()) ||
                item.description.toLowerCase().includes(query.toLowerCase())
            );
            setResults(filtered);
        } else {
            setResults([]);
        }
    }, [query]);

    const handleSelect = (result: SearchResult) => {
        navigate(result.path);
        onClose();
        setQuery('');
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'attack': return Activity;
            case 'audit': return FileText;
            case 'guardrail': return Shield;
            case 'setting': return SettingsIcon;
            default: return Search;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'attack': return 'text-red-500 bg-red-500/10';
            case 'audit': return 'text-blue-500 bg-blue-500/10';
            case 'guardrail': return 'text-green-500 bg-green-500/10';
            case 'setting': return 'text-purple-500 bg-purple-500/10';
            default: return 'text-[#999999] bg-[#1A1A1A]';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Search Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50"
                    >
                        <div className="glass rounded-2xl shadow-2xl overflow-hidden">
                            {/* Search Input */}
                            <div className="flex items-center gap-4 p-4 border-b border-[#2A2A2A]">
                                <Search className="w-6 h-6 text-[#999999]" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search attacks, audits, guardrails, settings..."
                                    className="flex-1 bg-transparent text-white placeholder-[#666666] outline-none text-lg"
                                    autoFocus
                                />
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-[#2A2A2A] rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-[#999999]" />
                                </button>
                            </div>

                            {/* Results */}
                            <div className="max-h-96 overflow-y-auto">
                                {results.length > 0 ? (
                                    <div className="p-2">
                                        {results.map((result) => {
                                            const Icon = getCategoryIcon(result.category);
                                            return (
                                                <button
                                                    key={result.id}
                                                    onClick={() => handleSelect(result)}
                                                    className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-[#1A1A1A] transition-colors text-left"
                                                >
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getCategoryColor(result.category)}`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-white font-medium">{result.title}</p>
                                                        <p className="text-[#999999] text-sm">{result.description}</p>
                                                    </div>
                                                    <span className="text-xs text-[#666666] uppercase">{result.category}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : query.trim() ? (
                                    <div className="p-12 text-center">
                                        <Search className="w-12 h-12 text-[#666666] mx-auto mb-4" />
                                        <p className="text-[#999999]">No results found for "{query}"</p>
                                    </div>
                                ) : (
                                    <div className="p-12 text-center">
                                        <Search className="w-12 h-12 text-[#666666] mx-auto mb-4" />
                                        <p className="text-[#999999]">Start typing to search...</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-3 border-t border-[#2A2A2A] flex items-center justify-between text-xs text-[#666666]">
                                <span>Press ESC to close</span>
                                <span>⌘K to open</span>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default GlobalSearch;
