import { Injectable } from '@nestjs/common';
import { InventoryService } from 'src/inventory/inventory.service';
import { ProductService } from 'src/product/product.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TaskService {
    constructor(private productService: ProductService, private inventoryService: InventoryService) {}

    // @Cron(CronExpression.EVERY_DAY_AT_10AM)
    async handleInventory() {
        return this.inventoryService.stockUpdateInDB();
    }

    // @Cron(CronExpression.EVERY_DAY_AT_11AM)
    async hangleDocs() {
        return this.productService.getProductDocuments();
    }

    // @Cron(CronExpression.EVERY_5_MINUTES)
    // async handleShopifyInventory() {
    //     return this.inventoryService.updateInventory()
    // }
    
}
