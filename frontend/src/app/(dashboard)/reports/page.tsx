'use client';

import { useCallback, useEffect, useState } from 'react';
import { FileText, Plus, Send, ExternalLink } from 'lucide-react';
import DataTable, { Column } from '@/components/data-table';
import ReportFormModal from '@/components/report-form-modal';
import { useAuth } from '@/lib/auth-context';
import { MedicalReport, ReportType, patientApi, reportsApi } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';

interface PatientOption {
    id: string;
    firstName: string;
    lastName: string;
    mrn: string;
    phone: string;
}

const reportTypeOptions: Array<{ value: ReportType | ''; label: string }> = [
    { value: '', label: 'All report types' },
    { value: 'BLOOD_REPORT', label: 'Blood reports' },
    { value: 'ECG', label: 'ECG' },
    { value: 'ULTRASOUND', label: 'Ultrasound' },
    { value: 'XRAY', label: 'X-rays' },
    { value: 'OTHER', label: 'Other' },
];

const reportTypeLabels: Record<ReportType, string> = {
    BLOOD_REPORT: 'Blood report',
    ECG: 'ECG',
    ULTRASOUND: 'Ultrasound',
    XRAY: 'X-ray',
    OTHER: 'Other',
};

export default function ReportsPage() {
    const { token } = useAuth();
    const [reports, setReports] = useState<MedicalReport[]>([]);
    const [patients, setPatients] = useState<PatientOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [sendingId, setSendingId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [type, setType] = useState<ReportType | ''>('');
    const [showForm, setShowForm] = useState(false);

    const loadReports = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '20' });
            if (search) params.set('search', search);
            if (type) params.set('type', type);

            const res = await reportsApi.getAll(params.toString(), token);
            setReports(res.data || []);
            setTotalPages(res.meta?.totalPages || 1);
        } catch (err) {
            console.error('Failed to load reports:', err);
        } finally {
            setLoading(false);
        }
    }, [token, page, search, type]);

    const loadPatients = useCallback(async () => {
        if (!token) return;
        try {
            const res = await patientApi.getAll('limit=100', token) as { data: PatientOption[] };
            setPatients(res.data || []);
        } catch (err) {
            console.error('Failed to load patients:', err);
        }
    }, [token]);

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    useEffect(() => {
        loadPatients();
    }, [loadPatients]);

    const handleCreate = async (data: FormData) => {
        if (!token) return;
        await reportsApi.create(data, token);
        await loadReports();
    };

    const handleSend = async (report: MedicalReport) => {
        if (!token) return;
        setSendingId(report.id);
        try {
            const updated = await reportsApi.send(report.id, token);
            setReports((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        } catch (err) {
            console.error('Failed to send report:', err);
        } finally {
            setSendingId(null);
        }
    };

    const deliveryClass: Record<string, string> = {
        NOT_SENT: 'bg-gray-50 text-gray-600 border-gray-200',
        SENT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        FAILED: 'bg-rose-50 text-rose-700 border-rose-200',
    };

    const columns: Column<MedicalReport>[] = [
        {
            key: 'title',
            header: 'Report',
            render: (report) => (
                <div>
                    <p className="font-medium text-gray-900">{report.title}</p>
                    <p className="text-xs text-gray-400">{reportTypeLabels[report.type]}</p>
                </div>
            ),
        },
        {
            key: 'patient',
            header: 'Patient',
            render: (report) => (
                <div>
                    <p className="text-gray-900">{report.patient.firstName} {report.patient.lastName}</p>
                    <p className="font-mono text-xs text-teal-600">{report.patient.mrn}</p>
                </div>
            ),
        },
        { key: 'reportDate', header: 'Date', render: (report) => formatDate(report.reportDate) },
        {
            key: 'deliveryStatus',
            header: 'Delivery',
            render: (report) => (
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${deliveryClass[report.deliveryStatus]}`}>
                    {report.deliveryStatus.replace('_', ' ')}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (report) => (
                <div className="flex items-center gap-2">
                    <a
                        href={report.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Open report"
                    >
                        <ExternalLink size={16} />
                    </a>
                    <button
                        onClick={() => handleSend(report)}
                        disabled={sendingId === report.id}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-40"
                        title="Send to patient"
                    >
                        <Send size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <FileText className="text-teal-600" size={30} />
                        Reports
                    </h1>
                    <p className="text-gray-500 mt-1">Manage patient blood reports, ECGs, ultrasounds, X-rays, and related files</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-500 transition-colors shadow-sm shadow-teal-200"
                >
                    <Plus size={18} />
                    Add Report
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative max-w-md flex-1">
                    <input
                        type="text"
                        placeholder="Search by patient, MRN, report title..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                    />
                </div>
                <select
                    value={type}
                    onChange={(e) => { setType(e.target.value as ReportType | ''); setPage(1); }}
                    className="w-full md:w-56 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                >
                    {reportTypeOptions.map((option) => (
                        <option key={option.value || 'all'} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <DataTable
                columns={columns}
                data={reports}
                isLoading={loading}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                emptyMessage="No reports found. Add the first report for a patient."
            />

            <ReportFormModal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                onSubmit={handleCreate}
                patients={patients}
            />
        </div>
    );
}
