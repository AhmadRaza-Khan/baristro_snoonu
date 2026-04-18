import { Controller, Get } from '@nestjs/common';
import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
    constructor(private readonly service: MenuService){}

    @Get("/categories")
    async saveCategories(){
        return this.service.saveCategoriesToDB();
    }

    @Get("/products")
    async saveProducts(){
        return this.service.saveProductsToDB();
    }

    @Get("/channels")
    async getChannelIds(){
        return this.service.getChannelIds();
    }
}
