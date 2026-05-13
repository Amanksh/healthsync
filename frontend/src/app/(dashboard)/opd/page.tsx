'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    Activity,
    ArrowRight,
    CalendarPlus,
    CheckCircle2,
    ClipboardList,
    Download,
    Filter,
    HeartPulse,
    Stethoscope,
    Thermometer,
    Waves,
} from 'lucide-react';
import { appointmentApi, patientApi, apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import AppointmentFormModal from '@/components/appointment-form-modal';

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

interface DoctorFilter {
    id: string;
    name: string;
}

const priorityClass = {
    EMERGENCY: 'bg-rose-50 text-rose-600 border-rose-100',
    ROUTINE: 'bg-orange-50 text-orange-600 border-orange-100',
};

function getInitials(firstName: string, lastName: string) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getPriority(appointment: Appointment) {
    const text = `${appointment.reason || ''} ${appointment.notes || ''}`.toLowerCase();
    return text.includes('emergency') || text.includes('chest pain') || text.includes('urgent')
        ? 'EMERGENCY'
        : 'ROUTINE';
}

function formatTime(date: string) {
    return new Date(date).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function OpdPage() {
    const { token } = useAuth();
    const [waitingAppointments, setWaitingAppointments] = useState<Appointment[]>([]);
    const [completedAppointments, setCompletedAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoctorId, setSelectedDoctorId] = useState('ALL');
    const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
    const [startedAt, setStartedAt] = useState<Date | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [dragOverActive, setDragOverActive] = useState(false);

    // Appointment booking form state
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [patients, setPatients] = useState<Array<{ id: string; firstName: string; lastName: string; mrn: string; phone?: string }>>([]);
    const [providers, setProviders] = useState<Array<{ id: string; firstName: string; lastName: string }>>([]);

    const loadAppointments = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const [waitingRes, completedRes] = await Promise.all([
                appointmentApi.getAll('status=SCHEDULED&limit=100&sortBy=appointmentDate&sortOrder=asc', token) as Promise<{ data: Appointment[] }>,
                appointmentApi.getAll('status=COMPLETED&limit=20&sortBy=updatedAt&sortOrder=desc', token) as Promise<{ data: Appointment[] }>,
            ]);

            setWaitingAppointments(waitingRes.data || []);
            setCompletedAppointments(completedRes.data || []);
        } catch (err) {
            console.error('Failed to load OPD appointments:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    const loadFormData = useCallback(async () => {
        if (!token) return;
        try {
            const pRes = await patientApi.getAll('limit=100', token) as { data: Array<{ id: string; firstName: string; lastName: string; mrn: string; phone?: string }> };
            setPatients(pRes.data || []);

            try {
                const dRes = await apiClient.get('/users?role=DOCTOR&limit=100', token) as { data: Array<{ id: string; firstName: string; lastName: string }> };
                setProviders(dRes.data || []);
            } catch {
                setProviders([]);
            }
        } catch (err) {
            console.error('Failed to load form data:', err);
        }
    }, [token]);

    useEffect(() => {
        loadAppointments();
    }, [loadAppointments]);

    useEffect(() => {
        loadFormData();
    }, [loadFormData]);

    useEffect(() => {
        if (!startedAt) return;
        const timer = window.setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startedAt.getTime()) / 1000));
        }, 1000);

        return () => window.clearInterval(timer);
    }, [startedAt]);

    const doctors = useMemo<DoctorFilter[]>(() => {
        const doctorMap = new Map<string, DoctorFilter>();
        [...waitingAppointments, ...completedAppointments].forEach((appointment) => {
            doctorMap.set(appointment.provider.id, {
                id: appointment.provider.id,
                name: `Dr. ${appointment.provider.firstName} ${appointment.provider.lastName}`,
            });
        });
        return Array.from(doctorMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [waitingAppointments, completedAppointments]);

    const filteredWaiting = useMemo(() => {
        const queue = waitingAppointments.filter((appointment) => appointment.id !== activeAppointment?.id);
        if (selectedDoctorId === 'ALL') return queue;
        return queue.filter((appointment) => appointment.provider.id === selectedDoctorId);
    }, [waitingAppointments, activeAppointment, selectedDoctorId]);

    const filteredCompleted = useMemo(() => {
        if (selectedDoctorId === 'ALL') return completedAppointments;
        return completedAppointments.filter((appointment) => appointment.provider.id === selectedDoctorId);
    }, [completedAppointments, selectedDoctorId]);

    const startConsultation = (appointment: Appointment) => {
        setActiveAppointment(appointment);
        setStartedAt(new Date());
        setElapsedSeconds(0);
        setSelectedDoctorId(appointment.provider.id);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragOverActive(false);
        const appointmentId = event.dataTransfer.getData('appointmentId');
        const appointment = waitingAppointments.find((item) => item.id === appointmentId);
        if (appointment) startConsultation(appointment);
    };

    const completeAppointment = async () => {
        if (!token || !activeAppointment) return;
        await appointmentApi.update(activeAppointment.id, { status: 'COMPLETED' }, token);
        setActiveAppointment(null);
        setStartedAt(null);
        setElapsedSeconds(0);
        await loadAppointments();
    };

    const handleBookAppointment = async (data: Record<string, unknown>) => {
        await appointmentApi.create(data, token!);
        setShowBookingForm(false);
        await loadAppointments();
    };

    const duration = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:${String(elapsedSeconds % 60).padStart(2, '0')}`;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Stethoscope className="text-teal-600" size={30} />
                        OPD Management
                    </h1>
                    <p className="text-gray-500 mt-1">Manage doctor queues, active consultations, and completed OPD visits</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowBookingForm(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 text-white font-medium text-sm hover:bg-teal-500 transition-colors shadow-sm shadow-teal-200"
                    >
                        <CalendarPlus size={18} />
                        Book Appointment
                    </button>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm min-w-28">
                            <p className="text-xs text-gray-400 font-semibold uppercase">Waiting</p>
                            <p className="text-2xl font-bold text-gray-900">{filteredWaiting.length}</p>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm min-w-28">
                            <p className="text-xs text-gray-400 font-semibold uppercase">Active</p>
                            <p className="text-2xl font-bold text-teal-600">{activeAppointment ? 1 : 0}</p>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm min-w-28">
                            <p className="text-xs text-gray-400 font-semibold uppercase">Completed</p>
                            <p className="text-2xl font-bold text-emerald-600">{filteredCompleted.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm font-semibold text-gray-500">Filter by Doctor:</span>
                <button
                    onClick={() => setSelectedDoctorId('ALL')}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${selectedDoctorId === 'ALL'
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-100'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-teal-200 hover:text-teal-700'
                        }`}
                >
                    All Doctors
                </button>
                {doctors.map((doctor) => (
                    <button
                        key={doctor.id}
                        onClick={() => setSelectedDoctorId(doctor.id)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${selectedDoctorId === doctor.id
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm shadow-teal-100'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-teal-200 hover:text-teal-700'
                            }`}
                    >
                        {doctor.name}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[440px_1fr] gap-8">
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <ClipboardList className="text-teal-600" size={24} />
                            <h2 className="text-xl font-bold text-gray-900">Waiting Queue</h2>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold">
                            {filteredWaiting.length} Patients
                        </span>
                    </div>

                    <div className="space-y-4 min-h-[420px]">
                        {loading ? (
                            [...Array(4)].map((_, index) => (
                                <div key={index} className="h-24 bg-white border border-gray-100 rounded-xl animate-pulse" />
                            ))
                        ) : filteredWaiting.length === 0 ? (
                            <div className="h-64 bg-white border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-3">
                                <ClipboardList size={28} className="text-gray-300" />
                                <p>No patients waiting</p>
                                <button
                                    onClick={() => setShowBookingForm(true)}
                                    className="mt-1 text-sm text-teal-600 hover:text-teal-500 font-medium transition-colors"
                                >
                                    + Book an appointment
                                </button>
                            </div>
                        ) : (
                            filteredWaiting.map((appointment) => {
                                const priority = getPriority(appointment);
                                return (
                                    <div
                                        key={appointment.id}
                                        draggable
                                        onDragStart={(event) => event.dataTransfer.setData('appointmentId', appointment.id)}
                                        className={`group bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${priority === 'EMERGENCY' ? 'border-l-4 border-l-rose-600' : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                                                {getInitials(appointment.patient.firstName, appointment.patient.lastName)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="font-bold text-gray-900 truncate">
                                                        {appointment.patient.firstName} {appointment.patient.lastName}
                                                    </p>
                                                    <span className={`px-2.5 py-1 rounded-md border text-[11px] font-bold ${priorityClass[priority]}`}>
                                                        {priority}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    ID: {appointment.patient.mrn} • {appointment.reason || 'OPD visit'}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {formatTime(appointment.appointmentDate)} • Dr. {appointment.provider.firstName} {appointment.provider.lastName}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => startConsultation(appointment)}
                                                className="p-2 rounded-lg text-gray-300 group-hover:text-teal-600 group-hover:bg-teal-50 transition-colors"
                                                title="Start consultation"
                                            >
                                                <ArrowRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

                <section
                    onDragOver={(event) => {
                        event.preventDefault();
                        setDragOverActive(true);
                    }}
                    onDragLeave={() => setDragOverActive(false)}
                    onDrop={handleDrop}
                    className={`bg-white border rounded-2xl shadow-sm overflow-hidden min-h-[520px] transition-all ${dragOverActive ? 'border-teal-400 ring-4 ring-teal-100' : 'border-gray-100'
                        }`}
                >
                    <div className="bg-teal-700 text-white px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full bg-emerald-300" />
                            <h2 className="text-xl font-semibold">Active Consultation</h2>
                        </div>
                        <span className="text-sm text-teal-100 font-semibold">Duration: {activeAppointment ? duration : '00:00'}</span>
                    </div>

                    {activeAppointment ? (
                        <div className="p-8">
                            <div className="flex items-start gap-6">
                                <div className="w-24 h-24 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-3xl font-bold text-teal-700">
                                    {getInitials(activeAppointment.patient.firstName, activeAppointment.patient.lastName)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-3xl font-bold text-gray-900">
                                        {activeAppointment.patient.firstName} {activeAppointment.patient.lastName}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2">
                                        <span>ID: {activeAppointment.patient.mrn}</span>
                                        <span>Doctor: Dr. {activeAppointment.provider.firstName} {activeAppointment.provider.lastName}</span>
                                        <span className={getPriority(activeAppointment) === 'EMERGENCY' ? 'text-rose-600 font-bold' : 'text-orange-500 font-bold'}>
                                            {getPriority(activeAppointment) === 'EMERGENCY' ? 'High Priority' : 'Routine'}
                                        </span>
                                    </div>

                                    <div className="mt-6 rounded-xl bg-gray-100 p-5 max-w-xl">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Diagnosis Summary</p>
                                        <p className="text-gray-700 leading-relaxed">
                                            {activeAppointment.notes || activeAppointment.reason || 'Consultation in progress. Add diagnosis and clinical notes in the patient record after assessment.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-5 mt-8">
                                <div className="border border-gray-100 rounded-xl p-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase">Heart Rate</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-2xl font-bold text-rose-500">-- bpm</span>
                                        <HeartPulse className="text-rose-300" size={22} />
                                    </div>
                                </div>
                                <div className="border border-gray-100 rounded-xl p-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase">SpO2</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-2xl font-bold text-blue-600">-- %</span>
                                        <Waves className="text-blue-300" size={22} />
                                    </div>
                                </div>
                                <div className="border border-gray-100 rounded-xl p-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase">Temp</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-2xl font-bold text-gray-900">-- C</span>
                                        <Thermometer className="text-gray-300" size={22} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={completeAppointment}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-700 text-white text-sm font-bold hover:bg-teal-600 transition-colors shadow-sm shadow-teal-100"
                                >
                                    <CheckCircle2 size={18} />
                                    Complete Appointment
                                </button>
                                <Link
                                    href="/patients"
                                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-teal-700 text-teal-700 text-sm font-bold hover:bg-teal-50 transition-colors"
                                >
                                    View Full Record
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[450px] flex flex-col items-center justify-center text-center px-8">
                            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                                <Activity size={30} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">No active consultation</h3>
                            <p className="text-gray-500 mt-2 max-w-md">
                                Drag a patient from the waiting queue into this panel, or use the arrow on a queue card to start the consultation.
                            </p>
                        </div>
                    )}
                </section>
            </div>

            <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Completed Appointments</h2>
                    <div className="flex gap-2 text-gray-400">
                        <Filter size={18} />
                        <Download size={18} />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Patient Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Time Out</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Diagnosis</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredCompleted.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                                        No completed OPD appointments yet.
                                    </td>
                                </tr>
                            ) : (
                                filteredCompleted.slice(0, 8).map((appointment) => (
                                    <tr key={appointment.id} className="hover:bg-gray-50/70">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                                    {getInitials(appointment.patient.firstName, appointment.patient.lastName)}
                                                </div>
                                                <span className="font-bold text-gray-900">
                                                    {appointment.patient.firstName} {appointment.patient.lastName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-600">{appointment.patient.mrn}</td>
                                        <td className="px-6 py-4 text-gray-600">{formatTime(appointment.appointmentDate)}</td>
                                        <td className="px-6 py-4 text-gray-600">{appointment.reason || 'OPD consultation'}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                                                STABLE
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link href="/billing" className="text-teal-700 font-bold hover:text-teal-500">
                                                Invoice
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* Appointment Booking Modal */}
            <AppointmentFormModal
                isOpen={showBookingForm}
                onClose={() => setShowBookingForm(false)}
                onSubmit={handleBookAppointment}
                patients={patients}
                providers={providers}
            />
        </div>
    );
}
