import { OrderService } from './order.service';
export declare class OrderController {
    private service;
    constructor(service: OrderService);
    getAllOrders(): Promise<{
        name: string;
        email: string;
        phone: string;
        price: string;
        address: string;
        status: string;
        items: string[];
    }[]>;
    getTodayOrders(): Promise<{
        name: string;
        email: string;
        phone: string;
        price: string;
        address: string;
        status: string;
        items: string[];
    }[]>;
}
