-- CreateEnum
CREATE TYPE "BedStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED');

-- CreateEnum
CREATE TYPE "AdmissionStatus" AS ENUM ('ADMITTED', 'DISCHARGED', 'TRANSFERRED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'PHARMACIST';

-- AlterTable
ALTER TABLE "invoice_items" ADD COLUMN     "medicine_id" UUID;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "pdf_url" TEXT,
ADD COLUMN     "s3_key" TEXT;

-- CreateTable
CREATE TABLE "medicines" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "generic_name" TEXT,
    "code" TEXT,
    "description" TEXT,
    "category" TEXT,
    "manufacturer" TEXT,
    "total_stock" INTEGER NOT NULL DEFAULT 0,
    "min_stock" INTEGER NOT NULL DEFAULT 10,
    "unit_price_cents" INTEGER NOT NULL,
    "hospital_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicine_batches" (
    "id" UUID NOT NULL,
    "batch_number" TEXT NOT NULL,
    "expiry_date" DATE NOT NULL,
    "quantity" INTEGER NOT NULL,
    "cost_price_cents" INTEGER NOT NULL,
    "medicine_id" UUID NOT NULL,
    "hospital_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicine_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wards" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "floor" TEXT,
    "type" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "hospital_id" UUID NOT NULL,

    CONSTRAINT "wards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beds" (
    "id" UUID NOT NULL,
    "bed_number" TEXT NOT NULL,
    "status" "BedStatus" NOT NULL DEFAULT 'AVAILABLE',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ward_id" UUID NOT NULL,

    CONSTRAINT "beds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admissions" (
    "id" UUID NOT NULL,
    "admission_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discharge_date" TIMESTAMP(3),
    "status" "AdmissionStatus" NOT NULL DEFAULT 'ADMITTED',
    "diagnosis" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "patient_id" UUID NOT NULL,
    "bed_id" UUID NOT NULL,
    "hospital_id" UUID NOT NULL,
    "attending_doctor_id" UUID,

    CONSTRAINT "admissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "medicines_hospital_id_idx" ON "medicines"("hospital_id");

-- CreateIndex
CREATE UNIQUE INDEX "medicines_hospital_id_name_key" ON "medicines"("hospital_id", "name");

-- CreateIndex
CREATE INDEX "medicine_batches_medicine_id_idx" ON "medicine_batches"("medicine_id");

-- CreateIndex
CREATE INDEX "medicine_batches_expiry_date_idx" ON "medicine_batches"("expiry_date");

-- CreateIndex
CREATE INDEX "wards_hospital_id_idx" ON "wards"("hospital_id");

-- CreateIndex
CREATE UNIQUE INDEX "wards_hospital_id_name_key" ON "wards"("hospital_id", "name");

-- CreateIndex
CREATE INDEX "beds_ward_id_idx" ON "beds"("ward_id");

-- CreateIndex
CREATE INDEX "beds_status_idx" ON "beds"("status");

-- CreateIndex
CREATE UNIQUE INDEX "beds_ward_id_bed_number_key" ON "beds"("ward_id", "bed_number");

-- CreateIndex
CREATE INDEX "admissions_patient_id_idx" ON "admissions"("patient_id");

-- CreateIndex
CREATE INDEX "admissions_bed_id_idx" ON "admissions"("bed_id");

-- CreateIndex
CREATE INDEX "admissions_hospital_id_idx" ON "admissions"("hospital_id");

-- CreateIndex
CREATE INDEX "admissions_status_idx" ON "admissions"("status");

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicines" ADD CONSTRAINT "medicines_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicine_batches" ADD CONSTRAINT "medicine_batches_medicine_id_fkey" FOREIGN KEY ("medicine_id") REFERENCES "medicines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wards" ADD CONSTRAINT "wards_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beds" ADD CONSTRAINT "beds_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "wards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_bed_id_fkey" FOREIGN KEY ("bed_id") REFERENCES "beds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_attending_doctor_id_fkey" FOREIGN KEY ("attending_doctor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
