import { OrderService } from './order.service';
export declare class OrderController {
    private service;
    constructor(service: OrderService);
    placeOrder(): Promise<any>;
    cancelOrder(): Promise<any>;
}
