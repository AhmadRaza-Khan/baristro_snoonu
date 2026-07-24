-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "snoozedUntil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Store" ADD COLUMN     "busyUntil" TIMESTAMP(3),
ADD COLUMN     "workingHours" JSONB NOT NULL DEFAULT '[]';
