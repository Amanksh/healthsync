'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Medicine, pharmacyApi } from '@/lib/api-client';
import DataTable, { Column } from '@/components/data-table';
import AddMedicineModal from '@/components/add-medicine-modal';
import AddStockModal from '@/components/add-stock-modal';
import { Plus, Search, Archive } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function PharmacyInventoryPage() {
    const { token } = useAuth();
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [stockModalData, setStockModalData] = useState<{ id: string; name: string } | null>(null);

    const loadMedicines = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await pharmacyApi.getAllMedicines(`page=${page}&limit=20&search=${search}`, token);
            setMedicines(res.data || []);
            setTotalPages(res.meta.totalPages || 1);
        } catch (err) {
            console.error('Failed to load medicines:', err);
        } finally {
            setLoading(false);
        }
    }, [token, page, search]);

    useEffect(() => {
        loadMedicines();
    }, [loadMedicines]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        loadMedicines();
    };

    const columns: Column<Medicine>[] = [
        { key: 'name', header: 'Medicine Name', className: 'font-medium text-gray-900' },
        { key: 'genericName', header: 'Generic Name', className: 'text-gray-500' },
        { key: 'category', header: 'Category' },
        {
            key: 'totalStock',
            header: 'Stock',
            render: (med) => (
                <span className={med.totalStock <= med.minStock ? 'text-red-600 font-bold' : 'text-gray-700'}>
                    {med.totalStock}
                </span>
            )
        },
        {
            key: 'unitPriceCents',
            header: 'Unit Price',
            render: (med) => formatCurrency(med.unitPriceCents / 100)
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (med) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setStockModalData({ id: med.id, name: med.name });
                    }}
                    className="text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center gap-1"
                >
                    <Plus size={16} /> Add Stock
                </button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Archive className="text-teal-600" />
                    Medicine Inventory
                </h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition shadow-sm"
                >
                    <Plus size={18} /> Add Medicine
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search medicines by name, generic name, or code..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                    />
                </form>
            </div>

            <DataTable
                columns={columns}
                data={medicines}
                isLoading={loading}
                page={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
                emptyMessage="No medicines found. Click 'Add Medicine' to create one."
            />

            <AddMedicineModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={loadMedicines}
            />

            {stockModalData && (
                <AddStockModal
                    isOpen={!!stockModalData}
                    onClose={() => setStockModalData(null)}
                    onSuccess={loadMedicines}
                    medicineId={stockModalData.id}
                    medicineName={stockModalData.name}
                />
            )}
        </div>
    );
}
