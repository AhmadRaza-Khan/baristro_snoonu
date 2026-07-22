import { Body, Controller, Delete, Get, Param, Post, Res } from '@nestjs/common';
import { join } from 'path';
import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
    constructor(private readonly service: MenuService){}

    @Get("update-addons")
    async updateAddons() {
        return this.service.updateAddons();
    }

    @Post("update-addons/:valueId")
    async updateAddonName(@Param('valueId') valueId: string, @Body() body: { nameAr: string }) {
        return this.service.updateAddonName(+valueId, body.nameAr);
    }

    @Post("update-addon-group/:attributeId")
    async updateAddonGroupName(@Param('attributeId') attributeId: string, @Body() body: { nameAr: string }) {
        return this.service.updateAddonGroupName(+attributeId, body.nameAr);
    }

    @Get("/addons/page")
    addonsPage(@Res() res: any) {
        return res.sendFile(join(process.cwd(), 'public', 'addons.html'));
    }

    @Get("test")
    async test(){
        await this.service.test();
    }

    @Post("sync-status")
    async syncStatus(@Body() payload: any) {
        console.log("Received menu sync status update with payload: ", payload);
        return { success: true };
    }

    @Get("/page")
    menuPage(@Res() res: any) {
        return res.sendFile(join(process.cwd(), 'public', 'manage.html'));
    }

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

    @Get("/save")
    async saveMenu(){
        return this.service.saveMenu();
    }

    @Get("/list/products")
    async listProducts() {
        return this.service.listProducts();
    }

    @Get("/list/categories")
    async listCategories() {
        return this.service.listCategories();
    }

    @Delete("/products/:id")
    async deleteProduct(@Param('id') id: string) {
        return this.service.deleteProduct(+id);
    }

    @Delete("/categories/:id")
    async deleteCategory(@Param('id') id: string) {
        return this.service.deleteCategory(+id);
    }
}
