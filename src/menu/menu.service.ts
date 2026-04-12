import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { HandlerService } from '../handler/handler.service';

@Injectable()
export class MenuService {
    private readonly snoonuApiUrl: string;
    constructor(
        private handler: HandlerService, private prisma: PrismaService, private config: ConfigService
    ) {
        this.snoonuApiUrl = this.config.get<string>('SNOONU_API_URL')!;
    }

    async saveCategoriesToDB(): Promise<any> {
        try {
            const categories = await this.handler.odooApiHandler('/api/pos/categs', 'GET');
            return categories;
            
        } catch (error: any) {
            console.log(`Error occurred during saving products to database: \n ${error.message}`);
            return { success: false, message: `Error occurred during saving products to database: \n ${error.message}` }
        }
    }

    async saveProductsToDB(): Promise<any> {
        try {
            const products = await this.handler.odooApiHandler('/api/pos/products', 'GET');
            return products;
            
        } catch (error: any) {
            console.log(`Error occurred during saving products to database: \n ${error.message}`);
            return { success: false, message: `Error occurred during saving products to database: \n ${error.message}` }
        }
    }

    async saveMenu(): Promise<any> {
        const payload = {};
        try {
            const response = await this.handler.apiHandler("api/v1/menu/save", "POST", payload);
            return response;
        } catch (error) {
            console.error('Error saving menu:', error);
            throw error;
        }
    }
}
