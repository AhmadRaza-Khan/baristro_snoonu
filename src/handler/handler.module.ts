import { Module } from '@nestjs/common';
import { HandlerController } from './handler.controller';
import { HandlerService } from './handler.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [HandlerController],
  providers: [HandlerService],
  exports: [HandlerService]
})
export class HandlerModule {}
