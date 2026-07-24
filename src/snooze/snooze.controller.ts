import { Body, Controller, Get, Patch, Param, Put, Res, UseGuards } from '@nestjs/common';
import { SnoozeService } from './snooze.service';
import { JwtGuard } from '../auth/guard';
import { WorkingHoursDayDto } from './dto/working-hours.dto';
import { UntilDto } from './dto/until.dto';

// @UseGuards(JwtGuard)
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
    async toggleSnooze(@Param('id') id: string, @Body() body: UntilDto) {
        return this.service.toggleProductSnooze(+id, body.until);
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
    async toggleBusyStatus(@Body() body: UntilDto) {
        return this.service.toggleBusyStatus(body.until);
    }

    @Get('snooze/store/hours')
    async getWorkingHours() {
        return this.service.getWorkingHours();
    }

    @Put('snooze/store/hours/:dayOfWeek')
    async updateWorkingHoursDay(@Param('dayOfWeek') dayOfWeek: string, @Body() body: WorkingHoursDayDto) {
        return this.service.updateWorkingHoursDay(+dayOfWeek, body);
    }

    @Get('snooze/store/hours/page')
    async hoursPage(@Res() res) {
        return this.service.hoursPage(res);
    }
}
