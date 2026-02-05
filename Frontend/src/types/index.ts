export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'analyst' | 'viewer';
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
    severity: 'low' | 'medium' | 'high' | 'critical';
    audit?: {
        violation: string;
        risk_score: number;
        category: string;
        reason: string;
    };
}

export interface AuditResult {
    id: string;
    timestamp: string;
    scanType: 'giskard' | 'shieldgemma' | 'pyrit';
    totalTests: number;
    passed: number;
    failed: number;
    violations: Violation[];
    reportUrl?: string;
}

export interface Violation {
    id: string;
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
}

export interface Guardrail {
    id: string;
    rule: string;
    category: string;
    active: boolean;
    createdAt: string;
    triggeredCount: number;
}

export interface SystemStats {
    totalAttacks: number;
    blockedAttacks: number;
    activeGuardrails: number;
    lastAudit: string;
    systemHealth: 'healthy' | 'warning' | 'critical';
}
