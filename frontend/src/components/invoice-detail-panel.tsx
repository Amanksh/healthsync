'use client';

import React from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface InvoiceItem {
    id: string;
    description: string;
    category: string;
    unitPriceCents: number;
    quantity: number;
    totalCents: number;
}

interface InvoiceDetail {
    id: string;
    invoiceNumber: string;
    subtotalCents: number;
    taxRate: number;
    taxAmountCents: number;
    discountCents: number;
    totalCents: number;
    paymentStatus: string;
    notes?: string;
    createdAt: string;
    pdfUrl?: string;
    patient: { id: string; firstName: string; lastName: string; mrn?: string; phone?: string };
    appointment?: { id: string; appointmentDate: string; provider?: { firstName: string; lastName: string } };
    items: InvoiceItem[];
}

interface InvoiceDetailPanelProps {
    invoice: InvoiceDetail | null;
    onClose: () => void;
    onMarkPaid: (id: string) => void;
}

const statusStyles: Record<string, { bg: string; dot: string }> = {
    PENDING: { bg: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
    PAID: { bg: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
    PARTIALLY_PAID: { bg: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
};

const categoryLabels: Record<string, string> = {
    CONSULTATION: 'Consultation',
    LAB_TEST: 'Lab Test',
    MEDICATION: 'Medication',
    PROCEDURE: 'Procedure',
    OTHER: 'Other',
};

export default function InvoiceDetailPanel({ invoice, onClose, onMarkPaid }: InvoiceDetailPanelProps) {
    if (!invoice) return null;

    const style = statusStyles[invoice.paymentStatus] || statusStyles.PENDING;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-200">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                    <div>
                        <span className="font-mono text-sm text-teal-600 bg-teal-50 px-2.5 py-1 rounded-lg">{invoice.invoiceNumber}</span>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(invoice.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${style.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {invoice.paymentStatus.replace('_', ' ')}
                        </span>
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Patient & Doctor Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-[11px] font-bold text-gray-400 uppercase mb-2">Patient</p>
                            <p className="font-semibold text-gray-900">{invoice.patient.firstName} {invoice.patient.lastName}</p>
                            {invoice.patient.mrn && <p className="text-xs text-gray-500 mt-0.5">MRN: {invoice.patient.mrn}</p>}
                            {invoice.patient.phone && <p className="text-xs text-gray-500">📞 {invoice.patient.phone}</p>}
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-[11px] font-bold text-gray-400 uppercase mb-2">Appointment</p>
                            {invoice.appointment ? (
                                <>
                                    <p className="font-semibold text-gray-900">{formatDate(invoice.appointment.appointmentDate)}</p>
                                    {invoice.appointment.provider && (
                                        <p className="text-xs text-gray-500 mt-0.5">Dr. {invoice.appointment.provider.firstName} {invoice.appointment.provider.lastName}</p>
                                    )}
                                </>
                            ) : <p className="text-sm text-gray-400">N/A</p>}
                        </div>
                    </div>

                    {/* Line Items */}
                    <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase mb-3">Line Items</p>
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Item</th>
                                        <th className="text-center px-2 py-2.5 text-xs font-semibold text-gray-500">Qty</th>
                                        <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {invoice.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900">{item.description || categoryLabels[item.category] || item.category}</p>
                                                <p className="text-xs text-gray-400">{categoryLabels[item.category] || item.category} · {formatCurrency(item.unitPriceCents / 100)} each</p>
                                            </td>
                                            <td className="text-center px-2 py-3 text-gray-600">×{item.quantity}</td>
                                            <td className="text-right px-4 py-3 font-medium text-gray-900">{formatCurrency(item.totalCents / 100)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Subtotal</span><span>{formatCurrency(invoice.subtotalCents / 100)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Tax ({(Number(invoice.taxRate) * 100).toFixed(0)}%)</span><span>{formatCurrency(invoice.taxAmountCents / 100)}</span>
                        </div>
                        {invoice.discountCents > 0 && (
                            <div className="flex justify-between text-sm text-emerald-600">
                                <span>Discount</span><span>-{formatCurrency(invoice.discountCents / 100)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                            <span>Total</span><span>{formatCurrency(invoice.totalCents / 100)}</span>
                        </div>
                    </div>

                    {/* Notes */}
                    {invoice.notes && (
                        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                            <p className="text-[11px] font-bold text-amber-600 uppercase mb-1">Notes</p>
                            <p className="text-sm text-gray-700">{invoice.notes}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        {invoice.pdfUrl && (
                            <a
                                href={invoice.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                                </svg>
                                Print / Download
                            </a>
                        )}
                        {invoice.paymentStatus === 'PENDING' && (
                            <button
                                onClick={() => onMarkPaid(invoice.id)}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Mark as Paid
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
