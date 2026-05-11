'use client';

import type { Bed } from '@/lib/api-client';

const statusConfig: Record<string, { bg: string; border: string; dot: string; label: string }> = {
    OCCUPIED: { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500', label: 'Occupied' },
    AVAILABLE: { bg: 'bg-emerald-50', border: 'border-emerald-200 border-dashed', dot: 'bg-emerald-500', label: 'Available' },
    MAINTENANCE: { bg: 'bg-gray-100', border: 'border-gray-300', dot: 'bg-gray-400', label: 'Maintenance' },
    RESERVED: { bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', label: 'Reserved' },
};

interface BedCardProps {
    bed: Bed;
    isSelected: boolean;
    onClick: () => void;
    onAdmit: () => void;
}

export default function BedCard({ bed, isSelected, onClick, onAdmit }: BedCardProps) {
    const config = statusConfig[bed.status] || statusConfig.AVAILABLE;
    const admission = bed.currentAdmission;

    return (
        <button
            type="button"
            onClick={bed.status === 'AVAILABLE' ? onAdmit : onClick}
            className={`relative w-full text-left p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${config.bg} ${config.border} ${isSelected ? 'ring-2 ring-indigo-400 ring-offset-2 shadow-lg' : ''}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-900">{bed.bedNumber}</span>
                <span className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
            </div>

            {/* Content */}
            {bed.status === 'OCCUPIED' && admission ? (
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-800 truncate">
                        {admission.patient.firstName[0]}. {admission.patient.lastName}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">
                        {admission.diagnosis || 'No diagnosis'}
                    </p>
                    {admission.attendingDoctor && (
                        <p className="text-[10px] text-gray-400 truncate">
                            Dr. {admission.attendingDoctor.lastName}
                        </p>
                    )}
                </div>
            ) : bed.status === 'AVAILABLE' ? (
                <div className="flex flex-col items-center justify-center py-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span className="text-[10px] text-emerald-600 font-medium mt-0.5">VACANT</span>
                </div>
            ) : bed.status === 'MAINTENANCE' ? (
                <div className="flex flex-col items-center justify-center py-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.049.58.025 1.194-.14 1.743" />
                    </svg>
                    <span className="text-[10px] text-gray-500 font-medium mt-0.5">{bed.notes || 'MAINTENANCE'}</span>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-2">
                    <span className="text-[10px] text-amber-600 font-medium">{config.label.toUpperCase()}</span>
                </div>
            )}
        </button>
    );
}

export { statusConfig };
