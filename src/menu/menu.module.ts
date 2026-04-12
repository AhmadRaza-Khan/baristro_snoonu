import { Module } from '@nestjs/common';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { HandlerModule } from '../handler/handler.module';

@Module({
  imports: [HandlerModule],
  controllers: [MenuController],
  providers: [MenuService]
})
export class MenuModule {}
