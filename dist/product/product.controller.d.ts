import { ProductService } from './product.service';
import { UploadProductDto } from './dto';
import type { Response } from 'express';
export declare class ProductController {
    private service;
    constructor(service: ProductService);
    syncProducts(res: Response, dto: UploadProductDto): Promise<Response<any, Record<string, any>>>;
    getSyncedProducts(res: Response): Promise<any>;
    getUnSyncedProducts(res: Response): Promise<any>;
    getCategories(res: Response): Promise<string>;
}
