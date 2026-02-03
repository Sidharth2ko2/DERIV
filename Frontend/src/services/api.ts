/**
 * api.ts
 * 
 * Frontend API service for Deriv Sentinel
 * Connects to the backend API server
 */

const API_BASE = 'http://localhost:8000';

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
}

// API Functions
export const api = {
    // Health check
    async health(): Promise<{ status: string; timestamp: string }> {
        const res = await fetch(`${API_BASE}/api/health`);
        if (!res.ok) throw new Error('API health check failed');
        return res.json();
    },

    // Get system stats
    async getStats(): Promise<SystemStats> {
        const res = await fetch(`${API_BASE}/api/stats`);
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
    },

    // Get attacks
    async getAttacks(): Promise<Attack[]> {
        const res = await fetch(`${API_BASE}/api/attacks`);
        if (!res.ok) throw new Error('Failed to fetch attacks');
        return res.json();
    },

    // Run single attack
    async runAttack(attack: {
        category: string;
        objective: string;
        persona: string;
        prompt: string;
    }): Promise<Attack> {
        const res = await fetch(`${API_BASE}/api/attacks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(attack),
        });
        if (!res.ok) throw new Error('Failed to run attack');
        return res.json();
    },

    // Run full campaign
    async runCampaign(attackIds?: number[]): Promise<CampaignResult> {
        const res = await fetch(`${API_BASE}/api/run-campaign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attack_ids: attackIds }),
        });
        if (!res.ok) throw new Error('Failed to run campaign');
        return res.json();
    },

    // Get audits
    async getAudits(): Promise<Audit[]> {
        const res = await fetch(`${API_BASE}/api/audits`);
        if (!res.ok) throw new Error('Failed to fetch audits');
        return res.json();
    },

    // Get guardrails
    async getGuardrails(): Promise<Guardrail[]> {
        const res = await fetch(`${API_BASE}/api/guardrails`);
        if (!res.ok) throw new Error('Failed to fetch guardrails');
        return res.json();
    },

    // Get vaccine file contents
    async getVaccineFile(): Promise<{ content: string; exists: boolean }> {
        const res = await fetch(`${API_BASE}/api/vaccine-file`);
        if (!res.ok) throw new Error('Failed to fetch vaccine file');
        return res.json();
    },

    // Reset guardrails (for demo)
    async resetGuardrails(): Promise<{ status: string; message: string }> {
        const res = await fetch(`${API_BASE}/api/guardrails/reset`, {
            method: 'POST',
        });
        if (!res.ok) throw new Error('Failed to reset guardrails');
        return res.json();
    },

    // Get heal log
    async getHealLog(): Promise<any[]> {
        const res = await fetch(`${API_BASE}/api/heal-log`);
        if (!res.ok) throw new Error('Failed to fetch heal log');
        return res.json();
    },

    // Query Bastion directly
    async queryBastion(prompt: string): Promise<{ response: string }> {
        const res = await fetch(`${API_BASE}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'deepseek-r1:8b',
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
