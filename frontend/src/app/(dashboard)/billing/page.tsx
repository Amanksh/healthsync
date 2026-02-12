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
}

const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    PAID: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    PARTIALLY_PAID: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
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
            const res = await appointmentApi.getAll('limit=100&status=COMPLETED', token) as { data: Array<{ id: string; appointmentDate: string; patient: { id: string; firstName: string; lastName: string } }> };
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
            render: (inv) => <span className="font-mono text-xs text-blue-400">{inv.invoiceNumber}</span>
        },
        {
            key: 'patient', header: 'Patient',
            render: (inv) => <span className="text-white font-medium">{inv.patient.firstName} {inv.patient.lastName}</span>
        },
        {
            key: 'createdAt', header: 'Date',
            render: (inv) => formatDate(inv.createdAt)
        },
        {
            key: 'subtotalCents', header: 'Subtotal',
            render: (inv) => formatCurrency(inv.subtotalCents),
            className: 'text-right',
        },
        {
            key: 'taxAmountCents', header: 'Tax',
            render: (inv) => formatCurrency(inv.taxAmountCents),
            className: 'text-right',
        },
        {
            key: 'totalCents', header: 'Total',
            render: (inv) => <span className="font-semibold text-white">{formatCurrency(inv.totalCents)}</span>,
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
                inv.paymentStatus === 'PENDING' ? (
                    <button
                        onClick={() => handleMarkPaid(inv.id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    >
                        Mark Paid
                    </button>
                ) : null
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Billing & Invoices</h1>
                    <p className="text-slate-400 mt-1">Manage invoices and payments</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium text-sm hover:from-blue-500 hover:to-cyan-400 transition-all shadow-lg shadow-blue-500/20"
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
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === s
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                            : 'text-slate-400 border border-slate-800 hover:bg-slate-800/50'
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
