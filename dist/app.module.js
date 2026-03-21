"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("./auth/auth.module");
const prisma_module_1 = require("./prisma/prisma.module");
const config_1 = require("@nestjs/config");
const order_module_1 = require("./order/order.module");
const product_service_1 = require("./product/product.service");
const product_controller_1 = require("./product/product.controller");
const product_module_1 = require("./product/product.module");
const home_module_1 = require("./home/home.module");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const inventory_module_1 = require("./inventory/inventory.module");
const schedule_1 = require("@nestjs/schedule");
const task_module_1 = require("./task/task.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            auth_module_1.AuthModule,
            prisma_module_1.PrismaModule,
            order_module_1.OrderModule,
            product_module_1.ProductModule,
            home_module_1.HomeModule,
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'public')
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), 'files'),
                serveRoot: '/files',
            }),
            inventory_module_1.InventoryModule,
            task_module_1.TaskModule,
        ],
        providers: [product_service_1.ProductService],
        controllers: [product_controller_1.ProductController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map