-- CreateTable
CREATE TABLE "public"."Store" (
    "id" SERIAL NOT NULL,
    "channelId" TEXT NOT NULL,
    "isSnoozed" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Store_channelId_key" ON "public"."Store"("channelId");
