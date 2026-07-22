import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { HandlerService } from '../handler/handler.service';

@Injectable()
export class SnoozeService {
    private readonly channelId: string;

    constructor(private prisma: PrismaService, private readonly handler: HandlerService, private config: ConfigService) {
        this.channelId = this.config.get<string>('CHANNELL_ID')!;
    }

    index(res) {
        return res.sendFile(join(process.cwd(), 'public', 'home.html'));
    }

    async getProducts(): Promise<any> {
        return this.prisma.product.findMany({ orderBy: { productId: 'asc' } });
    }

    async toggleProductSnooze(productId: number): Promise<any> {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const busyUntil = tomorrow.toISOString();
        const product = await this.prisma.product.findUnique({ where: { productId } });
        if (!product) return { success: false, message: 'Product not found' };

        const payload = {
        "channelId": "019f83fb-73cf-7a00-be75-df9cb1062388",
        "itemId": String(product.productId),
        "operationType": product.isSnoozed ? 1 : 0,
        "snoozeUntil": busyUntil
        }
        const response = await this.handler.apiHandler("/api/v1/menu/change-snooze-status", "PUT", payload);

        const updated = await this.prisma.product.update({
            where: { productId },
            data: { isSnoozed: !product.isSnoozed },
        });
        return { success: true, isSnoozed: updated.isSnoozed };
    }

    async getStoreStatus(): Promise<any> {
        const store = await this.prisma.store.findUnique({ where: { channelId: this.channelId } });
        return { isSnoozed: store?.isSnoozed ?? false };
    }

    async toggleStoreSnooze(): Promise<any> {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const busyUntil = tomorrow.toISOString();
        const store = await this.prisma.store.upsert({
            where: { channelId: this.channelId },
            update: {},
            create: { channelId: this.channelId, isSnoozed: false },
        });

           const requestPayload = {
                "averagePreparationTime": 8271,
                "takeawayPhoneNumber": "",
                "weekdayAvailabilities": [
                    {
                    "closingTime": "22:30",
                    "openingTime": "06:00",
                    "day": 0,
                    "isClosed": true
                    },
                    {
                    "closingTime": "22:30",
                    "openingTime": "06:00",
                    "day": 1,
                    "isClosed": true
                    },
                    {
                    "closingTime": "22:30",
                    "openingTime": "06:00",
                    "day": 2,
                    "isClosed": true
                    },
                    {
                    "closingTime": "22:30",
                    "openingTime": "06:00",
                    "day": 3,
                    "isClosed": false
                    },
                    {
                    "closingTime": "22:30",
                    "openingTime": "06:00",
                    "day": 4,
                    "isClosed": true
                    },
                    {
                    "closingTime": "22:30",
                    "openingTime": "06:00",
                    "day": 5,
                    "isClosed": true
                    },
                    {
                    "closingTime": "22:30",
                    "openingTime": "06:00",
                    "day": 6,
                    "isClosed": true
                    },
                ],
                "channelId": "019f83fb-73cf-7a00-be75-df9cb1062388"
            };

            const response = await this.handler.apiHandler("/api/v1/stores", "PUT", requestPayload)
            console.log(response);

        const updated = await this.prisma.store.update({
            where: { channelId: this.channelId },
            data: { isSnoozed: !store.isSnoozed },
        });
        return { success: true, isSnoozed: updated.isSnoozed };
    }

    async getBusyStatus(): Promise<any> {
        const store = await this.prisma.store.findUnique({ where: { channelId: this.channelId } });
        return { isBusy: store?.isBusy ?? false };
    }

    async toggleBusyStatus(): Promise<any> {
        const store = await this.prisma.store.upsert({
            where: { channelId: this.channelId },
            update: {},
            create: { channelId: this.channelId, isSnoozed: false, isBusy: false },
        });
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const busyUntil = tomorrow.toISOString();

        const payload = {
  "channelId": "019f83fb-73cf-7a00-be75-df9cb1062388",
  "busyUntil": null
};
        const response = await this.handler.apiHandler("/api/v1/stores/busy-status", "PATCH", payload);

        const updated = await this.prisma.store.update({
            where: { channelId: this.channelId },
            data: { isBusy: !store.isBusy },
        });
        return { success: true, isBusy: updated.isBusy };
    }
}
