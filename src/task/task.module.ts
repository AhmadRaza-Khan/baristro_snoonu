import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { ProductModule } from 'src/product/product.module';
import { InventoryModule } from 'src/inventory/inventory.module';

@Module({
  imports: [ProductModule, InventoryModule],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
