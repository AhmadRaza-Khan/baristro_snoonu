import { ConfigService } from '@nestjs/config';
export declare class OrderService {
    private readonly config;
    private readonly shop;
    private readonly token;
    private get headers();
    constructor(config: ConfigService);
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
