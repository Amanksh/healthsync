'use client';

import type { Bed, Admission } from '@/lib/api-client';

interface BedDetailPanelProps {
    bed: Bed | null;
    onClose: () => void;
    onDischarge: (admission: Admission) => void;
    onUpdateBed: (bedId: string, status: string) => void;
}

export default function BedDetailPanel({ bed, onClose, onDischarge, onUpdateBed }: BedDetailPanelProps) {
    if (!bed) return null;

    const admission = bed.currentAdmission;
    const admissionDate = admission ? new Date(admission.admissionDate) : null;
    const daysSince = admissionDate ? Math.floor((Date.now() - admissionDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return (
        <div className="fixed right-0 top-0 h-screen w-96 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Bed {bed.bedNumber}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className={`w-2 h-2 rounded-full ${bed.status === 'OCCUPIED' ? 'bg-blue-500' : bed.status === 'AVAILABLE' ? 'bg-emerald-500' : bed.status === 'MAINTENANCE' ? 'bg-gray-400' : 'bg-amber-500'}`} />
                        <span className="text-xs text-gray-500 uppercase font-medium">{bed.status}</span>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {admission && (
                    <>
                        {/* Patient Info */}
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700">
                                    {admission.patient.firstName[0]}{admission.patient.lastName[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{admission.patient.firstName} {admission.patient.lastName}</p>
                                    <p className="text-xs text-gray-500 font-mono">{admission.patient.mrn}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-white/60 rounded-lg px-3 py-2">
                                    <p className="text-gray-400 uppercase font-medium text-[10px]">Gender</p>
                                    <p className="text-gray-800 font-medium capitalize">{admission.patient.gender?.toLowerCase()}</p>
                                </div>
                                {admission.patient.bloodGroup && (
                                    <div className="bg-white/60 rounded-lg px-3 py-2">
                                        <p className="text-gray-400 uppercase font-medium text-[10px]">Blood Group</p>
                                        <p className="text-gray-800 font-medium">{admission.patient.bloodGroup}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Admission Info */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Admission Details</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-xs text-gray-500">Admitted</span>
                                    <span className="text-xs font-medium text-gray-900">{admissionDate?.toLocaleDateString()} ({daysSince}d ago)</span>
                                </div>
                                {admission.diagnosis && (
                                    <div className="flex justify-between items-start py-2 border-b border-gray-50">
                                        <span className="text-xs text-gray-500">Diagnosis</span>
                                        <span className="text-xs font-medium text-gray-900 text-right max-w-[60%]">{admission.diagnosis}</span>
                                    </div>
                                )}
                                {admission.attendingDoctor && (
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                        <span className="text-xs text-gray-500">Doctor</span>
                                        <span className="text-xs font-medium text-gray-900">Dr. {admission.attendingDoctor.firstName} {admission.attendingDoctor.lastName}</span>
                                    </div>
                                )}
                                {admission.notes && (
                                    <div className="py-2">
                                        <span className="text-xs text-gray-500 block mb-1">Notes</span>
                                        <p className="text-xs text-gray-700 bg-gray-50 rounded-lg p-2">{admission.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Bed Notes */}
                {bed.notes && !admission && (
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 font-medium mb-1">Bed Notes</p>
                        <p className="text-sm text-gray-700">{bed.notes}</p>
                    </div>
                )}

                {/* Quick Status Change for non-occupied beds */}
                {bed.status !== 'OCCUPIED' && (
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Change Status</h4>
                        <div className="flex gap-2">
                            {bed.status !== 'AVAILABLE' && (
                                <button onClick={() => onUpdateBed(bed.id, 'AVAILABLE')} className="flex-1 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors">
                                    Mark Available
                                </button>
                            )}
                            {bed.status !== 'MAINTENANCE' && (
                                <button onClick={() => onUpdateBed(bed.id, 'MAINTENANCE')} className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                                    Maintenance
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            {admission && (
                <div className="p-5 border-t border-gray-100">
                    <button
                        onClick={() => onDischarge(admission)}
                        className="w-full px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-500 transition-colors shadow-sm shadow-red-200"
                    >
                        Discharge Patient
                    </button>
                </div>
            )}
        </div>
    );
}
