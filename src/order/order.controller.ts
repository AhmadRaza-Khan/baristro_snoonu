import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private service: OrderService){}

  @Post("/place")
  async placeOrder(@Body() payload: any){
    return await this.service.placeOrderWebhook(payload);
  }

  @Post("/update")
  async updateOrder(@Body() payload: any){
    console.log("Received order update with payload: ", payload);
    return { success: true };
  }

  @Post("/status")
  async updateOrderStatus(@Body() payload: any){
    console.log("Received order status update with payload: ", payload);
    return { success: true };
  }

  @Post("/cancel")
  async cancelOrder(@Body() payload: any){
    return await this.service.cancelOrderWebhook(payload);
  }

  @Post("loaded")
  async orderLoaded(@Body() dto: any){
    return await this.service.acceptOrderWebhook(dto);
  }

  @Post("rejected")
  async orderRejected(@Body() dto: any){
    return await this.service.rejectOrderWebhook(dto);
  }

  @Post("paid")
  async orderPaid(@Body() dto: any){
    return await this.service.readyForPickupWebhook(dto);
  }

  @Post("delivered")
  async orderDelivered(@Body() dto: any){
    return await this.service.deliveryOrderWebhook(dto);
  }

  @Get("register-webhook")
  async registerWebhook(){
    return await this.service.registerWebhook();
  }
}
