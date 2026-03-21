import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { UploadProductDto } from './dto';
import { Response } from 'express';
export declare class ProductService {
    private readonly config;
    private prisma;
    private readonly shopifyUrl;
    private readonly accessToken;
    private readonly apiUrl;
    private readonly apiKey;
    private readonly domain;
    constructor(config: ConfigService, prisma: PrismaService);
    insertCategories(): Promise<string>;
    getProductDocuments(): Promise<void>;
    syncProductsToShopify(dto: UploadProductDto, res: Response): Promise<Response<any, Record<string, any>>>;
    getSyncedProducts(res: any): Promise<any>;
    getUnSyncedProducts(res: any): Promise<any>;
}
