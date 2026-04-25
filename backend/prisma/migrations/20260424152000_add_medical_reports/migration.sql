-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('BLOOD_REPORT', 'ECG', 'ULTRASOUND', 'XRAY', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportDeliveryStatus" AS ENUM ('NOT_SENT', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "medical_reports" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "report_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "file_url" TEXT NOT NULL,
    "s3_key" TEXT,
    "ai_summary" TEXT,
    "delivery_status" "ReportDeliveryStatus" NOT NULL DEFAULT 'NOT_SENT',
    "delivered_at" TIMESTAMP(3),
    "delivery_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "patient_id" UUID NOT NULL,
    "hospital_id" UUID NOT NULL,
    "uploaded_by_id" UUID,

    CONSTRAINT "medical_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "medical_reports_patient_id_idx" ON "medical_reports"("patient_id");

-- CreateIndex
CREATE INDEX "medical_reports_hospital_id_idx" ON "medical_reports"("hospital_id");

-- CreateIndex
CREATE INDEX "medical_reports_type_idx" ON "medical_reports"("type");

-- CreateIndex
CREATE INDEX "medical_reports_delivery_status_idx" ON "medical_reports"("delivery_status");

-- AddForeignKey
ALTER TABLE "medical_reports" ADD CONSTRAINT "medical_reports_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_reports" ADD CONSTRAINT "medical_reports_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_reports" ADD CONSTRAINT "medical_reports_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
