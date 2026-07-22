-- CreateTable
CREATE TABLE "public"."Raw" (
    "id" SERIAL NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "Raw_pkey" PRIMARY KEY ("id")
);
