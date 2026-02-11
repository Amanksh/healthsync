// ─── Shared TypeScript Interfaces for HMS ─────────────────────────────────────
// These types are shared between backend and frontend
// to ensure type consistency across the entire application.

// ─── Enums ───────────────────────────────────────────────────────────────────

export enum Role {
    ADMIN = 'ADMIN',
    DOCTOR = 'DOCTOR',
    RECEPTIONIST = 'RECEPTIONIST',
}

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER',
    UNKNOWN = 'UNKNOWN',
}

export enum AppointmentStatus {
    SCHEDULED = 'SCHEDULED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    NO_SHOW = 'NO_SHOW',
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    PARTIALLY_PAID = 'PARTIALLY_PAID',
}

export enum InvoiceItemCategory {
    CONSULTATION = 'CONSULTATION',
    LAB_TEST = 'LAB_TEST',
    MEDICATION = 'MEDICATION',
    PROCEDURE = 'PROCEDURE',
    OTHER = 'OTHER',
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface IUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    phone?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ILoginRequest {
    email: string;
    password: string;
}

export interface ILoginResponse {
    accessToken: string;
    user: Pick<IUser, 'id' | 'email' | 'firstName' | 'lastName' | 'role'>;
}

export interface IRegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: Role;
    phone?: string;
}

// ─── Patient ─────────────────────────────────────────────────────────────────

export interface IEmergencyContact {
    name: string;
    relationship: string;
    phone: string;
}

export interface IPatient {
    id: string;
    mrn: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: Gender;
    email?: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    emergencyContact?: IEmergencyContact;
    bloodGroup?: string;
    allergies?: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}

export interface ICreatePatient {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: Gender;
    email?: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    emergencyContact?: IEmergencyContact;
    bloodGroup?: string;
    allergies?: string;
}

export type IUpdatePatient = Partial<ICreatePatient>;

// ─── Appointment ─────────────────────────────────────────────────────────────

export interface IAppointment {
    id: string;
    patientId: string;
    providerId: string;
    appointmentDate: string;
    durationMinutes: number;
    status: AppointmentStatus;
    reason?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    patient?: Pick<IPatient, 'id' | 'firstName' | 'lastName' | 'mrn'>;
    provider?: Pick<IUser, 'id' | 'firstName' | 'lastName'>;
}

export interface ICreateAppointment {
    patientId: string;
    providerId: string;
    appointmentDate: string;
    durationMinutes?: number;
    reason?: string;
    notes?: string;
}

export interface IUpdateAppointment {
    appointmentDate?: string;
    durationMinutes?: number;
    status?: AppointmentStatus;
    reason?: string;
    notes?: string;
}

// ─── Billing ─────────────────────────────────────────────────────────────────

export interface IInvoiceItem {
    id: string;
    description: string;
    category: InvoiceItemCategory;
    unitPriceCents: number;
    quantity: number;
    totalCents: number;
}

export interface IInvoice {
    id: string;
    invoiceNumber: string;
    appointmentId: string;
    patientId: string;
    subtotalCents: number;
    taxRate: number;
    taxAmountCents: number;
    discountCents: number;
    totalCents: number;
    paymentStatus: PaymentStatus;
    notes?: string;
    items: IInvoiceItem[];
    createdAt: string;
    updatedAt: string;
    patient?: Pick<IPatient, 'id' | 'firstName' | 'lastName' | 'mrn'>;
    appointment?: Pick<IAppointment, 'id' | 'appointmentDate' | 'status'>;
}

export interface ICreateInvoiceItem {
    description: string;
    category?: InvoiceItemCategory;
    unitPriceCents: number;
    quantity?: number;
}

export interface ICreateInvoice {
    appointmentId: string;
    patientId: string;
    items: ICreateInvoiceItem[];
    taxRate?: number;
    discountCents?: number;
    notes?: string;
}

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface IPaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface IPaginatedResponse<T> {
    data: T[];
    meta: IPaginationMeta;
}
