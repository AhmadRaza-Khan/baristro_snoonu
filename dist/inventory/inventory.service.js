"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const axios_1 = __importDefault(require("axios"));
const client_1 = require("@prisma/client");
let InventoryService = class InventoryService {
    config;
    prisma;
    shopifyUrl;
    accessToken;
    apiUrl;
    apiKey;
    locationId;
    constructor(config, prisma) {
        this.config = config;
        this.prisma = prisma;
        this.shopifyUrl = this.config.get("SHOPIFY_URL");
        this.accessToken = this.config.get("SHOPIFY_API_SECRET");
        this.apiUrl = this.config.get("API_URL");
        this.apiKey = this.config.get("API_KEY");
        this.locationId = this.config.get("LOCATION_ID");
    }
    async removeChangedPrice(id, res) {
        const product_id = Number(id);
        try {
            await this.prisma.product.update({
                where: { product_id },
                data: { changed: false },
            });
            return {
                message: 'Price status changed',
                status: 200,
            };
        }
        catch (error) {
            throw new common_1.NotFoundException(`Product with ID ${product_id} not found`);
        }
    }
    async stockUpdateInDB() {
        console.log("Starting stock update...");
        const payload = {
            apikey: this.apiKey,
            method: "GetProductBase",
            parameters: [],
        };
        console.log("Payload:", payload);
        try {
            const response = await axios_1.default.post(this.apiUrl, JSON.stringify(payload), {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                timeout: 600000,
            });
            if (!response.data?.products_base) {
                console.error("No products returned from API");
                return;
            }
            const products = response.data.products_base;
            console.log(`Fetched ${products.length} products from API`);
            const BATCH_SIZE = 100;
            let totalUpdated = 0;
            let totalFailed = 0;
            const existingProducts = await this.prisma.product.findMany({
                select: { product_id: true, price: true, promotional_price: true },
            });
            const existingMap = new Map(existingProducts.map(p => [
                p.product_id,
                { price: p.price, promotional_price: p.promotional_price },
            ]));
            for (let i = 0; i < products.length; i += BATCH_SIZE) {
                const batch = products.slice(i, i + BATCH_SIZE);
                const results = await Promise.allSettled(batch.map((prod) => this.prisma.product
                    .upsert({
                    where: { product_id: prod.product_id },
                    update: {
                        price: prod.price?.price ?? 0.0,
                        promotional_price: prod.promotional_price?.price ?? null,
                        promotional_price_from_date: prod.promotional_price?.from_date ?? "",
                        promotional_price_to_date: prod.promotional_price?.to_date ?? "",
                        stock_handy: prod.stock?.Handy ?? 0,
                        stock_central: prod.stock?.Central ?? 0,
                        stockStatus: "pending",
                        changed: (() => {
                            const existing = existingMap.get(prod.product_id);
                            const newPrice = prod.price?.price ?? 0.0;
                            const newPromo = prod.promotional_price?.price ?? null;
                            if (!existing)
                                return false;
                            return existing.price !== newPrice || existing.promotional_price !== newPromo;
                        })(),
                    },
                    create: {
                        product_id: prod.product_id,
                        subcategory_id: prod.subcategory_id ?? "",
                        index: String(prod.index) ?? "",
                        name: prod.name ?? "",
                        producer: prod.producer ?? "",
                        archival: prod.archival ?? false,
                        image: prod.image ?? "",
                        description_en: prod.description?.en ?? "",
                        description_de: prod.description?.de ?? "",
                        long_description_en: prod.long_description?.en ?? "",
                        long_description_de: prod.long_description?.de ?? "",
                        price: prod.price?.price ?? 0.0,
                        promotional_price: prod.promotional_price?.price ?? null,
                        promotional_price_from_date: prod.promotional_price?.from_date ?? "",
                        promotional_price_to_date: prod.promotional_price?.to_date ?? "",
                        mechanical_width: prod.mechanical_parameters?.Width,
                        mechanical_height: prod.mechanical_parameters?.height,
                        mechanical_thickness: prod.mechanical_parameters?.thickness,
                        mechanical_weight: prod.mechanical_parameters?.weight,
                        logistic_ean_code: prod.logistic_parameters?.ean_code
                            ? Number(prod.logistic_parameters.ean_code)
                            : null,
                        stock_handy: prod.stock?.Handy ?? 0,
                        stock_central: prod.stock?.Central ?? 0,
                        quantity_unit_en: prod.quantity_unit?.en ?? "",
                    },
                })));
                const success = results.filter(r => r.status === "fulfilled").length;
                const failed = results.filter(r => r.status === "rejected").length;
                totalUpdated += success;
                totalFailed += failed;
                console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${success} updated, ${failed} failed`);
            }
            console.log(`Stock update completed: ${totalUpdated} updated, ${totalFailed} failed`);
            return { updated: totalUpdated, failed: totalFailed };
        }
        catch (error) {
            console.error("Stock update failed:", error.message);
        }
        finally {
            await this.prisma.$disconnect();
        }
    }
    async getChangedPrices(res) {
        const changedPrices = await this.prisma.product.findMany({
            where: { changed: true, syncStatus: "synced" }
        });
        return res.json({ "products": changedPrices, "status": 200 });
    }
    async updateInventory() {
        let successCount = 0;
        let errorCount = 0;
        try {
            const products = await this.prisma.product.findMany({
                where: { stockStatus: 'synced', syncStatus: 'synced' },
                take: 1,
            });
            if (products.length === 0) {
                console.log("No products to update");
                return;
            }
            function mapPrice(originalPrice, promotionalPrice) {
                if (promotionalPrice) {
                    return {
                        defaultPrice: promotionalPrice * 1.2,
                        compare_at_price: originalPrice * 1.2
                    };
                }
                else {
                    return {
                        defaultPrice: originalPrice * 1.2,
                        compare_at_price: null
                    };
                }
            }
            for (const product of products) {
                const { product_id, inventoryItemId, stock_central, stock_handy, variantId, price, promotional_price } = product;
                try {
                    const payload = {
                        location_id: this.locationId,
                        inventory_item_id: inventoryItemId,
                        available: (stock_central || 0) + (stock_handy || 0),
                    };
                    const { defaultPrice, compare_at_price } = mapPrice(price, promotional_price);
                    const pricePayload = {
                        variant: {
                            id: variantId,
                            price: Math.round(defaultPrice)?.toString(),
                            compare_at_price: compare_at_price ? Math.round(compare_at_price).toString() : null,
                        }
                    };
                    const response = await fetch(`${this.shopifyUrl}/inventory_levels/set.json`, {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Shopify-Access-Token': this.accessToken
                        },
                        body: JSON.stringify(payload)
                    });
                    const costPayload = {
                        inventory_item: {
                            id: inventoryItemId,
                            cost: compare_at_price ? Math.round(compare_at_price).toString() : Math.round(defaultPrice).toString(),
                        },
                    };
                    const respPrices = await fetch(`${this.shopifyUrl}/variants/${variantId}.json`, {
                        method: "PUT",
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Shopify-Access-Token': this.accessToken
                        },
                        body: JSON.stringify(pricePayload)
                    });
                    const respp = await fetch(`${this.shopifyUrl}/inventory_items/${inventoryItemId}.json`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "X-Shopify-Access-Token": this.accessToken,
                        },
                        body: JSON.stringify(costPayload),
                    });
                    const jsonResponse = await response.json();
                    const jsonresp = await respPrices.json();
                    const resppp = await respp.json();
                    console.log("jsonresp", jsonresp);
                    console.log("resppp", resppp);
                    if (jsonResponse.inventory_level && respPrices.ok) {
                        await this.prisma.product.update({
                            where: {
                                product_id: product_id
                            },
                            data: { stockStatus: 'synced' }
                        });
                        successCount++;
                        console.log(`${successCount} products stock updated`);
                    }
                    else {
                        await this.prisma.product.update({
                            where: {
                                product_id: product_id
                            },
                            data: {
                                stockStatus: 'API Error'
                            }
                        });
                    }
                }
                catch (error) {
                    await this.prisma.product.update({
                        where: { product_id, },
                        data: { stockStatus: 'API Error' }
                    });
                    errorCount++;
                    console.log(`${errorCount} products failed to update stock`);
                }
            }
            console.log(`Inventory update completed: ${successCount} updated, ${errorCount} failed`);
            return;
        }
        catch (error) {
            console.log(error);
            console.log(`${errorCount} products failed to update stock`);
        }
    }
    async getAllStock(res) {
        const stock = await this.prisma.product.findMany({});
        return res.json(stock);
    }
    async getStockGoing(res) {
        const data = await this.prisma.$queryRaw(client_1.Prisma.sql `
                    SELECT *
                    FROM "Product"
                    WHERE ("stock_central" + "stock_handy") > 0
                    AND ("stock_central" + "stock_handy") < 10
                `);
        return res.json(data);
    }
    async getStockOut(res) {
        const data = await this.prisma.product.findMany({
            where: {
                stock_central: 0,
                stock_handy: 0,
            },
        });
        console.log(data.length);
        return res.json(data);
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService, prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map