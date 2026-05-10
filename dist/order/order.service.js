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
    async placeOrderWebhook(payload) {
        const products = payload.products.map((product) => {
            const modifiers = product.modifierGroups.flatMap((group) => group.modifiers);
            return {
                product_id: Number(product.productId),
                qty: product.quantity,
                price_unit: product.price,
                discount: product.discountAmount,
                price_subtotal: product.price * product.quantity - product.discountAmount,
                price_subtotal_incl: product.price * product.quantity - product.discountAmount
            };
        });
        const data = {
            "snoonu_ref": payload.orderId,
            "customer_name": payload.customer.name,
            "phone": payload.customer.phoneNumber,
            "email": payload.customer.email,
            "street": payload.deliveryAddress.description,
            "city": payload.deliveryAddress.state,
            "amount_tax": 0,
            "amount_total": payload.payment.amount,
            "amount_paid": payload.payment.totalPaid,
            "amount_return": 0,
            "pos_reference": `SNOONU-${payload.orderId}`,
            "pickup_time": payload.pickupTime,
            "lines": products
        };
        const response = await this.handler.odooApiHandler('/api/pos/create-order', 'POST', data);
        console.log('Order placed in Odoo with response:', response);
        return response;
    }
    async cancelOrderWebhook(payload) {
        const response = await this.handler.odooApiHandler('/api/pos/order/cancel', 'POST', payload);
        return response;
    }
    async rejectOrderWebhook(payload) {
        const { order_id, order_name } = payload;
        console.log(`Order ${order_name} with ID ${order_id} has been rejected.`);
        return { success: true, message: "Webhook received for order rejection" };
    }
    async acceptOrderWebhook(payload) {
        const { order_id, order_name } = payload;
        console.log(`Order ${order_name} with ID ${order_id} has been accepted.`);
        return { success: true, message: "Webhook received for order acceptance" };
    }
    async readyForPickupWebhook(payload) {
        const { order_id, order_name } = payload;
        console.log(`Order ${order_name} with ID ${order_id} is ready for pickup.`);
        return { success: true, message: "Webhook received for order ready for pickup" };
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService, handler_service_1.HandlerService])
], OrderService);
//# sourceMappingURL=order.service.js.map