/*
  Warnings:

  - Added the required column `hospital_id` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hospital_id` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hospital_id` to the `patients` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "hospital_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "hospital_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "hospital_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "hospital_id" UUID;

-- CreateTable
CREATE TABLE "hospitals" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "branch" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip_code" TEXT,
    "phone" TEXT,
    "manager_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospitals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "appointments_hospital_id_idx" ON "appointments"("hospital_id");

-- CreateIndex
CREATE INDEX "invoices_hospital_id_idx" ON "invoices"("hospital_id");

-- CreateIndex
CREATE INDEX "patients_hospital_id_idx" ON "patients"("hospital_id");

-- CreateIndex
CREATE INDEX "users_hospital_id_idx" ON "users"("hospital_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
