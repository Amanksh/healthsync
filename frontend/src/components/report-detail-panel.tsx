'use client';

import {
    ClipboardList,
    Download,
    Droplets,
    ExternalLink,
    FileText,
    HeartPulse,
    Loader2,
    Phone,
    RadioTower,
    Radiation,
    Send,
    User,
    X,
} from 'lucide-react';
import { MedicalReport, ReportDeliveryStatus, ReportType } from '@/lib/api-client';
import { formatDate } from '@/lib/utils';

interface ReportDetailPanelProps {
    report: MedicalReport | null;
    sending?: boolean;
    onClose: () => void;
    onSend: (report: MedicalReport) => void;
}

const reportTypeConfig: Record<ReportType, {
    label: string;
    Icon: typeof FileText;
    badgeClass: string;
    iconClass: string;
}> = {
    BLOOD_REPORT: {
        label: 'Blood report',
        Icon: Droplets,
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-100',
        iconClass: 'bg-rose-50 text-rose-600',
    },
    ECG: {
        label: 'ECG',
        Icon: HeartPulse,
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        iconClass: 'bg-emerald-50 text-emerald-600',
    },
    ULTRASOUND: {
        label: 'Ultrasound',
        Icon: RadioTower,
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-100',
        iconClass: 'bg-blue-50 text-blue-600',
    },
    XRAY: {
        label: 'X-ray',
        Icon: Radiation,
        badgeClass: 'bg-violet-50 text-violet-700 border-violet-100',
        iconClass: 'bg-violet-50 text-violet-600',
    },
    OTHER: {
        label: 'Other',
        Icon: ClipboardList,
        badgeClass: 'bg-gray-50 text-gray-700 border-gray-200',
        iconClass: 'bg-gray-50 text-gray-600',
    },
};

const deliveryConfig: Record<ReportDeliveryStatus, { label: string; badgeClass: string; dotClass: string }> = {
    NOT_SENT: {
        label: 'Pending delivery',
        badgeClass: 'bg-gray-50 text-gray-600 border-gray-200',
        dotClass: 'bg-gray-400',
    },
    SENT: {
        label: 'Sent',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotClass: 'bg-emerald-500',
    },
    FAILED: {
        label: 'Failed',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        dotClass: 'bg-rose-500',
    },
};

export default function ReportDetailPanel({ report, sending = false, onClose, onSend }: ReportDetailPanelProps) {
    if (!report) return null;

    const typeInfo = reportTypeConfig[report.type];
    const delivery = deliveryConfig[report.deliveryStatus];
    const TypeIcon = typeInfo.Icon;
    const patientName = `${report.patient.firstName} ${report.patient.lastName}`;
    const uploadedBy = report.uploadedBy
        ? `${report.uploadedBy.firstName} ${report.uploadedBy.lastName}`
        : 'Not recorded';

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-xl overflow-y-auto bg-white shadow-2xl animate-in slide-in-from-right duration-200">
                <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                            <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${typeInfo.iconClass}`}>
                                <TypeIcon size={21} />
                            </span>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${typeInfo.badgeClass}`}>
                                        {typeInfo.label}
                                    </span>
                                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${delivery.badgeClass}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${delivery.dotClass}`} />
                                        {delivery.label}
                                    </span>
                                </div>
                                <h2 className="mt-2 text-lg font-bold text-gray-900">{report.title}</h2>
                                <p className="mt-0.5 text-xs text-gray-400">Report date: {formatDate(report.reportDate)}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                            aria-label="Close report details"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="space-y-6 p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-xl bg-gray-50 p-4">
                            <p className="text-[11px] font-bold uppercase text-gray-400">Patient</p>
                            <div className="mt-3 flex items-start gap-3">
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-teal-600">
                                    <User size={17} />
                                </span>
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-900">{patientName}</p>
                                    <p className="font-mono text-xs text-teal-600">MRN: {report.patient.mrn}</p>
                                    {report.patient.phone && (
                                        <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-gray-500">
                                            <Phone size={12} />
                                            {report.patient.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-gray-50 p-4">
                            <p className="text-[11px] font-bold uppercase text-gray-400">Uploaded By</p>
                            <p className="mt-3 font-semibold text-gray-900">{uploadedBy}</p>
                            <p className="mt-0.5 text-xs text-gray-500">Added {formatDate(report.createdAt)}</p>
                            <p className="text-xs text-gray-400">Last updated {formatDate(report.updatedAt)}</p>
                        </div>
                    </div>

                    <div className="rounded-xl border border-gray-100 p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <p className="text-[11px] font-bold uppercase text-gray-400">Report File</p>
                                <p className="mt-1 truncate text-sm font-medium text-gray-900">{report.fileUrl}</p>
                            </div>
                            <div className="flex shrink-0 gap-2">
                                <a
                                    href={report.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                >
                                    <ExternalLink size={16} />
                                    Preview
                                </a>
                                <a
                                    href={report.fileUrl}
                                    download
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                                >
                                    <Download size={16} />
                                    Download
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-xl border p-4 ${delivery.badgeClass}`}>
                        <p className="text-[11px] font-bold uppercase opacity-70">Delivery</p>
                        <p className="mt-2 text-sm font-semibold">{delivery.label}</p>
                        {report.deliveredAt ? (
                            <p className="mt-1 text-xs opacity-80">Delivered on {formatDate(report.deliveredAt)}</p>
                        ) : (
                            <p className="mt-1 text-xs opacity-80">This report has not been delivered to the patient yet.</p>
                        )}
                        {report.deliveryError && (
                            <p className="mt-3 rounded-lg bg-white/70 px-3 py-2 text-xs text-rose-700">{report.deliveryError}</p>
                        )}
                    </div>

                    <div className="rounded-xl bg-amber-50/60 p-4 ring-1 ring-amber-100">
                        <p className="text-[11px] font-bold uppercase text-amber-600">Notes</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                            {report.notes?.trim() || 'No clinical notes were added for this report.'}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row">
                        <button
                            onClick={() => onSend(report)}
                            disabled={sending}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-500 disabled:opacity-50"
                        >
                            {sending ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />}
                            Send to Patient
                        </button>
                        <a
                            href={report.fileUrl}
                            download
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            <Download size={17} />
                            Download
                        </a>
                        <a
                            href={report.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            <ExternalLink size={17} />
                            Open
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
