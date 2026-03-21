import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Response } from 'express';
export declare class InventoryService {
    private readonly config;
    private prisma;
    private readonly shopifyUrl;
    private readonly accessToken;
    private readonly apiUrl;
    private readonly apiKey;
    private readonly locationId;
    constructor(config: ConfigService, prisma: PrismaService);
    removeChangedPrice(id: any, res: Response): Promise<{
        message: string;
        status: number;
    }>;
    stockUpdateInDB(): Promise<{
        updated: number;
        failed: number;
    } | undefined>;
    getChangedPrices(res: Response): Promise<Response<any, Record<string, any>>>;
    updateInventory(): Promise<void>;
    getAllStock(res: any): Promise<any>;
    getStockGoing(res: any): Promise<any>;
    getStockOut(res: any): Promise<any>;
}
