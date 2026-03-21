"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const common_1 = require("@nestjs/common");
const product_service_1 = require("./product.service");
const dto_1 = require("./dto");
const guard_1 = require("../auth/guard");
let ProductController = class ProductController {
    service;
    constructor(service) {
        this.service = service;
    }
    syncProducts(res, dto) {
        return this.service.syncProductsToShopify(dto, res);
    }
    getSyncedProducts(res) {
        return this.service.getSyncedProducts(res);
    }
    getUnSyncedProducts(res) {
        return this.service.getUnSyncedProducts(res);
    }
    getCategories(res) {
        return this.service.insertCategories();
    }
};
exports.ProductController = ProductController;
__decorate([
    (0, common_1.Post)("upload"),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, dto_1.UploadProductDto]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "syncProducts", null);
__decorate([
    (0, common_1.Get)("get-synced"),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "getSyncedProducts", null);
__decorate([
    (0, common_1.Get)("get-unsynced"),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "getUnSyncedProducts", null);
__decorate([
    (0, common_1.Get)("categories"),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "getCategories", null);
exports.ProductController = ProductController = __decorate([
    (0, common_1.UseGuards)(guard_1.JwtGuard),
    (0, common_1.Controller)('product'),
    __metadata("design:paramtypes", [product_service_1.ProductService])
], ProductController);
//# sourceMappingURL=product.controller.js.map