import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_DEV_PASSWORD = 'Admin@123';

function requireProductionSecret(value: string | undefined, name: string) {
  if (process.env.NODE_ENV === 'production' && !value) {
    throw new Error(`${name} is required when NODE_ENV=production`);
  }

  return value;
}

async function main() {
  console.log('🔐 Seeding SUPER_ADMIN account...');

  const email = process.env.SUPER_ADMIN_EMAIL ?? 'admin@hospital.com';
  const password =
    requireProductionSecret(
      process.env.SUPER_ADMIN_PASSWORD,
      'SUPER_ADMIN_PASSWORD',
    ) ?? DEFAULT_DEV_PASSWORD;
  const firstName = process.env.SUPER_ADMIN_FIRST_NAME ?? 'System';
  const lastName = process.env.SUPER_ADMIN_LAST_NAME ?? 'Admin';
  const phone = process.env.SUPER_ADMIN_PHONE ?? null;
  const shouldResetPassword = process.env.SUPER_ADMIN_RESET_PASSWORD === 'true';

  if (password === DEFAULT_DEV_PASSWORD && process.env.NODE_ENV !== 'production') {
    console.warn(
      '⚠️  Using default development SUPER_ADMIN password. Change it outside local dev.',
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    const user = await prisma.user.update({
      where: { email },
      data: {
        firstName,
        lastName,
        phone,
        role: Role.SUPER_ADMIN,
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
      console.log(
        'ℹ️  Existing password preserved. Set SUPER_ADMIN_RESET_PASSWORD=true to rotate it.',
      );
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
      role: Role.SUPER_ADMIN,
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
