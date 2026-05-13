'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Activity,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Download,
    Droplets,
    ExternalLink,
    FileText,
    HeartPulse,
    Loader2,
    Plus,
    RadioTower,
    Radiation,
    Search,
    Send,
} from 'lucide-react';
import ReportFormModal from '@/components/report-form-modal';
import ReportDetailPanel from '@/components/report-detail-panel';
import { useAuth } from '@/lib/auth-context';
import { MedicalReport, ReportDeliveryStatus, ReportType, patientApi, reportsApi } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';

interface PatientOption {
    id: string;
    firstName: string;
    lastName: string;
    mrn: string;
    phone: string;
}

type ReportTypeFilter = ReportType | 'ALL';

const reportTypeConfig: Record<ReportType, {
    label: string;
    shortLabel: string;
    Icon: typeof FileText;
    badgeClass: string;
    iconClass: string;
}> = {
    BLOOD_REPORT: {
        label: 'Blood report',
        shortLabel: 'Blood',
        Icon: Droplets,
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-100',
        iconClass: 'bg-rose-50 text-rose-600',
    },
    ECG: {
        label: 'ECG',
        shortLabel: 'ECG',
        Icon: HeartPulse,
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        iconClass: 'bg-emerald-50 text-emerald-600',
    },
    ULTRASOUND: {
        label: 'Ultrasound',
        shortLabel: 'Ultrasound',
        Icon: RadioTower,
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-100',
        iconClass: 'bg-blue-50 text-blue-600',
    },
    XRAY: {
        label: 'X-ray',
        shortLabel: 'X-Ray',
        Icon: Radiation,
        badgeClass: 'bg-violet-50 text-violet-700 border-violet-100',
        iconClass: 'bg-violet-50 text-violet-600',
    },
    OTHER: {
        label: 'Other',
        shortLabel: 'Other',
        Icon: ClipboardList,
        badgeClass: 'bg-gray-50 text-gray-700 border-gray-200',
        iconClass: 'bg-gray-50 text-gray-600',
    },
};

const reportTypeTabs: Array<{ value: ReportTypeFilter; label: string; Icon: typeof FileText }> = [
    { value: 'ALL', label: 'All', Icon: FileText },
    { value: 'BLOOD_REPORT', label: 'Blood', Icon: Droplets },
    { value: 'ECG', label: 'ECG', Icon: HeartPulse },
    { value: 'ULTRASOUND', label: 'Ultrasound', Icon: RadioTower },
    { value: 'XRAY', label: 'X-Ray', Icon: Radiation },
    { value: 'OTHER', label: 'Other', Icon: ClipboardList },
];

const deliveryStyles: Record<ReportDeliveryStatus, { badge: string; dot: string; label: string }> = {
    NOT_SENT: {
        badge: 'bg-gray-50 text-gray-600 border-gray-200',
        dot: 'bg-gray-400',
        label: 'Pending delivery',
    },
    SENT: {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Sent',
    },
    FAILED: {
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        label: 'Failed',
    },
};

const isToday = (date?: string | null) => {
    if (!date) return false;
    return new Date(date).toDateString() === new Date().toDateString();
};

