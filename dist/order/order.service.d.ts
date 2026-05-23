import { ConfigService } from '@nestjs/config';
import { HandlerService } from '../handler/handler.service';
import { OdooWebhookDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class OrderService {
    private readonly config;
    private readonly handler;
    private readonly prisma;
    private readonly channelId;
    constructor(config: ConfigService, handler: HandlerService, prisma: PrismaService);
    delay(ms: number): void;
    placeOrderWebhook(payload: any): Promise<any>;
    cancelOrderWebhook(payload: any): Promise<any>;
    rejectOrderWebhook(payload: OdooWebhookDto): Promise<any>;
    acceptOrderWebhook(payload: OdooWebhookDto): Promise<any>;
    readyForPickupWebhook(payload: OdooWebhookDto): Promise<any>;
    webhookHandler(payload: any, webhookType: string, endpoint: string, status: number): Promise<any>;
}
