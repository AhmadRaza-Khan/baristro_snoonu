import { InventoryService } from 'src/inventory/inventory.service';
import { ProductService } from 'src/product/product.service';
export declare class TaskService {
    private productService;
    private inventoryService;
    constructor(productService: ProductService, inventoryService: InventoryService);
    handleInventory(): Promise<{
        updated: number;
        failed: number;
    } | undefined>;
    hangleDocs(): Promise<void>;
}