export default function ReportsPage() {
    const { token } = useAuth();
    const [reports, setReports] = useState<MedicalReport[]>([]);
    const [allReports, setAllReports] = useState<MedicalReport[]>([]);
    const [patients, setPatients] = useState<PatientOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [sendingId, setSendingId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [type, setType] = useState<ReportTypeFilter>('ALL');
    const [showForm, setShowForm] = useState(false);
    const [selectedReport, setSelectedReport] = useState<MedicalReport | null>(null);

    const loadReports = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '12' });
            if (searchQuery.trim()) params.set('search', searchQuery.trim());
            if (type !== 'ALL') params.set('type', type);

            const res = await reportsApi.getAll(params.toString(), token);
            setReports(res.data || []);
            setTotalPages(res.meta?.totalPages || 1);
            setTotalCount(res.meta?.total || 0);
        } catch (err) {
            console.error('Failed to load reports:', err);
        } finally {
            setLoading(false);
        }
    }, [token, page, searchQuery, type]);

    const loadAllReports = useCallback(async () => {
        if (!token) return;
        try {
            const res = await reportsApi.getAll('limit=500', token);
            setAllReports(res.data || []);
        } catch (err) {
            console.error('Failed to load report summary:', err);
        }
    }, [token]);

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
        loadAllReports();
    }, [loadAllReports]);

    useEffect(() => {
        loadPatients();
    }, [loadPatients]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(searchInput);
            setPage(1);
        }, 350);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const stats = useMemo(() => {
        const pendingDelivery = allReports.filter((report) => report.deliveryStatus === 'NOT_SENT').length;
        const sentToday = allReports.filter((report) => report.deliveryStatus === 'SENT' && isToday(report.deliveredAt)).length;
        const failed = allReports.filter((report) => report.deliveryStatus === 'FAILED').length;

        return {
            totalReports: allReports.length,
            pendingDelivery,
            sentToday,
            failed,
        };
    }, [allReports]);

    const statCards = [
        {
            label: 'Total Reports',
            value: stats.totalReports,
            helper: 'available records',
            Icon: FileText,
            className: 'bg-white text-gray-900 border-gray-100',
            iconClass: 'bg-teal-50 text-teal-600',
        },
        {
            label: 'Pending Delivery',
            value: stats.pendingDelivery,
            helper: 'waiting to be sent',
            Icon: Send,
            className: 'bg-amber-50 text-amber-700 border-amber-100',
            iconClass: 'bg-white/70 text-amber-600',
        },
        {
            label: 'Sent Today',
            value: stats.sentToday,
            helper: 'delivered today',
            Icon: Activity,
            className: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            iconClass: 'bg-white/70 text-emerald-600',
        },
        {
            label: 'Failed',
            value: stats.failed,
            helper: stats.failed > 0 ? 'needs attention' : 'no failures',
            Icon: Radiation,
            className: stats.failed > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-white text-gray-900 border-gray-100',
            iconClass: stats.failed > 0 ? 'bg-white/70 text-rose-600' : 'bg-gray-50 text-gray-500',
        },
    ];

    const handleCreate = async (data: FormData) => {
        if (!token) return;
        await reportsApi.create(data, token);
        await Promise.all([loadReports(), loadAllReports()]);
    };

    const updateReportInState = (updated: MedicalReport) => {
        setReports((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setAllReports((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setSelectedReport((prev) => (prev?.id === updated.id ? updated : prev));
    };

    const handleSend = async (report: MedicalReport) => {
        if (!token) return;
        setSendingId(report.id);
        try {
            const updated = await reportsApi.send(report.id, token);
            updateReportInState(updated);
        } catch (err) {
            console.error('Failed to send report:', err);
        } finally {
            setSendingId(null);
        }
    };

    const handleViewReport = async (report: MedicalReport) => {
        setSelectedReport(report);
        if (!token) return;
        try {
            const detail = await reportsApi.getById(report.id, token);
            setSelectedReport(detail);
            updateReportInState(detail);
        } catch {
            setSelectedReport(report);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <FileText className="text-teal-600" size={30} />
                        Reports
                    </h1>
                    <p className="text-gray-500 mt-1">Track patient reports, delivery status, and clinical files in one place</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-500 transition-colors shadow-sm shadow-teal-200"
                >
                    <Plus size={18} />
                    Add Report
                </button>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <div key={card.label} className={`${card.className} border rounded-xl px-5 py-4 shadow-sm`}>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase text-gray-400">{card.label}</p>
                                <p className="text-2xl font-bold mt-1">{card.value}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{card.helper}</p>
                            </div>
                            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.iconClass}`}>
                                <card.Icon size={19} />
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {reportTypeTabs.map((tab) => {
                        const isActive = type === tab.value;
                        return (
                            <button
                                key={tab.value}
                                onClick={() => {
                                    setType(tab.value);
                                    setPage(1);
                                }}
                                className={`inline-flex shrink-0 items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                                    isActive
                                        ? 'bg-teal-50 text-teal-700 border-teal-200 shadow-sm'
                                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                <tab.Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="relative w-full xl:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search title, patient, MRN..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                    <div>
                        <p className="font-semibold text-gray-900">Report Library</p>
                        <p className="text-xs text-gray-400 mt-0.5">{totalCount} reports matching current filters</p>
                    </div>
                    {loading && (
                        <span className="inline-flex items-center gap-2 text-xs font-medium text-gray-400">
                            <Loader2 className="animate-spin" size={14} />
                            Loading
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="grid gap-4 p-5 md:grid-cols-2 2xl:grid-cols-3">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="h-52 rounded-xl border border-gray-100 bg-gray-50 animate-pulse" />
                        ))}
                    </div>
                ) : reports.length === 0 ? (
                    <div className="px-5 py-16 text-center">
                        <FileText className="mx-auto text-gray-200" size={44} />
                        <p className="mt-3 font-medium text-gray-700">No reports found</p>
                        <p className="text-sm text-gray-400 mt-1">Try another report type, search term, or add a new report.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 p-5 md:grid-cols-2 2xl:grid-cols-3">
                        {reports.map((report) => {
                            const typeInfo = reportTypeConfig[report.type];
                            const delivery = deliveryStyles[report.deliveryStatus];
                            const TypeIcon = typeInfo.Icon;
                            const patientName = `${report.patient.firstName} ${report.patient.lastName}`;

                            return (
                                <article
                                    key={report.id}
                                    onClick={() => handleViewReport(report)}
                                    className="group flex min-h-52 cursor-pointer flex-col justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-teal-100 hover:bg-teal-50/20 hover:shadow-md"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${typeInfo.iconClass}`}>
                                                    <TypeIcon size={20} />
                                                </span>
                                                <div className="min-w-0">
                                                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${typeInfo.badgeClass}`}>
                                                        {typeInfo.shortLabel}
                                                    </span>
                                                    <h2 className="mt-2 line-clamp-2 text-base font-semibold text-gray-900">{report.title}</h2>
                                                </div>
                                            </div>
                                            <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${delivery.badge}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${delivery.dot}`} />
                                                {report.deliveryStatus === 'NOT_SENT' ? 'Pending' : delivery.label}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="rounded-xl bg-gray-50 px-3 py-2.5">
                                                <p className="text-[11px] font-bold uppercase text-gray-400">Patient</p>
                                                <p className="mt-0.5 truncate font-medium text-gray-900">{patientName}</p>
                                                <p className="font-mono text-xs text-teal-600">MRN: {report.patient.mrn}</p>
                                            </div>
                                            <div className="rounded-xl bg-gray-50 px-3 py-2.5">
                                                <p className="text-[11px] font-bold uppercase text-gray-400">Report Date</p>
                                                <p className="mt-0.5 font-medium text-gray-900">{formatDate(report.reportDate)}</p>
                                                <p className="text-xs text-gray-400">{report.deliveredAt ? `Sent ${formatDate(report.deliveredAt)}` : 'Delivery not completed'}</p>
                                            </div>
                                        </div>

                                        <a
                                            href={report.fileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="inline-flex max-w-full items-center gap-2 rounded-lg text-sm font-medium text-teal-700 hover:text-teal-600"
                                        >
                                            <ExternalLink size={15} />
                                            <span className="truncate">Preview report file</span>
                                        </a>
                                    </div>

                                    <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-3" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            type="button"
                                            onClick={() => handleViewReport(report)}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                                        >
                                            <ExternalLink size={14} />
                                            View
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleSend(report)}
                                            disabled={sendingId === report.id}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-40"
                                        >
                                            {sendingId === report.id ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                                            Send
                                        </button>
                                        <a
                                            href={report.fileUrl}
                                            download
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                                        >
                                            <Download size={14} />
                                            Download
                                        </a>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/60 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-gray-400">
                            Page {page} of {totalPages} · {totalCount} total reports
                        </p>
                        <div className="flex gap-1.5">
                            <button
                                onClick={() => setPage((current) => Math.max(1, current - 1))}
                                disabled={page <= 1}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={14} />
                                Previous
                            </button>
                            <button
                                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                                disabled={page >= totalPages}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ReportFormModal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                onSubmit={handleCreate}
                patients={patients}
            />

            <ReportDetailPanel
                report={selectedReport}
                sending={selectedReport ? sendingId === selectedReport.id : false}
                onClose={() => setSelectedReport(null)}
                onSend={handleSend}
            />
        </div>
    );
}
