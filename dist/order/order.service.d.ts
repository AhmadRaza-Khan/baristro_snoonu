import { ConfigService } from '@nestjs/config';
import { HandlerService } from '../handler/handler.service';
export declare class OrderService {
    private readonly config;
    private readonly handler;
    private readonly shop;
    private readonly token;
    constructor(config: ConfigService, handler: HandlerService);
    placeOrderWebhook(): Promise<any>;
    cancelOrderWebhook(): Promise<any>;
    rejectOrderWebhook(payload: any): Promise<any>;
    acceptOrderWebhook(payload: any): Promise<any>;
    readyForPickupWebhook(payload: any): Promise<any>;
}
