'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { wardApi } from '@/lib/api-client';
import type { Ward, Bed, Admission, WardSummary } from '@/lib/api-client';
import BedCard from '@/components/bed-card';
import BedDetailPanel from '@/components/bed-detail-panel';
import WardFormModal from '@/components/ward-form-modal';
import AddBedsModal from '@/components/add-beds-modal';
import AdmitPatientModal from '@/components/admit-patient-modal';
import DischargeModal from '@/components/discharge-modal';
import { BedDouble, Plus, LayoutGrid, List, ChevronRight } from 'lucide-react';

export default function IPDPage() {
    const { token } = useAuth();
    const [wards, setWards] = useState<Ward[]>([]);
    const [selectedWardId, setSelectedWardId] = useState<string | null>(null);
    const [summary, setSummary] = useState<WardSummary | null>(null);
    const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [loading, setLoading] = useState(true);

    // Modal states
    const [wardModalOpen, setWardModalOpen] = useState(false);
    const [editingWard, setEditingWard] = useState<Ward | null>(null);
    const [bedsModalOpen, setBedsModalOpen] = useState(false);
    const [admitModalOpen, setAdmitModalOpen] = useState(false);
    const [admitBedId, setAdmitBedId] = useState<string | null>(null);
    const [dischargeModalOpen, setDischargeModalOpen] = useState(false);
    const [dischargeAdmission, setDischargeAdmission] = useState<Admission | null>(null);

    const fetchData = useCallback(async () => {
        if (!token) return;
        try {
            const [wardsData, summaryData] = await Promise.all([
                wardApi.getAll(token),
                wardApi.getSummary(token),
            ]);
            setWards(wardsData);
            setSummary(summaryData);
            if (!selectedWardId && wardsData.length > 0) {
                setSelectedWardId(wardsData[0].id);
            }
        } catch (err) {
            console.error('Failed to fetch wards:', err);
        } finally {
            setLoading(false);
        }
    }, [token, selectedWardId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const selectedWard = wards.find((w) => w.id === selectedWardId) || null;
    const beds = selectedWard?.beds || [];
    const occupiedCount = beds.filter((b) => b.status === 'OCCUPIED').length;
    const availableCount = beds.filter((b) => b.status === 'AVAILABLE').length;
    const maintenanceCount = beds.filter((b) => b.status === 'MAINTENANCE').length;
    const occupancyPct = beds.length > 0 ? Math.round((occupiedCount / beds.length) * 100) : 0;

    const handleCreateWard = async (data: Record<string, unknown>) => {
        if (!token) return;
        const { bedCount, bedPrefix, ...wardData } = data;
        const ward = await wardApi.create(wardData, token);
        if (bedCount && (bedCount as number) > 0) {
            const bedsPayload = Array.from({ length: bedCount as number }, (_, i) => ({
                bedNumber: `${bedPrefix || ward.name.substring(0, 3).toUpperCase() + '-'}${String(i + 1).padStart(2, '0')}`,
            }));
            await wardApi.addBeds(ward.id, { beds: bedsPayload }, token);
        }
        await fetchData();
        setSelectedWardId(ward.id);
    };

    const handleUpdateWard = async (data: Record<string, unknown>) => {
        if (!token || !editingWard) return;
        await wardApi.update(editingWard.id, data, token);
        setEditingWard(null);
        await fetchData();
    };

    const handleAddBeds = async (bedsList: { bedNumber: string; notes?: string }[]) => {
        if (!token || !selectedWardId) return;
        await wardApi.addBeds(selectedWardId, { beds: bedsList }, token);
        await fetchData();
    };

    const handleAdmit = async (data: { patientId: string; bedId: string; diagnosis?: string; notes?: string; attendingDoctorId?: string }) => {
        if (!token) return;
        await wardApi.admit(data, token);
        setSelectedBed(null);
        await fetchData();
    };

    const handleDischarge = async (data: { notes?: string }) => {
        if (!token || !dischargeAdmission) return;
        await wardApi.discharge(dischargeAdmission.id, data, token);
        setDischargeAdmission(null);
        setSelectedBed(null);
        await fetchData();
    };

    const handleUpdateBedStatus = async (bedId: string, status: string) => {
        if (!token || !selectedWardId) return;
        await wardApi.updateBed(selectedWardId, bedId, { status }, token);
        setSelectedBed(null);
        await fetchData();
    };

    const handleDeleteWard = async (wardId: string) => {
        if (!token) return;
        if (!confirm('Delete this ward and all its beds? This cannot be undone.')) return;
        await wardApi.delete(wardId, token);
        setSelectedWardId(null);
        setSelectedBed(null);
        await fetchData();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">Loading wards...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-0 -m-8 h-[calc(100vh)]">
            {/* ── Ward Sidebar ── */}
            <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0">
                <div className="p-5 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Wards</h2>
                        <button
                            onClick={() => { setEditingWard(null); setWardModalOpen(true); }}
                            className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                            title="Add Ward"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    {/* Global Summary */}
                    {summary && (
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
                                <p className="text-[10px] text-gray-400 uppercase font-medium">Beds</p>
                                <p className="text-lg font-bold text-gray-900">{summary.totalBeds}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
                                <p className="text-[10px] text-gray-400 uppercase font-medium">Occupancy</p>
                                <p className="text-lg font-bold text-indigo-600">{summary.occupancyRate}%</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Ward List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    {wards.length === 0 ? (
                        <div className="text-center py-8">
                            <BedDouble className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">No wards yet</p>
                            <button onClick={() => setWardModalOpen(true)} className="mt-2 text-xs text-indigo-600 font-medium hover:text-indigo-500">
                                Create your first ward
                            </button>
                        </div>
                    ) : (
                        wards.map((ward) => {
                            const wBeds = ward.beds || [];
                            const wOcc = wBeds.filter((b) => b.status === 'OCCUPIED').length;
                            const wTotal = wBeds.length;
                            const isActive = ward.id === selectedWardId;
                            return (
                                <button
                                    key={ward.id}
                                    onClick={() => { setSelectedWardId(ward.id); setSelectedBed(null); }}
                                    className={`w-full text-left px-3 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-indigo-50 border border-indigo-200 shadow-sm' : 'hover:bg-gray-50 border border-transparent'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="min-w-0">
                                            <p className={`text-sm font-semibold truncate ${isActive ? 'text-indigo-900' : 'text-gray-800'}`}>{ward.name}</p>
                                            <p className="text-[10px] text-gray-400 truncate">
                                                {ward.type && `${ward.type} · `}{ward.floor || 'No floor'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold ${wTotal > 0 ? (wOcc / wTotal > 0.8 ? 'text-red-500' : 'text-gray-600') : 'text-gray-400'}`}>
                                                {wOcc}/{wTotal}
                                            </span>
                                            <ChevronRight className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-500' : 'text-gray-300 group-hover:text-gray-400'}`} />
                                        </div>
                                    </div>
                                    {/* Mini occupancy bar */}
                                    {wTotal > 0 && (
                                        <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${(wOcc / wTotal) * 100}%` }} />
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Admit Button */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={() => { setAdmitBedId(null); setAdmitModalOpen(true); }}
                        disabled={!selectedWard || availableCount === 0}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-50 shadow-sm shadow-indigo-200"
                    >
                        <Plus className="w-4 h-4" />
                        Admit New Patient
                    </button>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50/50">
                {selectedWard ? (
                    <>
                        {/* Ward Header */}
                        <div className="px-6 py-5 bg-white border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">{selectedWard.name}</h1>
                                    <p className="text-sm text-gray-500">
                                        {selectedWard.type && `${selectedWard.type} · `}
                                        {selectedWard.floor || 'No floor assigned'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* View Toggle */}
                                    <div className="flex p-1 bg-gray-100 rounded-lg">
                                        <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                            <LayoutGrid className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                            <List className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button onClick={() => setBedsModalOpen(true)} className="px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors">
                                        + Add Beds
                                    </button>
                                    <button onClick={() => { setEditingWard(selectedWard); setWardModalOpen(true); }} className="px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                        Edit Ward
                                    </button>
                                    <button onClick={() => handleDeleteWard(selectedWard.id)} className="px-3 py-2 text-xs font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div className="flex items-center gap-6 mt-4">
                                <div className="flex items-center gap-5">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-gray-900">{occupancyPct}<span className="text-sm text-gray-400 font-medium">%</span></p>
                                        <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Occupancy</p>
                                    </div>
                                    <div className="w-px h-8 bg-gray-200" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                                        <span className="text-xs text-gray-600">Occupied <span className="font-bold">{occupiedCount}</span></span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                        <span className="text-xs text-gray-600">Vacant <span className="font-bold">{availableCount}</span></span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                                        <span className="text-xs text-gray-600">Maintenance <span className="font-bold">{maintenanceCount}</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bed Grid / List */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {beds.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <BedDouble className="w-12 h-12 text-gray-300 mb-3" />
                                    <p className="text-gray-500 font-medium">No beds in this ward</p>
                                    <p className="text-sm text-gray-400 mt-1">Add beds to start managing admissions.</p>
                                    <button onClick={() => setBedsModalOpen(true)} className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors">
                                        + Add Beds
                                    </button>
                                </div>
                            ) : viewMode === 'grid' ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                    {beds.map((bed) => (
                                        <BedCard
                                            key={bed.id}
                                            bed={bed}
                                            isSelected={selectedBed?.id === bed.id}
                                            onClick={() => setSelectedBed(bed)}
                                            onAdmit={() => { setAdmitBedId(bed.id); setAdmitModalOpen(true); }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Bed</th>
                                                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Status</th>
                                                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Patient</th>
                                                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Diagnosis</th>
                                                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Doctor</th>
                                                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {beds.map((bed) => (
                                                <tr key={bed.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-4 py-3 text-sm font-bold text-gray-900">{bed.bedNumber}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bed.status === 'OCCUPIED' ? 'bg-blue-50 text-blue-700' : bed.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700' : bed.status === 'MAINTENANCE' ? 'bg-gray-100 text-gray-600' : 'bg-amber-50 text-amber-700'}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${bed.status === 'OCCUPIED' ? 'bg-blue-500' : bed.status === 'AVAILABLE' ? 'bg-emerald-500' : bed.status === 'MAINTENANCE' ? 'bg-gray-400' : 'bg-amber-500'}`} />
                                                            {bed.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                        {bed.currentAdmission ? `${bed.currentAdmission.patient.firstName} ${bed.currentAdmission.patient.lastName}` : '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">{bed.currentAdmission?.diagnosis || '—'}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">
                                                        {bed.currentAdmission?.attendingDoctor ? `Dr. ${bed.currentAdmission.attendingDoctor.lastName}` : '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {bed.status === 'AVAILABLE' ? (
                                                            <button onClick={() => { setAdmitBedId(bed.id); setAdmitModalOpen(true); }} className="text-xs font-medium text-indigo-600 hover:text-indigo-800">Admit</button>
                                                        ) : bed.status === 'OCCUPIED' && bed.currentAdmission ? (
                                                            <button onClick={() => { setDischargeAdmission(bed.currentAdmission!); setDischargeModalOpen(true); }} className="text-xs font-medium text-red-600 hover:text-red-800">Discharge</button>
                                                        ) : null}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <BedDouble className="w-16 h-16 text-gray-200 mb-4" />
                        <h2 className="text-xl font-bold text-gray-400">Ward Management</h2>
                        <p className="text-sm text-gray-400 mt-1">Select a ward or create one to get started.</p>
                        <button onClick={() => setWardModalOpen(true)} className="mt-4 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors shadow-sm shadow-indigo-200">
                            + Create First Ward
                        </button>
                    </div>
                )}
            </div>

            {/* ── Bed Detail Slide-in ── */}
            {selectedBed && selectedBed.status === 'OCCUPIED' && (
                <BedDetailPanel
                    bed={selectedBed}
                    onClose={() => setSelectedBed(null)}
                    onDischarge={(admission) => { setDischargeAdmission(admission); setDischargeModalOpen(true); }}
                    onUpdateBed={handleUpdateBedStatus}
                />
            )}

            {/* ── Modals ── */}
            <WardFormModal
                isOpen={wardModalOpen}
                onClose={() => { setWardModalOpen(false); setEditingWard(null); }}
                onSubmit={editingWard ? handleUpdateWard : handleCreateWard}
                ward={editingWard}
            />
            <AddBedsModal
                isOpen={bedsModalOpen}
                onClose={() => setBedsModalOpen(false)}
                onSubmit={handleAddBeds}
                wardName={selectedWard?.name || ''}
            />
            <AdmitPatientModal
                isOpen={admitModalOpen}
                onClose={() => { setAdmitModalOpen(false); setAdmitBedId(null); }}
                onSubmit={handleAdmit}
                availableBeds={beds.filter((b) => b.status === 'AVAILABLE')}
                preselectedBedId={admitBedId}
            />
            <DischargeModal
                isOpen={dischargeModalOpen}
                onClose={() => { setDischargeModalOpen(false); setDischargeAdmission(null); }}
                onSubmit={handleDischarge}
                admission={dischargeAdmission}
            />
        </div>
    );
}
