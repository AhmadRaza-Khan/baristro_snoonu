import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
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
            const response = await this.handler.odooApiHandler('/api/pos/categs', 'GET');
            const categories: { category_id: number; category_name: string; products: any[] }[] = response?.data ?? [];

            for (const cat of categories) {
                await this.prisma.category.upsert({
                    where: { categoryId: cat.category_id },
                    create: { categoryId: cat.category_id, categoryName: cat.category_name, products: cat.products },
                    update: { categoryName: cat.category_name, products: cat.products },
                });
            }

            return { success: true, saved: categories.length };
        } catch (error: any) {
            console.log(`Error occurred during saving categories to database: \n ${error.message}`);
            return { success: false, message: `Error occurred during saving categories to database: \n ${error.message}` }
        }
    }

    async saveProductsToDB(): Promise<any> {
        try {
            const response = await this.handler.odooApiHandler('/api/pos/products', 'GET');
            const products: { id: number; productName: string; imageUrl: string; variants: { name: { en: string; ar: string }; [key: string]: any }[] }[] = response?.products ?? [];

            for (const product of products) {
                const productNameEn = product.productName;
                const productNameAr = product.variants[0]?.name?.ar ?? '';

                await this.prisma.product.upsert({
                    where: { productId: product.id },
                    create: { productId: product.id, productNameEn, productNameAr, imageUrl: product.imageUrl ?? '', variants: product.variants },
                    update: { productNameEn, productNameAr, imageUrl: product.imageUrl ?? '', variants: product.variants },
                });
            }

            return { success: true, saved: products.length };
        } catch (error: any) {
            console.log(`Error occurred during saving products to database: \n ${error.message}`);
            return { success: false, message: `Error occurred during saving products to database: \n ${error.message}` }
        }
    }

    async saveMenu(): Promise<any> {
        return { message: 'Use /snooze/products to fetch products.' };
    }

    async getChannelIds(): Promise<any> {
        try {
            const response = await this.handler.apiHandler("/api/v1/channels/list", "GET");
            return response;
        } catch (error) {
            console.error('Error saving menu:', error);
            throw error;
        }
    }
}
