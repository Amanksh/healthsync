'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { invoiceApi, appointmentApi } from '@/lib/api-client';
import InvoiceFormModal from '@/components/invoice-form-modal';
import InvoiceDetailPanel from '@/components/invoice-detail-panel';
import { formatCurrency, formatDate } from '@/lib/utils';

interface InvoiceItem {
    id: string;
    description: string;
    category: string;
    unitPriceCents: number;
    quantity: number;
    totalCents: number;
}

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
    patient: { id: string; firstName: string; lastName: string; mrn?: string; phone?: string };
    appointment: { id: string; appointmentDate: string; provider?: { firstName: string; lastName: string } };
    items: InvoiceItem[];
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
    const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [appointments, setAppointments] = useState<Array<{ id: string; appointmentDate: string; reason?: string; patient: { id: string; firstName: string; lastName: string; phone?: string; mrn?: string } }>>([]);

    const loadInvoices = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '10' });
            if (statusFilter !== 'ALL') params.set('paymentStatus', statusFilter);
            if (searchQuery.trim()) params.set('search', searchQuery.trim());
            const res = await invoiceApi.getAll(params.toString(), token) as { data: Invoice[]; meta: { total: number; totalPages: number } };
            setInvoices(res.data || []);
            setTotalPages(res.meta?.totalPages || 1);
            setTotalCount(res.meta?.total || 0);
        } catch (err) {
            console.error('Failed to load invoices:', err);
        } finally {
            setLoading(false);
        }
    }, [token, page, statusFilter, searchQuery]);

    // Load all invoices for summary stats (no pagination/filter)
    const loadAllInvoices = useCallback(async () => {
        if (!token) return;
        try {
            const res = await invoiceApi.getAll('limit=500', token) as { data: Invoice[] };
            setAllInvoices(res.data || []);
        } catch { /* ignore */ }
    }, [token]);

    const loadAppointments = useCallback(async () => {
        if (!token) return;
        try {
            const res = await appointmentApi.getAll('limit=100&status=COMPLETED&sortBy=createdAt&sortOrder=desc', token) as { data: Array<{ id: string; appointmentDate: string; reason?: string; patient: { id: string; firstName: string; lastName: string; phone?: string; mrn?: string } }> };
            setAppointments(res.data || []);
        } catch (err) {
            console.error('Failed to load appointments:', err);
        }
    }, [token]);

    useEffect(() => { loadInvoices(); }, [loadInvoices]);
    useEffect(() => { loadAllInvoices(); }, [loadAllInvoices]);
    useEffect(() => { loadAppointments(); }, [loadAppointments]);

    // Revenue summary stats
    const stats = useMemo(() => {
        const today = new Date().toDateString();
        let totalRevenue = 0, pendingAmount = 0, collectedToday = 0, paidCount = 0, pendingCount = 0;

        allInvoices.forEach((inv) => {
            const amount = inv.totalCents / 100;
            totalRevenue += amount;
            if (inv.paymentStatus === 'PAID') {
                paidCount++;
                if (new Date(inv.createdAt).toDateString() === today) collectedToday += amount;
            } else if (inv.paymentStatus === 'PENDING') {
                pendingAmount += amount;
                pendingCount++;
            }
        });

        return { totalRevenue, pendingAmount, collectedToday, paidCount, pendingCount, avgInvoice: allInvoices.length > 0 ? totalRevenue / allInvoices.length : 0 };
    }, [allInvoices]);

    const handleCreate = async (data: Record<string, unknown>) => {
        await invoiceApi.create(data, token!);
        setShowForm(false);
        loadInvoices();
        loadAllInvoices();
    };

    const handleMarkPaid = async (id: string) => {
        await invoiceApi.update(id, { paymentStatus: 'PAID' }, token!);
        loadInvoices();
        loadAllInvoices();
        if (selectedInvoice?.id === id) setSelectedInvoice(null);
    };

    const handleViewInvoice = async (inv: Invoice) => {
        // Load full detail if items are missing
        if (!inv.items || inv.items.length === 0) {
            try {
                const detail = await invoiceApi.getById(inv.id, token!) as Invoice;
                setSelectedInvoice(detail);
            } catch {
                setSelectedInvoice(inv);
            }
        } else {
            setSelectedInvoice(inv);
        }
    };

    // Debounced search
    const [searchInput, setSearchInput] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => { setSearchQuery(searchInput); setPage(1); }, 350);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const statCards = [
        { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), color: 'text-gray-900', bg: 'bg-white', icon: '₹' },
        { label: 'Pending', value: formatCurrency(stats.pendingAmount), color: 'text-amber-600', bg: 'bg-amber-50', icon: '⏳', sub: `${stats.pendingCount} invoices` },
        { label: 'Collected Today', value: formatCurrency(stats.collectedToday), color: 'text-emerald-600', bg: 'bg-emerald-50', icon: '✓', sub: 'today' },
        { label: 'Avg. Invoice', value: formatCurrency(stats.avgInvoice), color: 'text-blue-600', bg: 'bg-blue-50', icon: '~' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Billing & Invoices</h1>
                    <p className="text-gray-500 mt-1">Manage invoices, payments, and revenue</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2.5 rounded-xl bg-teal-600 text-white font-medium text-sm hover:bg-teal-500 transition-colors shadow-sm shadow-teal-200"
                >
                    + Create Invoice
                </button>
            </div>

            {/* Revenue Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => (
                    <div key={card.label} className={`${card.bg} border border-gray-100 rounded-xl px-5 py-4 shadow-sm`}>
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-gray-400 uppercase">{card.label}</p>
                            <span className="text-lg opacity-40">{card.icon}</span>
                        </div>
                        <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                        {card.sub && <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>}
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
                <div className="flex gap-2 flex-wrap">
                    {paymentStatusFilters.map((s) => (
                        <button
                            key={s}
                            onClick={() => { setStatusFilter(s); setPage(1); }}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${statusFilter === s
                                ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                : 'text-gray-500 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {s === 'ALL' ? `All (${totalCount})` : s.replace('_', ' ')}
                        </button>
                    ))}
                </div>
                <div className="relative w-full sm:w-72">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search invoice #, patient name..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                </div>
            </div>

            {/* Invoice Table */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/80">
                            <tr>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Invoice</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Patient</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase text-right">Amount</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={6} className="px-5 py-4"><div className="h-5 bg-gray-100 rounded-lg animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center text-gray-400">
                                        <svg className="w-10 h-10 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                        </svg>
                                        No invoices found
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((inv) => (
                                    <tr
                                        key={inv.id}
                                        onClick={() => handleViewInvoice(inv)}
                                        className="hover:bg-teal-50/30 cursor-pointer transition-colors group"
                                    >
                                        <td className="px-5 py-4">
                                            <span className="font-mono text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded group-hover:bg-teal-100 transition-colors">{inv.invoiceNumber}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{inv.patient.firstName} {inv.patient.lastName}</p>
                                                {inv.patient.mrn && <p className="text-xs text-gray-400">MRN: {inv.patient.mrn}</p>}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-gray-600">{formatDate(inv.createdAt)}</td>
                                        <td className="px-5 py-4 text-right">
                                            <span className="font-semibold text-gray-900">{formatCurrency(inv.totalCents / 100)}</span>
                                            {inv.taxAmountCents > 0 && (
                                                <p className="text-[11px] text-gray-400">incl. tax {formatCurrency(inv.taxAmountCents / 100)}</p>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusColors[inv.paymentStatus] || ''}`}>
                                                {inv.paymentStatus.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                                                {inv.pdfUrl && (
                                                    <a
                                                        href={inv.pdfUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                                        title="Download PDF"
                                                    >
                                                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
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
                                                <button
                                                    onClick={() => handleViewInvoice(inv)}
                                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                        <p className="text-xs text-gray-400">
                            Page {page} of {totalPages} · {totalCount} total invoices
                        </p>
                        <div className="flex gap-1.5">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Invoice Form Modal */}
            <InvoiceFormModal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                onSubmit={handleCreate}
                appointments={appointments}
            />

            {/* Invoice Detail Slide-out Panel */}
            <InvoiceDetailPanel
                invoice={selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
                onMarkPaid={handleMarkPaid}
            />
        </div>
    );
}
