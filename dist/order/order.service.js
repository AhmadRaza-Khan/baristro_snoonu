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
const handler_service_1 = require("../handler/handler.service");
let OrderService = class OrderService {
    config;
    handler;
    shop;
    token;
    constructor(config, handler) {
        this.config = config;
        this.handler = handler;
        this.shop = this.config.get("SHOPIFY_URL");
        this.token = this.config.get("SHOPIFY_API_SECRET");
    }
    async placeOrderWebhook() {
        const payload = {
            "snoonu_ref": "002",
            "customer_name": "Snoonu",
            "phone": "+57349539457",
            "email": "snoonu@test.com",
            "street": "Abc, Raji Mansion",
            "city": "Doha",
            "amount_tax": 1,
            "amount_total": 91,
            "amount_paid": 91,
            "amount_return": 0,
            "pos_reference": "SNOONU-001",
            "lines": [
                {
                    "product_id": 721,
                    "qty": 1,
                    "price_unit": 120.0,
                    "discount": 10.0,
                    "price_subtotal": 110.0,
                    "price_subtotal_incl": 110.0
                }
            ]
        };
        const response = await this.handler.odooApiHandler('/api/pos/create-order', 'POST', payload);
        return response;
    }
    async cancelOrderWebhook() {
        const payload = {
            "snoonu_ref": "001",
            "reason": "Customer cancelled"
        };
        const response = await this.handler.odooApiHandler('/api/pos/order/cancel', 'POST', payload);
        return response;
    }
    async rejectOrderWebhook(payload) { }
    async acceptOrderWebhook(payload) { }
    async readyForPickupWebhook(payload) { }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService, handler_service_1.HandlerService])
], OrderService);
//# sourceMappingURL=order.service.js.map