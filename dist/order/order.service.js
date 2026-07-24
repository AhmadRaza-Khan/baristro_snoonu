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
    posId;
    constructor(config, handler, prisma) {
        this.config = config;
        this.handler = handler;
        this.prisma = prisma;
        this.channelId = this.config.get("CHANNELL_ID");
        this.posId = this.config.get("POS_ID");
    }
    async test() {
        return await this.prisma.raw.findMany({});
    }
    delay(ms) { new Promise(resolve => setTimeout(resolve, ms)); }
    ;
    async placeOrderWebhook(payload) {
        console.log("recied payload from order \n", payload);
        await this.prisma.raw.create({ data: {
                payload: payload
            } });
        function mapOrderType(id) {
            switch (id) {
                case 1:
                    return 6;
                case 2:
                    return 2;
                case 3:
                    return 7;
                default:
                    throw new Error(`Unknown Snoonu ID: ${id}`);
            }
        }
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
                    attribute_value_ids: modifiers.map((modifier) => Number(modifier.id.match(/\d+$/)?.[0])),
                };
            });
            const name = payload?.customer?.name ? payload?.customer?.name : "Snoonu Customer";
            const phone = payload?.customer?.phoneNumber ? payload?.customer?.phoneNumber : null;
            const email = payload?.customer?.email ? payload?.customer?.email : null;
            const street = payload?.deliveryAddress?.description ? payload?.deliveryAddress?.description : null;
            const city = payload?.deliveryAddress?.state ? payload?.deliveryAddress?.state : null;
            const data = {
                "partner_ref": "Snoonu-" + payload.orderId,
                "order_type": mapOrderType(payload.orderType),
                "customer_name": name,
                "phone": phone,
                "email": email,
                "street": street,
                "discount": payload.totalDiscount / 100,
                "city": city,
                "delivery_fee": payload.deliveryFee / 100,
                "amount_tax": 0,
                "amount_total": payload.payment.amount / 100,
                "amount_paid": payload.payment.totalPaid / 100,
                "amount_return": 0,
                "pos_reference": `SNOONU-${payload.orderId}`,
                "pickup_time": payload.pickupTime || null,
                "lines": products
            };
            const response = await this.handler.odooApiHandler('/api/pos/create-order', 'POST', data);
            if (response && response.status == "success") {
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
            const order = await this.prisma.order.findUnique({ where: { snoonu_id: String(payload.orderId) } });
            if (!order)
                return { success: false, message: `Order ${payload.orderId} not found in database` };
            const response = await this.handler.odooApiHandler('/api/pos/order/cancel', 'POST', { partner_ref: `Snoonu-${payload.order_id}`, "reason": payload.cancellationReason });
            if (response && response.status === "success") {
                console.log('Order successfully cancelled in Odoo with response:', response);
                await this.prisma.order.update({
                    where: { snoonu_id: String(payload.orderId) },
                    data: { status: "cancelled" },
                });
                console.log(`Order with Partner ID ${payload.orderId} has been cancelled in the database.`);
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
            const webhook = await this.webhookHandler(payload, "cancelled", `/api/v1/orders/cancel`, 7);
            console.log(`Order ${payload.order_name} with ID ${payload.order_id} has been rejected.`);
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
            console.log(`Order ${payload.order_name} with ID ${payload.order_id} has been accepted.`);
            return { success: true, message: "Webhook received for order acceptance" };
        }
        catch (error) {
            console.error("Error accepting order:", error.message);
            return { success: false, message: "Failed to accept order" };
        }
    }
    async readyForPickupWebhook(payload) {
        try {
            await this.webhookHandler(payload, "ready", `/api/v1/orders/ready`, 8);
            console.log(`Order ${payload.order_name} with ID ${payload.order_id} is ready for pickup.`);
            return { success: true, message: "Webhook received for order ready for pickup" };
        }
        catch (error) {
            console.error("Error processing ready for pickup webhook:", error.message);
            return { success: false, message: "Failed to process ready for pickup webhook" };
        }
    }
    async deliveryOrderWebhook(payload) {
        try {
            const webhook = await this.webhookHandler(payload, "delivered", `/api/v1/orders/delivered`, 7);
            console.log(`Order ${payload.order_name} with ID ${payload.order_id} has been delivered.`);
            return { success: true, message: "Webhook received for order delivery" };
        }
        catch (error) {
            console.error("Error delivering order:", error.message);
            return { success: false, message: "Failed to deliver order" };
        }
    }
    async webhookHandler(payload, webhookType, endpoint, status) {
        try {
            const { order_id, order_name } = payload;
            const order = await this.prisma.order.findUnique({ where: { odoo_id: String(order_id) } });
            const requestData = {
                "integrationOrderId": "Snoonu-" + payload.order_id,
                "orderId": order?.snoonu_id,
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
    async registerWebhook() {
        const BASE_URL = "https://baristrosnoonu.cyberboost.io";
        try {
            const payload = {
                "id": "019f83e6-3a91-71d5-b0be-07f389186dd8",
                "webhooks": {
                    "menuSyncStatusWebhook": "https://baristrosnoonu.cyberboost.io/menu/sync-status",
                    "orderCreateWebhook": "https://baristrosnoonu.cyberboost.io/order/place",
                    "orderCancelWebhook": "https://baristrosnoonu.cyberboost.io/order/cancel",
                    "orderUpdateWebhook": "https://baristrosnoonu.cyberboost.io/order/update",
                    "orderStatusUpdateWebhook": "https://baristrosnoonu.cyberboost.io/order/status",
                    "loginWebhook": null
                }
            };
            const response = await this.handler.apiHandler('/api/v1/pos/register-webhooks', 'POST', payload);
            console.log('Webhook registration response is :', response);
            return { success: true, message: response };
        }
        catch (error) {
            console.error("Error registering webhooks:", error.message);
            return { success: false, message: "Failed to register webhooks" };
        }
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService, handler_service_1.HandlerService, prisma_service_1.PrismaService])
], OrderService);
//# sourceMappingURL=order.service.js.map