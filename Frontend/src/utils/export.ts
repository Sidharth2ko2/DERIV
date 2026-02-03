import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Attack, AuditResult, Guardrail } from '../types';

export const exportAttacksToCSV = (attacks: Attack[]) => {
    const headers = ['Timestamp', 'Category', 'Severity', 'Objective', 'Success', 'Prompt', 'Response'];
    const rows = attacks.map(attack => [
        new Date(attack.timestamp).toLocaleString(),
        attack.category,
        attack.severity,
        attack.objective,
        attack.success ? 'Yes' : 'No',
        attack.prompt.substring(0, 100) + '...',
        attack.response.substring(0, 100) + '...',
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attacks_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
};

export const exportAuditToPDF = (audit: AuditResult) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(255, 68, 79);
    doc.text('Deriv Sentinel - Audit Report', 14, 20);

    // Metadata
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Scan Type: ${audit.scanType}`, 14, 30);
    doc.text(`Timestamp: ${audit.timestamp}`, 14, 36);
    doc.text(`Total Tests: ${audit.totalTests}`, 14, 42);
    doc.text(`Passed: ${audit.passed}`, 14, 48);
    doc.text(`Failed: ${audit.failed}`, 14, 54);

    // Violations Table
    if (audit.violations.length > 0) {
        autoTable(doc, {
            startY: 65,
            head: [['Category', 'Severity', 'Description']],
            body: audit.violations.map(v => [
                v.category,
                v.severity.toUpperCase(),
                v.description,
            ]),
            theme: 'grid',
            headStyles: { fillColor: [255, 68, 79] },
        });
    }

    doc.save(`audit_report_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportGuardrailsToCSV = (guardrails: Guardrail[]) => {
    const headers = ['Rule', 'Category', 'Active', 'Triggered Count', 'Created At'];
    const rows = guardrails.map(g => [
        g.rule,
        g.category,
        g.active ? 'Yes' : 'No',
        g.triggeredCount.toString(),
        g.createdAt,
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `guardrails_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
};
