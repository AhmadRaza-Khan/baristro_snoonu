-- AlterTable: add unique constraints to Order
CREATE UNIQUE INDEX "Order_snoonu_id_key" ON "public"."Order"("snoonu_id");
CREATE UNIQUE INDEX "Order_odoo_id_key" ON "public"."Order"("odoo_id");
