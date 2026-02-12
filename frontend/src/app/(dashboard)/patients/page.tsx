'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { patientApi } from '@/lib/api-client';
import DataTable, { Column } from '@/components/data-table';
import PatientFormModal from '@/components/patient-form-modal';
import { formatDate } from '@/lib/utils';

interface Patient {
    id: string;
    mrn: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    email?: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    bloodGroup?: string;
    allergies?: string;
}

export default function PatientsPage() {
    const { token } = useAuth();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editPatient, setEditPatient] = useState<Patient | null>(null);

    const loadPatients = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '10' });
            if (search) params.set('search', search);
            const res = await patientApi.getAll(params.toString(), token) as { data: Patient[]; meta: { total: number; totalPages: number } };
            setPatients(res.data || []);
            setTotalPages(res.meta?.totalPages || 1);
        } catch (err) {
            console.error('Failed to load patients:', err);
        } finally {
            setLoading(false);
        }
    }, [token, page, search]);

    useEffect(() => {
        loadPatients();
    }, [loadPatients]);

    const handleCreate = async (data: any) => {
        await patientApi.create(data, token!);
        loadPatients();
    };

    const handleUpdate = async (data: any) => {
        if (!editPatient) return;
        await patientApi.update(editPatient.id, data, token!);
        setEditPatient(null);
        loadPatients();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this patient?')) return;
        await patientApi.delete(id, token!);
        loadPatients();
    };

    const columns: Column<Patient>[] = [
        { key: 'mrn', header: 'MRN', render: (p) => <span className="font-mono text-xs text-blue-400">{p.mrn}</span> },
        { key: 'name', header: 'Name', render: (p) => <span className="font-medium text-white">{p.firstName} {p.lastName}</span> },
        { key: 'dateOfBirth', header: 'DOB', render: (p) => formatDate(p.dateOfBirth) },
        {
            key: 'gender', header: 'Gender', render: (p) => {
                const colors: Record<string, string> = {
                    MALE: 'text-blue-400',
                    FEMALE: 'text-pink-400',
                    OTHER: 'text-purple-400',
                    UNKNOWN: 'text-slate-400',
                };
                return <span className={colors[p.gender] || ''}>{p.gender}</span>;
            }
        },
        { key: 'phone', header: 'Phone' },
        { key: 'city', header: 'City', render: (p) => p.city || '—' },
        {
            key: 'actions', header: 'Actions', render: (p) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setEditPatient(p)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                        title="Edit"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                    </button>
                    <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </button>
                </div>
            )
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Patient Registry</h1>
                    <p className="text-slate-400 mt-1">Manage patient records</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium text-sm hover:from-blue-500 hover:to-cyan-400 transition-all shadow-lg shadow-blue-500/20"
                >
                    + New Patient
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={patients}
                isLoading={loading}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                emptyMessage="No patients found. Add your first patient!"
            />

            {/* Create Modal */}
            <PatientFormModal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                onSubmit={handleCreate}
            />

            {/* Edit Modal */}
            {editPatient && (
                <PatientFormModal
                    isOpen={true}
                    onClose={() => setEditPatient(null)}
                    onSubmit={handleUpdate}
                    initialData={{
                        ...editPatient,
                        dateOfBirth: editPatient.dateOfBirth?.split('T')[0] || '',
                    }}
                    title="Edit Patient"
                />
            )}
        </div>
    );
}
