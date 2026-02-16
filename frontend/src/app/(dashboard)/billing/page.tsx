'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { invoiceApi, appointmentApi } from '@/lib/api-client';
import DataTable, { Column } from '@/components/data-table';
import InvoiceFormModal from '@/components/invoice-form-modal';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Invoice {
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
    patient: { id: string; firstName: string; lastName: string };
    appointment: { id: string; appointmentDate: string };
    pdfUrl?: string;
}

const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PARTIALLY_PAID: 'bg-blue-50 text-blue-700 border-blue-200',
};

const paymentStatusFilters = ['ALL', 'PENDING', 'PAID', 'PARTIALLY_PAID'];

export default function BillingPage() {
    const { token } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showForm, setShowForm] = useState(false);
    const [appointments, setAppointments] = useState<Array<{ id: string; appointmentDate: string; patient: { id: string; firstName: string; lastName: string } }>>([]);

    const loadInvoices = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '10' });
            if (statusFilter !== 'ALL') params.set('paymentStatus', statusFilter);
            const res = await invoiceApi.getAll(params.toString(), token) as { data: Invoice[]; meta: { total: number; totalPages: number } };
            setInvoices(res.data || []);
            setTotalPages(res.meta?.totalPages || 1);
        } catch (err) {
            console.error('Failed to load invoices:', err);
        } finally {
            setLoading(false);
        }
    }, [token, page, statusFilter]);

    const loadAppointments = useCallback(async () => {
        if (!token) return;
        try {
            const res = await appointmentApi.getAll('limit=100&status=COMPLETED&sortBy=createdAt&sortOrder=desc', token) as { data: Array<{ id: string; appointmentDate: string; patient: { id: string; firstName: string; lastName: string } }> };
            setAppointments(res.data || []);
        } catch (err) {
            console.error('Failed to load appointments:', err);
        }
    }, [token]);

    useEffect(() => { loadInvoices(); }, [loadInvoices]);
    useEffect(() => { loadAppointments(); }, [loadAppointments]);

    const handleCreate = async (data: Record<string, unknown>) => {
        await invoiceApi.create(data, token!);
        setShowForm(false);
        loadInvoices();
    };

    const handleMarkPaid = async (id: string) => {
        await invoiceApi.update(id, { paymentStatus: 'PAID' }, token!);
        loadInvoices();
    };

    const columns: Column<Invoice>[] = [
        {
            key: 'invoiceNumber', header: 'Invoice #',
            render: (inv) => <span className="font-mono text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded">{inv.invoiceNumber}</span>
        },
        {
            key: 'patient', header: 'Patient',
            render: (inv) => <span className="text-gray-900 font-medium">{inv.patient.firstName} {inv.patient.lastName}</span>
        },
        {
            key: 'createdAt', header: 'Date',
            render: (inv) => formatDate(inv.createdAt)
        },
        {
            key: 'subtotalCents', header: 'Subtotal',
            render: (inv) => formatCurrency(inv.subtotalCents / 100),
            className: 'text-right',
        },
        {
            key: 'taxAmountCents', header: 'Tax',
            render: (inv) => formatCurrency(inv.taxAmountCents / 100),
            className: 'text-right',
        },
        {
            key: 'totalCents', header: 'Total',
            render: (inv) => <span className="font-semibold text-gray-900">{formatCurrency(inv.totalCents / 100)}</span>,
            className: 'text-right',
        },
        {
            key: 'paymentStatus', header: 'Status',
            render: (inv) => (
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusColors[inv.paymentStatus] || ''}`}>
                    {inv.paymentStatus.replace('_', ' ')}
                </span>
            )
        },
        {
            key: 'actions', header: '', render: (inv) => (
                <div className="flex items-center gap-2 justify-end">
                    {inv.pdfUrl && (
                        <a
                            href={inv.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                            title="Print Invoice"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                            </svg>
                        </a>
                    )}
                    {inv.paymentStatus === 'PENDING' && (
                        <button
                            onClick={() => handleMarkPaid(inv.id)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                            Mark Paid
                        </button>
                    )}
                </div>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Billing & Invoices</h1>
                    <p className="text-gray-500 mt-1">Manage invoices and payments</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2.5 rounded-xl bg-teal-600 text-white font-medium text-sm hover:bg-teal-500 transition-colors shadow-sm shadow-teal-200"
                >
                    + Create Invoice
                </button>
            </div>

            {/* Payment Status Filters */}
            <div className="flex gap-2">
                {paymentStatusFilters.map((s) => (
                    <button
                        key={s}
                        onClick={() => { setStatusFilter(s); setPage(1); }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === s
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : 'text-gray-500 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {s === 'ALL' ? 'All' : s.replace('_', ' ')}
                    </button>
                ))}
            </div>

            <DataTable
                columns={columns}
                data={invoices}
                isLoading={loading}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                emptyMessage="No invoices found."
            />

            <InvoiceFormModal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                onSubmit={handleCreate}
                appointments={appointments}
            />
        </div>
    );
}
