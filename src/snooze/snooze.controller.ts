import { Controller, Get, Patch, Param, Res, UseGuards } from '@nestjs/common';
import { SnoozeService } from './snooze.service';
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('/')
export class SnoozeController {
    constructor(private readonly service: SnoozeService) {}

    @Get('/')
    async home(@Res() res) {
        await this.service.index(res);
    }

    @Get('snooze/products')
    async getProducts() {
        return this.service.getProducts();
    }

    @Patch('snooze/products/:id/snooze')
    async toggleSnooze(@Param('id') id: string) {
        return this.service.toggleProductSnooze(+id);
    }

    @Get('snooze/store')
    async getStoreStatus() {
        return this.service.getStoreStatus();
    }

    @Patch('snooze/store')
    async toggleStoreSnooze() {
        return this.service.toggleStoreSnooze();
    }

    @Get('snooze/store/busy')
    async getBusyStatus() {
        return this.service.getBusyStatus();
    }

    @Patch('snooze/store/busy')
    async toggleBusyStatus() {
        return this.service.toggleBusyStatus();
    }
}
