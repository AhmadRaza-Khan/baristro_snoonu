import { OrderService } from './order.service';
export declare class OrderController {
    private service;
    constructor(service: OrderService);
    placeOrder(payload: any): Promise<any>;
    cancelOrder(payload: any): Promise<any>;
    orderLoaded(dto: any): Promise<any>;
    orderRejected(dto: any): Promise<any>;
    orderPaid(dto: any): Promise<any>;
    registerWebhook(): Promise<any>;
}
