const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface UserSummary {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string | null;
    isActive: boolean;
    hospitalId?: string | null;
}

export interface Medicine {
    id: string;
    name: string;
    genericName?: string | null;
    code?: string | null;
    description?: string | null;
    category?: string | null;
    manufacturer?: string | null;
    totalStock: number;
    minStock: number;
    unitPriceCents: number;
    hospitalId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateMedicinePayload {
    name: string;
    genericName?: string;
    category?: string;
    manufacturer?: string;
    code?: string;
    minStock: number;
    unitPriceCents: number;
}

export interface AddStockPayload {
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    costPriceCents: number;
}

export interface MedicineBatch {
    id: string;
    medicineId: string;
    hospitalId: string;
    batchNumber: string;
    expiryDate: string;
    quantity: number;
    costPriceCents: number;
    createdAt: string;
    updatedAt: string;
}

export type ReportType = 'BLOOD_REPORT' | 'ECG' | 'ULTRASOUND' | 'XRAY' | 'OTHER';
export type ReportDeliveryStatus = 'NOT_SENT' | 'SENT' | 'FAILED';

export interface MedicalReport {
    id: string;
    title: string;
    type: ReportType;
    reportDate: string;
    notes?: string | null;
    fileUrl: string;
    aiSummary?: string | null;
    deliveryStatus: ReportDeliveryStatus;
    deliveredAt?: string | null;
    deliveryError?: string | null;
    createdAt: string;
    updatedAt: string;
    patient: {
        id: string;
        firstName: string;
        lastName: string;
        mrn: string;
        phone: string;
    };
    hospital: {
        id: string;
        name: string;
    };
    uploadedBy?: {
        id: string;
        firstName: string;
        lastName: string;
    } | null;
}

interface RequestOptions extends RequestInit {
    token?: string;
}

interface MultipartRequestOptions extends RequestInit {
    token?: string;
    body: FormData;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { token, ...fetchOptions } = options;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        };

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...fetchOptions,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                response.status,
                errorData.message || `Request failed with status ${response.status}`,
            );
        }

        return response.json();
    }

    async get<T>(endpoint: string, token?: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET', token });
    }

    async post<T>(endpoint: string, data: unknown, token?: string): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            token,
        });
    }

    async patch<T>(endpoint: string, data: unknown, token?: string): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
            token,
        });
    }

    async delete<T>(endpoint: string, token?: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE', token });
    }

    async multipart<T>(endpoint: string, options: MultipartRequestOptions): Promise<T> {
        const { token, body, ...fetchOptions } = options;

        const headers: HeadersInit = {
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        };

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...fetchOptions,
            method: fetchOptions.method || 'POST',
            body,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                response.status,
                errorData.message || `Request failed with status ${response.status}`,
            );
        }

        return response.json();
    }
}

export class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export const apiClient = new ApiClient(API_BASE_URL);

// ─── Auth API ────────────────────────────────────────────────────────────────

export const authApi = {
    login: (data: { email: string; password: string }) =>
        apiClient.post('/auth/login', data),

    register: (data: unknown, token: string) =>
        apiClient.post('/auth/register', data, token),
};

// ─── Patient API ─────────────────────────────────────────────────────────────

export const patientApi = {
    getAll: (params: string, token: string) =>
        apiClient.get(`/patients?${params}`, token),

    getById: (id: string, token: string) =>
        apiClient.get(`/patients/${id}`, token),

    create: (data: unknown, token: string) =>
        apiClient.post('/patients', data, token),

    update: (id: string, data: unknown, token: string) =>
        apiClient.patch(`/patients/${id}`, data, token),

    delete: (id: string, token: string) =>
        apiClient.delete(`/patients/${id}`, token),
};

// ─── Appointment API ─────────────────────────────────────────────────────────

export const appointmentApi = {
    getAll: (params: string, token: string) =>
        apiClient.get(`/appointments?${params}`, token),

    getById: (id: string, token: string) =>
        apiClient.get(`/appointments/${id}`, token),

    create: (data: unknown, token: string) =>
        apiClient.post('/appointments', data, token),

    update: (id: string, data: unknown, token: string) =>
        apiClient.patch(`/appointments/${id}`, data, token),

    cancel: (id: string, token: string) =>
        apiClient.patch(`/appointments/${id}/cancel`, {}, token),
};

// ─── Invoice API ─────────────────────────────────────────────────────────────

export const invoiceApi = {
    getAll: (params: string, token: string) =>
        apiClient.get(`/invoices?${params}`, token),

    getById: (id: string, token: string) =>
        apiClient.get(`/invoices/${id}`, token),

    create: (data: unknown, token: string) =>
        apiClient.post('/invoices', data, token),

    update: (id: string, data: unknown, token: string) =>
        apiClient.patch(`/invoices/${id}`, data, token),
};

// ─── Hospital API ────────────────────────────────────────────────────────────

export const hospitalApi = {
    getAll: (params: string, token: string) =>
        apiClient.get(`/hospitals?${params}`, token),

    getById: (id: string, token: string) =>
        apiClient.get(`/hospitals/${id}`, token),

    create: (data: unknown, token: string) =>
        apiClient.post('/hospitals', data, token),

    update: (id: string, data: unknown, token: string) =>
        apiClient.patch(`/hospitals/${id}`, data, token),

    delete: (id: string, token: string) =>
        apiClient.delete(`/hospitals/${id}`, token),
};

// ─── User API ────────────────────────────────────────────────────────────────

