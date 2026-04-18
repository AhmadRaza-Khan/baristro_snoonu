import { Controller, Get, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('order')
export class OrderController {
  constructor(private service: OrderService){}
  // @Get("orders-all")
  // getAllOrders(){
  //   return this.service.getAllOrders();
  // }

  // @Get("orders-today")
  // getTodayOrders(){
  //   return this.service.getTodayOrders();
  // }

  @Get("/place")
  async placeOrder(){
    return await this.service.placeOrderWebhook()
  }

  @Get("/cancel")
  async cancelOrder(){
    return await this.service.cancelOrderWebhook()
  }
}
