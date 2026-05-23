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
const prisma_service_1 = require("../prisma/prisma.service");
let OrderService = class OrderService {
    config;
    handler;
    prisma;
    channelId;
    constructor(config, handler, prisma) {
        this.config = config;
        this.handler = handler;
        this.prisma = prisma;
        this.channelId = this.config.get("CHANNELL_ID");
    }
    delay(ms) { new Promise(resolve => setTimeout(resolve, ms)); }
    ;
    async placeOrderWebhook(payload) {
        try {
            const products = payload.products.map((product) => {
                const modifiers = (product.modifierGroups ?? []).flatMap((group) => group.modifiers ?? []);
                const price = product.price / 100;
                const discount = product.discountAmount / 100;
                return {
                    product_id: Number(product.productId),
                    qty: product.quantity,
                    price_unit: price,
                    discount: discount,
                    price_subtotal: price * product.quantity - discount,
                    price_subtotal_incl: price * product.quantity - discount,
                    attribute_value_ids: modifiers.map((modifier) => Number(modifier.id)),
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
                "amount_total": payload.payment.amount / 100,
                "amount_paid": payload.payment.totalPaid / 100,
                "amount_return": 0,
                "pos_reference": `SNOONU-${payload.orderId}`,
                "pickup_time": payload.pickupTime,
                "lines": products
            };
            const response = await this.handler.odooApiHandler('/api/pos/create-order', 'POST', data);
            if (response && response.status == "success") {
                await this.webhookHandler({ order_id: response.order_id, order_name: response.order_name }, "validated", `/api/v1/orders/validate`, 1);
                console.log('Order successfully created in Odoo with response:', response);
                await this.prisma.order.create({
                    data: {
                        snoonu_id: String(payload.orderId),
                        odoo_id: String(response.order_id),
                        status: "validated"
                    }
                });
                return { success: true, message: "Order validdated successfully!" };
            }
            else {
                console.log('Failed to create order in Odoo. Response:', response);
                return { success: false, message: "Failed to validate order" };
            }
        }
        catch (error) {
            console.log("Error placing order:", error.message);
            return { success: false, message: "Failed to place order" };
        }
    }
    async cancelOrderWebhook(payload) {
        try {
            if (!payload.orderId)
                return { success: false, message: "Order ID is required for cancellation" };
            if (payload.channelId !== this.channelId) {
                return { success: false, message: "Invalid channel ID" };
            }
            const order = await this.prisma.order.findUnique({ where: { snoonu_id: String(payload.orderId) } });
            if (!order)
                return { success: false, message: `Order ${payload.orderId} not found in database` };
            const response = await this.handler.odooApiHandler('/api/pos/order/cancel', 'POST', { snoonu_ref: payload.orderId, "reason": payload.cancellationReason });
            if (response && response.status === "success") {
                console.log('Order successfully cancelled in Odoo with response:', response);
                await this.prisma.order.update({
                    where: { snoonu_id: String(payload.orderId) },
                    data: { status: "cancelled" },
                });
                return { success: true, message: "Order cancelled successfully" };
            }
            return { success: false, message: "Failed to cancel order in Odoo" };
        }
        catch (error) {
            console.error("Error cancelling order:", error.message);
            return { success: false, message: "Failed to cancel order" };
        }
    }
    async rejectOrderWebhook(payload) {
        try {
            const webhook = await this.webhookHandler(payload, "rejected", `/api/v1/orders/reject`, 7);
            return { success: true, message: "Webhook received for order rejection" };
        }
        catch (error) {
            console.error("Error rejecting order:", error.message);
            return { success: false, message: "Failed to reject order" };
        }
    }
    async acceptOrderWebhook(payload) {
        try {
            await this.webhookHandler(payload, "accepted", `/api/v1/orders/accept`, 2);
            await this.delay(3000);
            await this.webhookHandler(payload, "preparing", `/api/v1/orders/prepare`, 3);
            return { success: true, message: "Webhook received for order acceptance" };
        }
        catch (error) {
            console.error("Error accepting order:", error.message);
            return { success: false, message: "Failed to accept order" };
        }
    }
    async readyForPickupWebhook(payload) {
        const { order_id, order_name } = payload;
        console.log(`Order ${order_name} with ID ${order_id} is ready for pickup.`);
        return { success: true, message: "Webhook received for order ready for pickup" };
    }
    async webhookHandler(payload, webhookType, endpoint, status) {
        try {
            const { order_id, order_name } = payload;
            const order = await this.prisma.order.findUnique({ where: { odoo_id: String(order_id) } });
            const requestData = {
                "orderId": order?.snoonu_id,
                "status": status,
                "channelId": this.channelId,
            };
            await this.handler.apiHandler(endpoint, 'POST', requestData);
            await this.prisma.order.update({
                where: { odoo_id: String(order_id) },
                data: { status: webhookType },
            });
            console.log(`Order ${order_name} with ID ${order_id} has been ${webhookType}.`);
            return { success: true, message: `Webhook received for order ${webhookType}` };
        }
        catch (error) {
            console.error("Error rejecting order:", error.message);
            return { success: false, message: "Failed to reject order" };
        }
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService, handler_service_1.HandlerService, prisma_service_1.PrismaService])
], OrderService);
//# sourceMappingURL=order.service.js.map