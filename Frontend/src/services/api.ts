/**
 * api.ts
 * 
 * Frontend API service for Deriv Sentinel
 * Connects to the backend API server
 */

import { getStoredSettings } from '../context/SettingsContext';

const getBaseUrl = () => {
    const settings = getStoredSettings();
    // Ensure no trailing slash
    return settings.bastionEndpoint.replace(/\/$/, '');
};

// Types
export interface SystemStats {
    totalAttacks: number;
    blockedAttacks: number;
    activeGuardrails: number;
    successRate: number;
    lastAudit: string;
    systemHealth: string;
    bastionStatus: string;
    shieldgemmaStatus: string;
    pyritStatus: string;
}

export interface Attack {
    id: string;
    timestamp: string;
    category: string;
    objective: string;
    persona: string;
    prompt: string;
    response: string;
    success: boolean;
    severity: 'critical' | 'high' | 'medium' | 'low';
    heal_status?: 'pending' | 'approved' | 'rejected';
    audit?: {
        violation: string;
        risk_score: number;
        category: string;
        reason: string;
    };
    heal?: {
        timestamp: string;
        category: string;
        heal_action: string;
    };
}

export interface Audit {
    id: string;
    timestamp: string;
    scanType: string;
    totalTests: number;
    passed: number;
    failed: number;
    violations: {
        id: string;
        category: string;
        severity: 'critical' | 'high' | 'medium';
        description: string;
        recommendation: string;
    }[];
}

export interface Guardrail {
    id: string;
    timestamp: string;
    category: string;
    rule: string;
    active: boolean;
    triggeredCount: number;
}

export interface CampaignResult {
    campaign_id: string;
    summary: Audit;
    attacks: Attack[];
    skipped?: { id: number; category: string; reason: string }[];
    message?: string;
}

// API Functions
export const api = {
    // Health check
    async health(): Promise<{ status: string; timestamp: string }> {
        const res = await fetch(`${getBaseUrl()}/api/health`);
        if (!res.ok) throw new Error('API health check failed');
        return res.json();
    },

    // Get system stats
    async getStats(): Promise<SystemStats> {
        const res = await fetch(`${getBaseUrl()}/api/stats`);
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
    },

    // Get attacks
    async getAttacks(): Promise<Attack[]> {
        const res = await fetch(`${getBaseUrl()}/api/attacks`);
        if (!res.ok) throw new Error('Failed to fetch attacks');
        return res.json();
    },

    // Run single attack
    async runAttack(attack: {
        category: string;
        objective: string;
        persona: string;
        prompt: string;
        auto_heal?: boolean;
    }): Promise<Attack> {
        const res = await fetch(`${getBaseUrl()}/api/attacks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(attack),
        });
        if (!res.ok) throw new Error('Failed to run attack');
        return res.json();
    },

    // Run full campaign
    async runCampaign(attackIds?: number[], autoHeal?: boolean): Promise<CampaignResult> {
        const res = await fetch(`${getBaseUrl()}/api/run-campaign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attack_ids: attackIds, auto_heal: autoHeal ?? false }),
        });
        if (!res.ok) throw new Error('Failed to run campaign');
        return res.json();
    },

    // Stop running campaign
    async stopCampaign(): Promise<{ status: string; message: string }> {
        const res = await fetch(`${getBaseUrl()}/api/campaign/stop`, {
            method: 'POST',
        });
        if (!res.ok) throw new Error('Failed to stop campaign');
        return res.json();
    },

    // Check campaign status
    async getCampaignStatus(): Promise<{ running: boolean }> {
        const res = await fetch(`${getBaseUrl()}/api/campaign/status`);
        if (!res.ok) throw new Error('Failed to get campaign status');
        return res.json();
    },

    // Get audits
    async getAudits(): Promise<Audit[]> {
        const res = await fetch(`${getBaseUrl()}/api/audits`);
        if (!res.ok) throw new Error('Failed to fetch audits');
        return res.json();
    },

    // Get guardrails
    async getGuardrails(): Promise<Guardrail[]> {
        const res = await fetch(`${getBaseUrl()}/api/guardrails`);
        if (!res.ok) throw new Error('Failed to fetch guardrails');
        return res.json();
    },

    // Get vaccine file contents
    async getVaccineFile(): Promise<{ content: string; exists: boolean }> {
        const res = await fetch(`${getBaseUrl()}/api/vaccine-file`);
        if (!res.ok) throw new Error('Failed to fetch vaccine file');
        return res.json();
    },

    // Reset guardrails (for demo)
    async resetGuardrails(): Promise<{ status: string; message: string }> {
        const res = await fetch(`${getBaseUrl()}/api/guardrails/reset`, {
            method: 'POST',
        });
        if (!res.ok) throw new Error('Failed to reset guardrails');
        return res.json();
    },

    // Full demo reset
    async resetAll(): Promise<{ status: string; message: string }> {
        const res = await fetch(`${getBaseUrl()}/api/reset-all`, {
            method: 'POST',
        });
        if (!res.ok) throw new Error('Failed to reset');
        return res.json();
    },

    // Get heal log
    async getHealLog(): Promise<any[]> {
        const res = await fetch(`${getBaseUrl()}/api/heal-log`);
        if (!res.ok) throw new Error('Failed to fetch heal log');
        return res.json();
    },

    // Human-in-the-Loop Heal Endpoints
    async approveHeal(attackId: string): Promise<{ status: string; message: string; heal?: any }> {
        const res = await fetch(`${getBaseUrl()}/api/heal/approve/${attackId}`, {
            method: 'POST',
        });
        if (!res.ok) throw new Error('Failed to approve heal');
        return res.json();
    },

    async rejectHeal(attackId: string): Promise<{ status: string; message: string }> {
        const res = await fetch(`${getBaseUrl()}/api/heal/reject/${attackId}`, {
            method: 'POST',
        });
        if (!res.ok) throw new Error('Failed to reject heal');
        return res.json();
    },

    async setAutoHeal(enabled: boolean): Promise<{ enabled: boolean; approved: number }> {
        const res = await fetch(`${getBaseUrl()}/api/auto-heal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled }),
        });
        if (!res.ok) throw new Error('Failed to set auto-heal');
        return res.json();
    },

    async getAutoHeal(): Promise<{ enabled: boolean }> {
        const res = await fetch(`${getBaseUrl()}/api/auto-heal`);
        if (!res.ok) throw new Error('Failed to get auto-heal');
        return res.json();
    },

    async getPendingHeals(): Promise<Attack[]> {
        const res = await fetch(`${getBaseUrl()}/api/heal/pending`);
        if (!res.ok) throw new Error('Failed to fetch pending heals');
        return res.json();
    },

    // Query Bastion directly
    async queryBastion(prompt: string): Promise<{ response: string }> {
        const res = await fetch(`${getBaseUrl()}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3.1:8b',
                prompt,
                stream: false,
            }),
        });
        if (!res.ok) throw new Error('Failed to query Bastion');
        return res.json();
    },
};

// WebSocket connection
export function createAttackWebSocket(
    onAttack: (attack: Attack) => void,
    onConnect?: () => void,
    onDisconnect?: () => void
): WebSocket {
    const ws = new WebSocket(`ws://localhost:8000/ws/attacks`);

    ws.onopen = () => {
        console.log('WebSocket connected');
        onConnect?.();
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.id) {
            onAttack(data);
        }
    };

    ws.onclose = () => {
        console.log('WebSocket disconnected');
        onDisconnect?.();
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    return ws;
}

export default api;
