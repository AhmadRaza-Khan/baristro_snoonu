-- CreateTable
CREATE TABLE "public"."Addon" (
    "id" SERIAL NOT NULL,
    "attribute_id" INTEGER NOT NULL,
    "nameAr" TEXT,
    "nameEn" TEXT,
    "values" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "Addon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Addon_attribute_id_key" ON "public"."Addon"("attribute_id");
