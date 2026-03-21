import { InventoryService } from './inventory.service';
import type { Response } from 'express';
export declare class InventoryController {
    private service;
    constructor(service: InventoryService);
    removeChangedPrice(id: string, res: Response): Promise<{
        message: string;
        status: number;
    }>;
    getAllOrders(res: Response): Promise<any>;
    getTodayOrders(res: Response): Promise<any>;
    getFailedOrders(res: Response): Promise<any>;
    test(res: Response): Promise<{
        updated: number;
        failed: number;
    } | undefined>;
    logChangedPrices(res: Response): Promise<Response<any, Record<string, any>>>;
}