export const userApi = {
    getAll: (params: string, token: string) =>
        apiClient.get(`/users?${params}`, token),

    create: (data: unknown, token: string) =>
        apiClient.post('/users', data, token),

    update: (id: string, data: unknown, token: string) =>
        apiClient.patch(`/users/${id}`, data, token),

    delete: (id: string, token: string) => apiClient.delete<void>(`/users/${id}`, token),
    toggleActive: (id: string, token: string) => apiClient.patch<UserSummary>(`/users/${id}/toggle-active`, {}, token),
};

// ─── Pharmacy API ────────────────────────────────────────────────────────────

export const pharmacyApi = {
    getAllMedicines: (query: string = '', token: string) =>
        apiClient.get<PaginatedResponse<Medicine>>(`/pharmacy/medicines?${query}`, token),
    getMedicine: (id: string, token: string) =>
        apiClient.get<Medicine & { batches: MedicineBatch[] }>(`/pharmacy/medicines/${id}`, token),
    createMedicine: (data: CreateMedicinePayload, token: string) =>
        apiClient.post<Medicine>('/pharmacy/medicines', data, token),
    addStock: (id: string, data: AddStockPayload, token: string) =>
        apiClient.post<{ batch: MedicineBatch; medicine: Medicine }>(`/pharmacy/medicines/${id}/stock`, data, token),
    getLowStock: (token: string) => apiClient.get<Medicine[]>('/pharmacy/alerts/low-stock', token),
};

// ─── Reports API ─────────────────────────────────────────────────────────────

export const reportsApi = {
    getAll: (query: string = '', token: string) =>
        apiClient.get<PaginatedResponse<MedicalReport>>(`/reports?${query}`, token),
    getById: (id: string, token: string) =>
        apiClient.get<MedicalReport>(`/reports/${id}`, token),
    create: (data: FormData, token: string) =>
        apiClient.multipart<MedicalReport>('/reports', { body: data, token }),
    send: (id: string, token: string) =>
        apiClient.post<MedicalReport>(`/reports/${id}/send`, {}, token),
};

// ─── Ward / IPD Types ────────────────────────────────────────────────────────

export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED';
export type AdmissionStatus = 'ADMITTED' | 'DISCHARGED' | 'TRANSFERRED';

export interface Ward {
    id: string;
    name: string;
    floor?: string | null;
    type?: string | null;
    description?: string | null;
    isActive: boolean;
    hospitalId: string;
    beds: Bed[];
    _count?: { beds: number };
    createdAt: string;
    updatedAt: string;
}

export interface Bed {
    id: string;
    bedNumber: string;
    status: BedStatus;
    notes?: string | null;
    wardId: string;
    currentAdmission?: Admission | null;
}

export interface Admission {
    id: string;
    admissionDate: string;
    dischargeDate?: string | null;
    status: AdmissionStatus;
    diagnosis?: string | null;
    notes?: string | null;
    patient: {
        id: string;
        firstName: string;
        lastName: string;
        mrn: string;
        gender: string;
        dateOfBirth?: string;
        phone?: string;
        bloodGroup?: string | null;
        allergies?: string | null;
    };
    bed: {
        id: string;
        bedNumber: string;
        ward?: { id: string; name: string; floor?: string | null };
    };
    attendingDoctor?: {
        id: string;
        firstName: string;
        lastName: string;
    } | null;
}

export interface WardSummary {
    totalWards: number;
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
    maintenanceBeds: number;
    occupancyRate: number;
    wardBreakdown: Array<{
        wardId: string;
        wardName: string;
        floor?: string | null;
        type?: string | null;
        total: number;
        occupied: number;
        available: number;
        maintenance: number;
    }>;
}

// ─── Ward / IPD API ──────────────────────────────────────────────────────────

export const wardApi = {
    // Wards
    getAll: (token: string) =>
        apiClient.get<Ward[]>('/wards', token),
    getById: (id: string, token: string) =>
        apiClient.get<Ward>(`/wards/${id}`, token),
    create: (data: unknown, token: string) =>
        apiClient.post<Ward>('/wards', data, token),
    update: (id: string, data: unknown, token: string) =>
        apiClient.patch<Ward>(`/wards/${id}`, data, token),
    delete: (id: string, token: string) =>
        apiClient.delete(`/wards/${id}`, token),

    // Beds
    addBeds: (wardId: string, data: unknown, token: string) =>
        apiClient.post(`/wards/${wardId}/beds`, data, token),
    updateBed: (wardId: string, bedId: string, data: unknown, token: string) =>
        apiClient.patch(`/wards/${wardId}/beds/${bedId}`, data, token),
    deleteBed: (wardId: string, bedId: string, token: string) =>
        apiClient.delete(`/wards/${wardId}/beds/${bedId}`, token),

    // Admissions
    admit: (data: unknown, token: string) =>
        apiClient.post<Admission>('/wards/admissions', data, token),
    discharge: (id: string, data: unknown, token: string) =>
        apiClient.patch<Admission>(`/wards/admissions/${id}/discharge`, data, token),
    getAdmissions: (query: string = '', token: string) =>
        apiClient.get<PaginatedResponse<Admission>>(`/wards/admissions?${query}`, token),
    getAdmission: (id: string, token: string) =>
        apiClient.get<Admission>(`/wards/admissions/${id}`, token),

    // Summary
    getSummary: (token: string) =>
        apiClient.get<WardSummary>('/wards/summary', token),
};
