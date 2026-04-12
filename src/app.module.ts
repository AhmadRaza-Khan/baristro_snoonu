import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { OrderModule } from './order/order.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskModule } from './task/task.module';
import { MenuModule } from './menu/menu.module';
import { SnoozeModule } from './snooze/snooze.module';
import { HandlerModule } from './handler/handler.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule, 
    PrismaModule,
    OrderModule,
    TaskModule,
    MenuModule,
    SnoozeModule,
    HandlerModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
