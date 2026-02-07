import React, { createContext, useContext, useState } from 'react';

export interface Settings {
    bastionEndpoint: string;
    ollamaEndpoint: string;
    bastionModel: string;
    attackerModel: string;
    shieldgemmaModel: string;
    alertThreshold: 'low' | 'medium' | 'high' | 'critical';
    autoHeal: boolean;
}

interface SettingsContextType {
    settings: Settings;
    saveSettings: (newSettings: Settings) => void;
    updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

const DEFAULT_SETTINGS: Settings = {
    bastionEndpoint: 'http://localhost:8000',
    ollamaEndpoint: 'http://localhost:11434',
    bastionModel: 'llama3.1:8b',
    attackerModel: 'foundation-sec-4b:latest',
    shieldgemmaModel: 'shieldgemma:2b',
    alertThreshold: 'high',
    autoHeal: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const migrateSettings = (saved: Partial<Settings>): Settings => {
    const migrated = { ...DEFAULT_SETTINGS, ...saved };
    // Fix stale model names from older localStorage
    if (migrated.bastionModel.includes('deepseek')) {
        migrated.bastionModel = DEFAULT_SETTINGS.bastionModel;
    }
    return migrated;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(() => {
        const saved = localStorage.getItem('sentinel-settings');
        if (saved) {
            const parsed = JSON.parse(saved);
            const migrated = migrateSettings(parsed);
            localStorage.setItem('sentinel-settings', JSON.stringify(migrated));
            return migrated;
        }
        return DEFAULT_SETTINGS;
    });

    const saveSettings = (newSettings: Settings) => {
        setSettings(newSettings);
        localStorage.setItem('sentinel-settings', JSON.stringify(newSettings));
    };

    const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        const newSettings = { ...settings, [key]: value };
        saveSettings(newSettings);
    };

    return (
        <SettingsContext.Provider value={{ settings, saveSettings, updateSetting }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

// Helper to get settings outside of React components
export const getStoredSettings = (): Settings => {
    try {
        const saved = localStorage.getItem('sentinel-settings');
        return saved ? migrateSettings(JSON.parse(saved)) : DEFAULT_SETTINGS;
    } catch {
        return DEFAULT_SETTINGS;
    }
};
