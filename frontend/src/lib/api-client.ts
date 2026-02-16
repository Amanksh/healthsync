const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface RequestOptions extends RequestInit {
    token?: string;
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

    register: (data: Record<string, unknown>, token: string) =>
        apiClient.post('/auth/register', data, token),
};

// ─── Patient API ─────────────────────────────────────────────────────────────

export const patientApi = {
    getAll: (params: string, token: string) =>
        apiClient.get(`/patients?${params}`, token),

    getById: (id: string, token: string) =>
        apiClient.get(`/patients/${id}`, token),

    create: (data: Record<string, unknown>, token: string) =>
        apiClient.post('/patients', data, token),

    update: (id: string, data: Record<string, unknown>, token: string) =>
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

    create: (data: Record<string, unknown>, token: string) =>
        apiClient.post('/appointments', data, token),

    update: (id: string, data: Record<string, unknown>, token: string) =>
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

    create: (data: Record<string, unknown>, token: string) =>
        apiClient.post('/invoices', data, token),

    update: (id: string, data: Record<string, unknown>, token: string) =>
        apiClient.patch(`/invoices/${id}`, data, token),
};

// ─── Hospital API ────────────────────────────────────────────────────────────

export const hospitalApi = {
    getAll: (params: string, token: string) =>
        apiClient.get(`/hospitals?${params}`, token),

    getById: (id: string, token: string) =>
        apiClient.get(`/hospitals/${id}`, token),

    create: (data: Record<string, unknown>, token: string) =>
        apiClient.post('/hospitals', data, token),

    update: (id: string, data: Record<string, unknown>, token: string) =>
        apiClient.patch(`/hospitals/${id}`, data, token),

    delete: (id: string, token: string) =>
        apiClient.delete(`/hospitals/${id}`, token),
};

// ─── User API ────────────────────────────────────────────────────────────────

export const userApi = {
    getAll: (params: string, token: string) =>
        apiClient.get(`/users?${params}`, token),

    create: (data: Record<string, unknown>, token: string) =>
        apiClient.post('/users', data, token),

    update: (id: string, data: Record<string, unknown>, token: string) =>
        apiClient.patch(`/users/${id}`, data, token),

    delete: (id: string, token: string) => apiClient.delete<void>(`/users/${id}`, token),
    toggleActive: (id: string, token: string) => apiClient.patch<any>(`/users/${id}/toggle-active`, {}, token),
};

// ─── Pharmacy API ────────────────────────────────────────────────────────────

export const pharmacyApi = {
    getAllMedicines: (query: string = '', token: string) => apiClient.get<{ data: any[], meta: any }>(`/pharmacy/medicines?${query}`, token),
    getMedicine: (id: string, token: string) => apiClient.get<any>(`/pharmacy/medicines/${id}`, token),
    createMedicine: (data: any, token: string) => apiClient.post<any>('/pharmacy/medicines', data, token),
    addStock: (id: string, data: any, token: string) => apiClient.post<any>(`/pharmacy/medicines/${id}/stock`, data, token),
    getLowStock: (token: string) => apiClient.get<any[]>('/pharmacy/alerts/low-stock', token),
};
