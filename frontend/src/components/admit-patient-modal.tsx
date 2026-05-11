'use client';

import { useState, useEffect, useCallback } from 'react';
import Modal from './modal';
import { patientApi, userApi } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import type { Bed } from '@/lib/api-client';

interface AdmitPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        patientId: string;
        bedId: string;
        diagnosis?: string;
        notes?: string;
        attendingDoctorId?: string;
    }) => Promise<void>;
    availableBeds: Bed[];
    preselectedBedId?: string | null;
}

interface PatientOption { id: string; firstName: string; lastName: string; mrn: string; }
interface DoctorOption { id: string; firstName: string; lastName: string; }

export default function AdmitPatientModal({ isOpen, onClose, onSubmit, availableBeds, preselectedBedId }: AdmitPatientModalProps) {
    const { token } = useAuth();
    const [patientSearch, setPatientSearch] = useState('');
    const [patients, setPatients] = useState<PatientOption[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);
    const [doctors, setDoctors] = useState<DoctorOption[]>([]);
    const [bedId, setBedId] = useState('');
    const [doctorId, setDoctorId] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        if (isOpen && preselectedBedId) setBedId(preselectedBedId);
        if (!isOpen) {
            setPatientSearch(''); setPatients([]); setSelectedPatient(null);
            setBedId(preselectedBedId || ''); setDoctorId(''); setDiagnosis(''); setNotes('');
        }
    }, [isOpen, preselectedBedId]);

    useEffect(() => {
        if (isOpen && token) {
            userApi.getAll('role=DOCTOR&limit=100', token).then((res: any) => {
                setDoctors((res.data || res).map((u: any) => ({ id: u.id, firstName: u.firstName, lastName: u.lastName })));
            }).catch(() => {});
        }
    }, [isOpen, token]);

    const searchPatients = useCallback(async (query: string) => {
        if (!token || query.length < 2) { setPatients([]); return; }
        setSearching(true);
        try {
            const res: any = await patientApi.getAll(`search=${encodeURIComponent(query)}&limit=10`, token);
            setPatients((res.data || []).map((p: any) => ({ id: p.id, firstName: p.firstName, lastName: p.lastName, mrn: p.mrn })));
        } catch { setPatients([]); }
        finally { setSearching(false); }
    }, [token]);

    useEffect(() => {
        const timeout = setTimeout(() => searchPatients(patientSearch), 300);
        return () => clearTimeout(timeout);
    }, [patientSearch, searchPatients]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatient || !bedId) return;
        setSubmitting(true);
        try {
            await onSubmit({ patientId: selectedPatient.id, bedId, diagnosis: diagnosis || undefined, notes: notes || undefined, attendingDoctorId: doctorId || undefined });
            onClose();
        } catch (err) { console.error('Failed to admit:', err); }
        finally { setSubmitting(false); }
    };

    const inputClass = 'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm';
    const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Admit Patient" size="lg">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className={labelClass}>Patient *</label>
                    {selectedPatient ? (
                        <div className="flex items-center justify-between px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                            <div>
                                <p className="text-sm font-medium text-gray-900">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                                <p className="text-xs text-gray-500 font-mono">{selectedPatient.mrn}</p>
                            </div>
                            <button type="button" onClick={() => { setSelectedPatient(null); setPatientSearch(''); }} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Change</button>
                        </div>
                    ) : (
                        <div className="relative">
                            <input type="text" className={inputClass} placeholder="Search by name or MRN..." value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} autoFocus />
                            {searching && <div className="absolute right-3 top-1/2 -translate-y-1/2"><div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" /></div>}
                            {patients.length > 0 && !selectedPatient && (
                                <div className="absolute z-10 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-48 overflow-y-auto">
                                    {patients.map((p) => (
                                        <button key={p.id} type="button" onClick={() => { setSelectedPatient(p); setPatients([]); }} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl">
                                            <p className="text-sm font-medium text-gray-900">{p.firstName} {p.lastName}</p>
                                            <p className="text-xs text-gray-500 font-mono">{p.mrn}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <label className={labelClass}>Assign Bed *</label>
                    <select required className={inputClass} value={bedId} onChange={(e) => setBedId(e.target.value)}>
                        <option value="">Select an available bed...</option>
                        {availableBeds.map((bed) => (<option key={bed.id} value={bed.id}>{bed.bedNumber}{bed.notes ? ` (${bed.notes})` : ''}</option>))}
                    </select>
                    {availableBeds.length === 0 && <p className="text-xs text-amber-600 mt-1">No available beds in this ward.</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Attending Doctor</label>
                        <select className={inputClass} value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
                            <option value="">Select doctor...</option>
                            {doctors.map((d) => (<option key={d.id} value={d.id}>Dr. {d.firstName} {d.lastName}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Diagnosis</label>
                        <input type="text" className={inputClass} placeholder="e.g. Acute Coronary Syndrome" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Admission Notes</label>
                    <textarea className={inputClass} rows={2} placeholder="Additional notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                    <button type="submit" disabled={submitting || !selectedPatient || !bedId} className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-50 shadow-sm shadow-indigo-200">
                        {submitting ? 'Admitting...' : 'Admit Patient'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
