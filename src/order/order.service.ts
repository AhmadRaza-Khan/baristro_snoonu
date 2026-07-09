import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HandlerService } from '../handler/handler.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderService {
  private readonly channelId: string;
  private readonly posId: string;
  constructor(private readonly config: ConfigService, private readonly handler: HandlerService, private readonly prisma: PrismaService){
          this.channelId = this.config.get<string>("CHANNELL_ID")!;
          this.posId = this.config.get<string>("POS_ID")!;
  }

  async test(){
    const response = await this.handler.odooApiHandler('/api/pos/configs', 'GET');
    return response;
  }

  delay (ms: number){ new Promise(resolve => setTimeout(resolve, ms)) };

  async placeOrderWebhook(payload: any): Promise<any> {
    console.log("recied payload from order \n", payload);

    function mapOrderType(id: any) {
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
      const products = payload.products.map((product: any) => {
        const modifiers = (product.modifierGroups ?? []).flatMap((group: any) => group.modifiers ?? []);
        const price = product.price / 100;
        const discount = product.discountAmount / 100;
        return {
          product_id: Number(product.productId),
          qty: product.quantity,
          price_unit: price,
          discount: discount,
          price_subtotal: price * product.quantity - discount,
          price_subtotal_incl: price * product.quantity - discount,
          attribute_value_ids: modifiers.map((modifier: any) => Number(modifier.id)),
        };
      });

      const name = payload?.customer?.name ? payload?.customer?.name : "Snoonu Customer";
      const phone = payload?.customer?.phoneNumber ? payload?.customer?.phoneNumber : null;
      const email = payload?.customer?.email ? payload?.customer?.email : null;
      const street = payload?.deliveryAddress?.description ? payload?.deliveryAddress?.description : null;
      const city = payload?.deliveryAddress?.state ? payload?.deliveryAddress?.state : null;

    const data =  {
      "partner_ref": "Snoonu-" + payload.orderId,
      "order_type": mapOrderType(payload.orderType),
      "customer_name": name,
      "phone": phone,
      "email": email,
      "street": street,
      "city": city,
      "delivery_fee": payload.deliveryFee / 100,

      "amount_tax": 0,
      "amount_total": payload.payment.amount / 100,
      "amount_paid": payload.payment.totalPaid / 100,
      "amount_return": 0,

      "pos_reference": `SNOONU-${payload.orderId}`,
      "pickup_time": payload.pickupTime || null,

      "lines": products
    }

    const response = await this.handler.odooApiHandler('/api/pos/create-order', 'POST', data);
    if (response && response.status == "success"){

      await this.prisma.order.create({
        data: {
          snoonu_id: String(payload.orderId),
          odoo_id: String(response.order_id),
          status: "validated"
        }
      });
      return { success: true, message: "Order validdated successfully!" };
    } else {
      console.log('Failed to create order in Odoo. Response:', response);
      return { success: false, message: "Failed to validate order" };
    }
    } catch (error: any) {
      console.log("Error placing order:", error.message);
      return { success: false, message: "Failed to place order" };
    }
  }

  async cancelOrderWebhook(payload: any): Promise<any> {
    try {
      if (!payload.orderId) return { success: false, message: "Order ID is required for cancellation" };

      const order = await this.prisma.order.findUnique({ where: { snoonu_id: String(payload.orderId) } });
      if (!order) return { success: false, message: `Order ${payload.orderId} not found in database` };

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
    } catch (error: any) {
      console.error("Error cancelling order:", error.message);
      return { success: false, message: "Failed to cancel order" };
    }
  }

  async rejectOrderWebhook(payload: any): Promise<any> {
    try {
      const webhook = await this.webhookHandler(payload, "rejected", `/api/v1/orders/reject`, 7);
      console.log(`Order ${payload.order_name} with ID ${payload.order_id} has been rejected.`);
      return { success: true, message: "Webhook received for order rejection" };
    } catch (error: any) {
      console.error("Error rejecting order:", error.message);
      return { success: false, message: "Failed to reject order" };
    }
  }

  

  async acceptOrderWebhook(payload: any): Promise<any> {
    try {      
      await this.webhookHandler(payload, "accepted", `/api/v1/orders/accept`, 2);
      await this.delay(3000);
      await this.webhookHandler(payload, "preparing", `/api/v1/orders/prepare`, 3);
      console.log(`Order ${payload.order_name} with ID ${payload.order_id} has been accepted.`);
      return { success: true, message: "Webhook received for order acceptance" };
    } catch (error: any) {
      console.error("Error accepting order:", error.message);
      return { success: false, message: "Failed to accept order" };
    }
  }

  async readyForPickupWebhook(payload: any): Promise<any> {
    try {
      await this.webhookHandler(payload, "ready", `/api/v1/orders/ready`, 8);
      console.log(`Order ${payload.order_name} with ID ${payload.order_id} is ready for pickup.`);
    return { success: true, message: "Webhook received for order ready for pickup" };
    } catch (error: any) {
      console.error("Error processing ready for pickup webhook:", error.message);
      return { success: false, message: "Failed to process ready for pickup webhook" };
    }
  }

  async webhookHandler(payload: any, webhookType: string, endpoint: string, status: number): Promise<any> {
    try {
      const { order_id, order_name } = payload;
      const order = await this.prisma.order.findUnique({ where: { odoo_id: String(order_id) } });

      const requestData = {
        "integrationOrderId": "Snoonu-" + payload.order_id,
        "orderId": order?.snoonu_id,
        "channelId": this.channelId,
      }
      await this.handler.apiHandler(endpoint, 'POST', requestData);

      await this.prisma.order.update({
        where: { odoo_id: String(order_id) },
        data: { status: webhookType },
      });
  
      console.log(`Order ${order_name} with ID ${order_id} has been ${webhookType}.`);
      return { success: true, message: `Webhook received for order ${webhookType}` };
    } catch (error: any) {
      console.error("Error rejecting order:", error.message);
      return { success: false, message: "Failed to reject order" };
    }
  }

  async registerWebhook(): Promise<any> {
    const BASE_URL = "https://baristrosnoonu.cyberboost.io";
    try {
      const payload = {
            "id": "019dd371-0ab8-7b36-a768-c4fc7039737b",
            "webhooks": {
              "menuSyncStatusWebhook": "https://baristrosnoonu.cyberboost.io/menu/sync-status",
              "orderCreateWebhook": "https://baristrosnoonu.cyberboost.io/order/place",
              "orderCancelWebhook": "https://baristrosnoonu.cyberboost.io/order/cancel",
              "orderUpdateWebhook": "https://baristrosnoonu.cyberboost.io/order/update",
              "orderStatusUpdateWebhook": "https://baristrosnoonu.cyberboost.io/order/status",
              "loginWebhook": null
            }
}
      const response = await this.handler.apiHandler('/api/v1/pos/register-webhooks', 'POST', payload);
      console.log('Webhook registration response is :', response);
      return { success: true, message: response };
    } catch (error: any) {
      console.error("Error registering webhooks:", error.message);
      return { success: false, message: "Failed to register webhooks" };
    }
  }
}
