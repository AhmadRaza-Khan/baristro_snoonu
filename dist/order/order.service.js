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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let OrderService = class OrderService {
    config;
    shop;
    token;
    get headers() {
        return {
            'X-Shopify-Access-Token': this.token,
            'Content-Type': 'application/json',
        };
    }
    constructor(config) {
        this.config = config;
        this.shop = this.config.get("SHOPIFY_URL");
        this.token = this.config.get("SHOPIFY_API_SECRET");
    }
    async getAllOrders() {
        const url = `${this.shop}/orders.json?status=any`;
        const resData = await fetch(url, { headers: this.headers });
        if (!resData.ok) {
            throw new Error(`Failed to fetch today's orders: ${resData.statusText}`);
        }
        const jsonData = await resData.json();
        const data = [];
        for (const d of jsonData.orders) {
            const order = {
                name: `${d.customer?.first_name ?? ""} ${d.customer?.last_name ?? ""}`,
                email: d.customer?.email ?? "",
                phone: d.customer?.phone ?? "",
                price: d.current_subtotal_price,
                address: d.shipping_address
                    ? `${d.shipping_address.address1 ?? ""}, ${d.shipping_address.city ?? ""}, ${d.shipping_address.province ?? ""}, ${d.shipping_address.country ?? ""}`
                    : "",
                status: d.financial_status,
                items: d.line_items.map((item) => " " + item.name),
            };
            data.push(order);
        }
        return data;
    }
    async getTodayOrders() {
        const today = new Date().toISOString().split('T')[0];
        const url = `${this.shop}/orders.json?status=any&created_at_min=${today}T00:00:00-00:00&created_at_max=${today}T23:59:59-00:00`;
        const resData = await fetch(url, { headers: this.headers });
        if (!resData.ok) {
            throw new Error(`Failed to fetch today's orders: ${resData.statusText}`);
        }
        const jsonData = await resData.json();
        const data = [];
        for (const d of jsonData.orders) {
            const order = {
                name: `${d.customer?.first_name ?? ""} ${d.customer?.last_name ?? ""}`,
                email: d.customer?.email ?? "",
                phone: d.customer?.phone ?? "",
                price: d.current_subtotal_price,
                address: d.shipping_address
                    ? `${d.shipping_address.address1 ?? ""}, ${d.shipping_address.city ?? ""}, ${d.shipping_address.province ?? ""}, ${d.shipping_address.country ?? ""}`
                    : "",
                status: d.financial_status,
                items: d.line_items.map((item) => " " + item.name),
            };
            data.push(order);
        }
        return data;
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], OrderService);
//# sourceMappingURL=order.service.js.map