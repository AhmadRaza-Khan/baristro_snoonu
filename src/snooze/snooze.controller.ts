import { Controller, Get, Res } from '@nestjs/common';
import { join } from 'path';
import { SnoozeService } from './snooze.service';

@Controller('/')
export class SnoozeController {
    constructor(private readonly service: SnoozeService){}
    @Get("/")
    async Home(@Res() res){
        await this.service.index(res);
    }
}
