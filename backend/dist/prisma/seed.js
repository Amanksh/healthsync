"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
const DEFAULT_DEV_PASSWORD = 'Admin@123';
function requireProductionSecret(value, name) {
    if (process.env.NODE_ENV === 'production' && !value) {
        throw new Error(`${name} is required when NODE_ENV=production`);
    }
    return value;
}
async function main() {
    console.log('🔐 Seeding SUPER_ADMIN account...');
    const email = process.env.SUPER_ADMIN_EMAIL ?? 'admin@hospital.com';
    const password = requireProductionSecret(process.env.SUPER_ADMIN_PASSWORD, 'SUPER_ADMIN_PASSWORD') ?? DEFAULT_DEV_PASSWORD;
    const firstName = process.env.SUPER_ADMIN_FIRST_NAME ?? 'System';
    const lastName = process.env.SUPER_ADMIN_LAST_NAME ?? 'Admin';
    const phone = process.env.SUPER_ADMIN_PHONE ?? null;
    const shouldResetPassword = process.env.SUPER_ADMIN_RESET_PASSWORD === 'true';
    if (password === DEFAULT_DEV_PASSWORD && process.env.NODE_ENV !== 'production') {
        console.warn('⚠️  Using default development SUPER_ADMIN password. Change it outside local dev.');
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        const user = await prisma.user.update({
            where: { email },
            data: {
                firstName,
                lastName,
                phone,
                role: client_1.Role.SUPER_ADMIN,
                isActive: true,
                hospitalId: null,
                ...(shouldResetPassword
                    ? { password: await bcrypt.hash(password, 12) }
                    : {}),
            },
            select: { email: true, role: true },
        });
        console.log(`✅ SUPER_ADMIN exists and is active: ${user.email} (${user.role})`);
        if (!shouldResetPassword) {
            console.log('ℹ️  Existing password preserved. Set SUPER_ADMIN_RESET_PASSWORD=true to rotate it.');
        }
        return;
    }
    const user = await prisma.user.create({
        data: {
            email,
            password: await bcrypt.hash(password, 12),
            firstName,
            lastName,
            phone,
            role: client_1.Role.SUPER_ADMIN,
            hospitalId: null,
            isActive: true,
        },
        select: { email: true, role: true },
    });
    console.log(`✅ SUPER_ADMIN created: ${user.email} (${user.role})`);
}
main()
    .catch((error) => {
    console.error('❌ SUPER_ADMIN seed failed:', error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map