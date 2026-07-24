import { OrderService } from './order.service';
export declare class OrderController {
    private service;
    constructor(service: OrderService);
    test(): Promise<{
        id: number;
        payload: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    placeOrder(payload: any): Promise<any>;
    updateOrder(payload: any): Promise<{
        success: boolean;
    }>;
    updateOrderStatus(payload: any): Promise<{
        success: boolean;
    }>;
    cancelOrder(payload: any): Promise<any>;
    orderLoaded(dto: any): Promise<any>;
    orderRejected(dto: any): Promise<any>;
    orderPaid(dto: any): Promise<any>;
    orderDelivered(dto: any): Promise<any>;
    registerWebhook(): Promise<any>;
}
