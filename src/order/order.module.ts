import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { HandlerModule } from '../handler/handler.module';

@Module({
  imports: [HandlerModule],
  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule {}
