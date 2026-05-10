import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HandlerService } from '../handler/handler.service';
import { OdooWebhookDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrderService {
  private readonly shop: string;
  private readonly token: string;

  constructor(private readonly config: ConfigService, private readonly handler: HandlerService, private readonly prisma: PrismaService){
          this.shop = this.config.get<string>("SHOPIFY_URL")!;
          this.token = this.config.get<string>("SHOPIFY_API_SECRET")!;
  }
  
  async placeOrderWebhook(payload: any): Promise<any> {
    try {
      const products = payload.products.map((product: any) => {
      const modifiers = product.modifierGroups.flatMap((group: any) => group.modifiers);
      return {
        product_id: Number(product.productId),
        qty: product.quantity,
        price_unit: product.price,
        discount: product.discountAmount,
        price_subtotal: product.price * product.quantity - product.discountAmount,
        price_subtotal_incl: product.price * product.quantity - product.discountAmount
      };
    });


    const data =  {
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
    }

    const response = await this.handler.odooApiHandler('/api/pos/create-order', 'POST', data);
    if (response && response.status == "success"){
      // add logic to send status as validated to snoonu
      console.log('Order successfully created in Odoo with response:', response);

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
      const response = await this.handler.odooApiHandler('/api/pos/order/cancel', 'POST', payload);
      if(response && response.status == "success"){
        console.log('Order successfully cancelled in Odoo with response:', response);
        if(!payload.orderId) return { success: false, message: "Order ID is required for cancellation" };
        await this.prisma.order.delete({
          where: { snoonu_id: String(payload.orderId) }
        });
      }
    } catch (error: any) {
      console.error("Error cancelling order:", error.message);
    }
  }

  async rejectOrderWebhook(payload: OdooWebhookDto): Promise<any> {
    const { order_id, order_name } = payload;
    console.log(`Order ${order_name} with ID ${order_id} has been rejected.`);
    return { success: true, message: "Webhook received for order rejection" };
  }

  async acceptOrderWebhook(payload: OdooWebhookDto): Promise<any> {
    const { order_id, order_name } = payload;
    console.log(`Order ${order_name} with ID ${order_id} has been accepted.`);
    return { success: true, message: "Webhook received for order acceptance" };
  }

  async readyForPickupWebhook(payload: OdooWebhookDto): Promise<any> {
    const { order_id, order_name } = payload;
    console.log(`Order ${order_name} with ID ${order_id} is ready for pickup.`);
    return { success: true, message: "Webhook received for order ready for pickup" };
  }
}
