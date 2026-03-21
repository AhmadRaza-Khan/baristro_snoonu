import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { HandlerService } from 'src/handler/handler.service';

@Injectable()
export class MenuService {
    private readonly snoonuApiUrl: string;
    constructor(
        private handler: HandlerService, private prisma: PrismaService, private config: ConfigService
    ) {
        this.snoonuApiUrl = this.config.get<string>('SNOONU_API_URL');
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
