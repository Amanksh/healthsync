'use client';

import { useState } from 'react';
import { Medicine, PaginatedResponse, invoiceApi, pharmacyApi } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency } from '@/lib/utils';
import DataTable from '@/components/data-table';
import Modal from '@/components/modal';
import { Search, Plus } from 'lucide-react';

interface Invoice {
    id: string;
    invoiceNumber: string;
    patient: {
        firstName: string;
        lastName: string;
        mrn: string;
    };
    paymentStatus: string;
    totalCents: number;
    createdAt: string;
    items: InvoiceItem[];
}

interface InvoiceItem {
    id: string;
    description: string;
    category: string;
    unitPriceCents: number;
    quantity: number;
    totalCents: number;
    medicineId?: string | null;
}

export default function PharmacyBillingPage() {
    const { token } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Search Invoices
    const handleSearch = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await invoiceApi.getAll(`search=${searchTerm}&limit=50&paymentStatus=PENDING`, token) as PaginatedResponse<Invoice>;
            // Handle if response is { data: [...], meta: ... } or just [...]
            setInvoices(response.data || []);
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { header: 'Invoice #', key: 'invoiceNumber' },
        {
            header: 'Patient',
            key: 'patient',
            render: (row: Invoice) => `${row.patient.firstName} ${row.patient.lastName} (${row.patient.mrn})`
        },
        { header: 'Date', key: 'createdAt', render: (row: Invoice) => new Date(row.createdAt).toLocaleDateString() },
        { header: 'Status', key: 'paymentStatus' },
        {
            header: 'Total',
            key: 'totalCents',
            render: (row: Invoice) => formatCurrency(row.totalCents / 100)
        },
        {
            header: 'Actions',
            key: 'actions',
            render: (row: Invoice) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInvoice(row);
                        setIsAddModalOpen(true);
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-teal-700 bg-teal-100 hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                    <Plus className="w-3 h-3 mr-1" /> Add Medicine
                </button>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Pharmacy Billing</h1>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border border-gray-200 flex gap-4 items-end">
                <div className="flex-1">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search Invoice</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            id="search"
                            className="focus:ring-teal-500 focus:border-teal-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                            placeholder="Invoice #, Patient Name, or MRN..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                </div>
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            <DataTable
                columns={columns}
                data={invoices}
                isLoading={loading}
                emptyMessage="No invoices found. Search to begin."
            />

            {selectedInvoice && (
                <AddMedicineToInvoiceModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    invoice={selectedInvoice}
                    token={token!}
                    onSuccess={() => {
                        setIsAddModalOpen(false);
                        handleSearch(); // Refresh list
                    }}
                />
            )}
        </div>
    );
}

function AddMedicineToInvoiceModal({
    isOpen,
    onClose,
    invoice,
    token,
    onSuccess
}: {
    isOpen: boolean;
    onClose: () => void;
    invoice: Invoice;
    token: string;
    onSuccess: () => void;
}) {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    const searchMedicines = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) return;
        try {
            const res = await pharmacyApi.getAllMedicines(`search=${query}&limit=10`, token);
            setMedicines(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMedicine) return;
        setSubmitting(true);
        try {
            // Update invoice with new item
            await invoiceApi.update(invoice.id, {
                items: [{
                    description: selectedMedicine.name,
                    category: 'MEDICATION',
                    unitPriceCents: selectedMedicine.unitPriceCents,
                    quantity: quantity,
                    medicineId: selectedMedicine.id
                }]
            }, token);
            onSuccess();
        } catch (error) {
            console.error('Failed to add medicine:', error);
            alert('Failed to add medicine. Check console.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Add Medicine to #${invoice.invoiceNumber}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Search Medicine</label>
                    <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                        placeholder="Type to search..."
                        value={searchQuery}
                        onChange={(e) => searchMedicines(e.target.value)}
                    />
                    {medicines.length > 0 && searchQuery.length >= 2 && !selectedMedicine && (
                        <div className="mt-1 border border-gray-200 rounded-md max-h-40 overflow-y-auto bg-white shadow-lg absolute z-10 w-full max-w-sm">
                            {medicines.map((med) => (
                                <div
                                    key={med.id}
                                    className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center text-sm"
                                    onClick={() => {
                                        setSelectedMedicine(med);
                                        setSearchQuery(med.name);
                                        setMedicines([]);
                                    }}
                                >
                                    <span className="font-medium text-gray-900">{med.name}</span>
                                    <span className="text-gray-500">
                                        Stock: {med.totalStock} | {formatCurrency(med.unitPriceCents / 100)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {selectedMedicine && (
                    <div className="p-3 bg-gray-50 rounded-md border border-gray-200 space-y-1">
                        <p className="font-medium text-teal-700">{selectedMedicine.name}</p>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Unit Price</span>
                            <span>{formatCurrency(selectedMedicine.unitPriceCents / 100)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Available Stock</span>
                            <span>{selectedMedicine.totalStock}</span>
                        </div>
                    </div>
                )}

                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                        id="quantity"
                        type="number"
                        min="1"
                        max={selectedMedicine?.totalStock || 999}
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="mt-1 block w-full rounded-md border-gray-300 border p-2 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    />
                </div>

                <div className="flex justify-end gap-3 mt-5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting || !selectedMedicine}
                        className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                    >
                        {submitting ? 'Adding...' : 'Add to Invoice'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
