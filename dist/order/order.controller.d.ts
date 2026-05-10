import { OrderService } from './order.service';
import { OdooWebhookDto } from './dto';
export declare class OrderController {
    private service;
    constructor(service: OrderService);
    placeOrder(payload: any): Promise<any>;
    cancelOrder(payload: any): Promise<any>;
    orderLoaded(dto: OdooWebhookDto): Promise<any>;
    orderRejected(dto: OdooWebhookDto): Promise<any>;
    orderPaid(dto: OdooWebhookDto): Promise<any>;
}
