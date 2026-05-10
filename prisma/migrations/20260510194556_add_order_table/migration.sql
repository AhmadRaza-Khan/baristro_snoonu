-- CreateTable
CREATE TABLE "public"."Order" (
    "id" SERIAL NOT NULL,
    "snoonu_id" TEXT NOT NULL,
    "odoo_id" TEXT NOT NULL,
    "status" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
