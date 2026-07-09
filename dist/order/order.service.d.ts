import { ConfigService } from '@nestjs/config';
import { HandlerService } from '../handler/handler.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class OrderService {
    private readonly config;
    private readonly handler;
    private readonly prisma;
    private readonly channelId;
    private readonly posId;
    constructor(config: ConfigService, handler: HandlerService, prisma: PrismaService);
    test(): Promise<any>;
    delay(ms: number): void;
    placeOrderWebhook(payload: any): Promise<any>;
    cancelOrderWebhook(payload: any): Promise<any>;
    rejectOrderWebhook(payload: any): Promise<any>;
    acceptOrderWebhook(payload: any): Promise<any>;
    readyForPickupWebhook(payload: any): Promise<any>;
    deliveryOrderWebhook(payload: any): Promise<any>;
    webhookHandler(payload: any, webhookType: string, endpoint: string, status: number): Promise<any>;
    registerWebhook(): Promise<any>;
}
