import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useSettings } from './SettingsContext';

interface CampaignContextType {
    isRunningCampaign: boolean;
    campaignProgress: string;
    handleRunCampaign: () => Promise<void>;
    handleStopCampaign: () => Promise<void>;
    clearProgress: () => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isRunningCampaign, setIsRunningCampaign] = useState(false);
    const [campaignProgress, setCampaignProgress] = useState('');
    const { settings } = useSettings();
    // Use a ref to always get the latest autoHeal value inside the async callback
    const autoHealRef = useRef(settings.autoHeal);
    autoHealRef.current = settings.autoHeal;

    // On mount, check if backend already has a campaign running (e.g. after page refresh)
    useEffect(() => {
        api.getCampaignStatus()
            .then((res) => {
                if (res.running) {
                    setIsRunningCampaign(true);
                    setCampaignProgress('Running attacks against Bastion...');
                }
            })
            .catch(() => {});
    }, []);

    // Poll backend while campaign is running to detect when it finishes
    useEffect(() => {
        if (!isRunningCampaign) return;
        const interval = setInterval(async () => {
            try {
                const res = await api.getCampaignStatus();
                if (!res.running) {
                    // Campaign finished on the backend (possibly started before page load)
                    setIsRunningCampaign(false);
                    // Only update progress if we don't already have a completion message
                    setCampaignProgress((prev) =>
                        prev.includes('✅') || prev.includes('❌') ? prev : '✅ Campaign complete!'
                    );
                    clearInterval(interval);
                }
            } catch {
                // API offline
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [isRunningCampaign]);

    const handleRunCampaign = useCallback(async () => {
        setIsRunningCampaign(true);
        setCampaignProgress('Initializing red team campaign...');
        toast.loading('Starting Red Team Campaign...', { id: 'campaign' });

        try {
            setCampaignProgress('Running attacks against Bastion...');
            const result = await api.runCampaign(undefined, autoHealRef.current);

            const skippedCount = result.skipped?.length || 0;
            const skippedMsg = skippedCount > 0 ? ` (${skippedCount} skipped — already vaccinated)` : '';

            if (result.message) {
                toast.success(result.message, { id: 'campaign', duration: 5000 });
                setCampaignProgress(`✅ ${result.message}`);
            } else {
                toast.success(
                    `Campaign complete! ${result.summary.passed}/${result.summary.totalTests} attacks blocked${skippedMsg}`,
                    { id: 'campaign', duration: 5000 }
                );
                setCampaignProgress(
                    autoHealRef.current
                        ? `✅ Campaign complete! ${result.summary.failed} vulnerabilities auto-healed.${skippedMsg}`
                        : `✅ Campaign complete! ${result.summary.failed} breaches need approval.${skippedMsg}`
                );
            }
        } catch (error) {
            toast.error('Campaign failed. Is the API server running?', { id: 'campaign' });
            setCampaignProgress('❌ Campaign failed. Make sure api_server.py is running.');
        } finally {
            setIsRunningCampaign(false);
        }
    }, []);

    const handleStopCampaign = useCallback(async () => {
        try {
            await api.stopCampaign();
            toast.success('Stopping campaign...');
        } catch {
            toast.error('Failed to stop');
        }
    }, []);

    const clearProgress = useCallback(() => {
        setCampaignProgress('');
    }, []);

    return (
        <CampaignContext.Provider value={{
            isRunningCampaign,
            campaignProgress,
            handleRunCampaign,
            handleStopCampaign,
            clearProgress,
        }}>
            {children}
        </CampaignContext.Provider>
    );
};

export const useCampaign = () => {
    const context = useContext(CampaignContext);
    if (context === undefined) {
        throw new Error('useCampaign must be used within a CampaignProvider');
    }
    return context;
};
