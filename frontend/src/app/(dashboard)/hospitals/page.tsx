'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { hospitalApi } from '@/lib/api-client';
import DataTable, { Column } from '@/components/data-table';
import HospitalFormModal from '@/components/hospital-form-modal';

interface Hospital {
    id: string;
    name: string;
    branch: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    phone: string | null;
    managerName: string | null;
    isActive: boolean;
    createdAt: string;
    _count?: { users: number; patients: number };
}

export default function HospitalsPage() {
    const { token, user } = useAuth();
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showForm, setShowForm] = useState(false);
    const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (token) loadHospitals();
    }, [token, page, search]);

    // Only SUPER_ADMIN can access this page
    if (user?.role !== 'SUPER_ADMIN') {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-400 text-lg">You do not have permission to access this page.</p>
            </div>
        );
    }

    async function loadHospitals() {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '10' });
            if (search) params.set('search', search);
            const res = await hospitalApi.getAll(params.toString(), token!) as { data: Hospital[]; meta: { total: number; totalPages: number } };
            setHospitals(res.data || []);
            setTotalPages(res.meta?.totalPages || 1);
        } catch (err) {
            console.error('Failed to load hospitals:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate(data: Record<string, unknown>) {
        await hospitalApi.create(data, token!);
        setShowForm(false);
        loadHospitals();
    }

    async function handleUpdate(data: Record<string, unknown>) {
        if (!editingHospital) return;
        await hospitalApi.update(editingHospital.id, data, token!);
        setEditingHospital(null);
        loadHospitals();
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this hospital? This cannot be undone.')) return;
        try {
            await hospitalApi.delete(id, token!);
            loadHospitals();
        } catch (err) {
            console.error('Failed to delete hospital:', err);
            alert('Cannot delete hospital. It may still have associated data (users, patients, etc.).');
        }
    }

    const columns: Column<Hospital>[] = [
        { key: 'name', header: 'Organization', render: (row) => <span className="font-medium text-gray-900">{row.name}</span> },
        { key: 'branch', header: 'Branch' },
        { key: 'managerName', header: 'Manager' },
        { key: 'city', header: 'City' },
        { key: 'phone', header: 'Phone' },
        {
            key: '_count',
            header: 'Staff / Patients',
            render: (row: Hospital) => (
                <span className="text-gray-600">
                    {row._count?.users || 0} / {row._count?.patients || 0}
                </span>
            ),
        },
        {
            key: 'isActive',
            header: 'Status',
            render: (row: Hospital) => (
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${row.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                    {row.isActive ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (row: Hospital) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setEditingHospital(row)}
                        className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                    </button>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Hospitals</h1>
                    <p className="text-gray-500 mt-1">Manage registered hospitals</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-500 transition-colors shadow-sm shadow-teal-200"
                >
                    + Add Hospital
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search by name, city, or manager..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm transition-all"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={hospitals}
                isLoading={loading}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
            />

            {/* Create Modal */}
            <HospitalFormModal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                onSubmit={handleCreate}
            />

            {/* Edit Modal */}
            {editingHospital && (
                <HospitalFormModal
                    isOpen={true}
                    onClose={() => setEditingHospital(null)}
                    onSubmit={handleUpdate}
                    hospital={editingHospital}
                />
            )}
        </div>
    );
}
