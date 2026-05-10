import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { HandlerModule } from '../handler/handler.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [HandlerModule, PrismaModule],
  controllers: [OrderController],
  providers: [OrderService]
})
export class OrderModule {}
