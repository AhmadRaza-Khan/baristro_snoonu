-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "attributes" JSONB NOT NULL DEFAULT '[]';
