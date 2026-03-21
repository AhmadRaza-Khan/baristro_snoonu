import { Module } from '@nestjs/common';
import { SnoozeController } from './snooze.controller';
import { SnoozeService } from './snooze.service';

@Module({
  controllers: [SnoozeController],
  providers: [SnoozeService]
})
export class SnoozeModule {}
