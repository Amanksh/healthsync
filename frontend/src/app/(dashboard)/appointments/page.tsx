'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { appointmentApi, patientApi, apiClient } from '@/lib/api-client';
import DataTable, { Column } from '@/components/data-table';
import AppointmentFormModal from '@/components/appointment-form-modal';
import { formatDateTime } from '@/lib/utils';

interface Appointment {
    id: string;
    appointmentDate: string;
    durationMinutes: number;
    status: string;
    reason?: string;
    notes?: string;
    patient: { id: string; firstName: string; lastName: string; mrn: string };
    provider: { id: string; firstName: string; lastName: string };
}

const statusColors: Record<string, string> = {
    SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
    NO_SHOW: 'bg-amber-50 text-amber-700 border-amber-200',
};

const statusFilters = ['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

export default function AppointmentsPage() {
    const { token } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showForm, setShowForm] = useState(false);
    const [patients, setPatients] = useState<Array<{ id: string; firstName: string; lastName: string; mrn: string }>>([]);
    const [providers, setProviders] = useState<Array<{ id: string; firstName: string; lastName: string }>>([]);

    const loadAppointments = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '10' });
            if (statusFilter !== 'ALL') params.set('status', statusFilter);
            const res = await appointmentApi.getAll(params.toString(), token) as { data: Appointment[]; meta: { total: number; totalPages: number } };
            setAppointments(res.data || []);
            setTotalPages(res.meta?.totalPages || 1);
        } catch (err) {
            console.error('Failed to load appointments:', err);
        } finally {
            setLoading(false);
        }
    }, [token, page, statusFilter]);

    const loadFormData = useCallback(async () => {
        if (!token) return;
        try {
            const [pRes] = await Promise.all([
                patientApi.getAll('limit=100', token) as Promise<{ data: Array<{ id: string; firstName: string; lastName: string; mrn: string }> }>,
            ]);
            setPatients(pRes.data || []);

            // Load providers (doctors) - we'll use a simple GET on users
            try {
                const dRes = await apiClient.get('/users?role=DOCTOR&limit=100', token) as { data: Array<{ id: string; firstName: string; lastName: string }> };
                setProviders(dRes.data || []);
            } catch {
                // If /users endpoint doesn't exist, use empty array
                setProviders([]);
            }
        } catch (err) {
            console.error('Failed to load form data:', err);
        }
    }, [token]);

    useEffect(() => { loadAppointments(); }, [loadAppointments]);
    useEffect(() => { loadFormData(); }, [loadFormData]);

    const handleCreate = async (data: Record<string, unknown>) => {
        await appointmentApi.create(data, token!);
        setShowForm(false);
        loadAppointments();
    };

    const handleComplete = async (id: string) => {
        if (!confirm('Mark this appointment as completed?')) return;
        await appointmentApi.update(id, { status: 'COMPLETED' }, token!);
        loadAppointments();
    };

    const handleCancel = async (id: string) => {
        if (!confirm('Cancel this appointment?')) return;
        await appointmentApi.cancel(id, token!);
        loadAppointments();
    };

    const columns: Column<Appointment>[] = [
        {
            key: 'appointmentDate', header: 'Date & Time',
            render: (a) => <span className="font-medium text-gray-900">{formatDateTime(a.appointmentDate)}</span>
        },
        {
            key: 'patient', header: 'Patient',
            render: (a) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{a.patient.firstName} {a.patient.lastName}</span>
                    <span className="text-xs text-gray-400">MRN: {a.patient.mrn}</span>
                </div>
            )
        },
        {
            key: 'provider', header: 'Doctor',
            render: (a) => <span className="text-gray-700">Dr. {a.provider.firstName} {a.provider.lastName}</span>
        },
        { key: 'durationMinutes', header: 'Duration', render: (a) => `${a.durationMinutes} min` },
        {
            key: 'status', header: 'Status',
            render: (a) => (
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusColors[a.status] || ''}`}>
                    {a.status.replace('_', ' ')}
                </span>
            )
        },
        { key: 'reason', header: 'Reason', render: (a) => a.reason || '—' },
        {
            key: 'actions', header: '', render: (a) => (
                a.status === 'SCHEDULED' ? (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleComplete(a.id)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                            Complete
                        </button>
                        <button
                            onClick={() => handleCancel(a.id)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                ) : null
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
                    <p className="text-gray-500 mt-1">Schedule and manage appointments</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2.5 rounded-xl bg-teal-600 text-white font-medium text-sm hover:bg-teal-500 transition-colors shadow-sm shadow-teal-200"
                >
                    + Book Appointment
                </button>
            </div>

            {/* Status Filters */}
            <div className="flex gap-2">
                {statusFilters.map((s) => (
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
                data={appointments}
                isLoading={loading}
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                emptyMessage="No appointments found."
            />

            <AppointmentFormModal
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                onSubmit={handleCreate}
                patients={patients}
                providers={providers}
            />
        </div>
    );
}
