import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { join } from 'path';
import { SnoozeService } from './snooze.service';
import { JwtGuard } from '../auth/guard';
@UseGuards(JwtGuard)
@Controller('/')
export class SnoozeController {
    constructor(private readonly service: SnoozeService){}
    @Get("/")
    async Home(@Res() res){
        await this.service.index(res);
    }
}
