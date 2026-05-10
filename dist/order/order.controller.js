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
exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const order_service_1 = require("./order.service");
const dto_1 = require("./dto");
let OrderController = class OrderController {
    service;
    constructor(service) {
        this.service = service;
    }
    async placeOrder(payload) {
        return await this.service.placeOrderWebhook(payload);
    }
    async cancelOrder(payload) {
        return await this.service.cancelOrderWebhook(payload);
    }
    async orderLoaded(dto) {
        return await this.service.acceptOrderWebhook(dto);
    }
    async orderRejected(dto) {
        return await this.service.rejectOrderWebhook(dto);
    }
    async orderPaid(dto) {
        return await this.service.readyForPickupWebhook(dto);
    }
};
exports.OrderController = OrderController;
__decorate([
    (0, common_1.Post)("/place"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "placeOrder", null);
__decorate([
    (0, common_1.Post)("/cancel"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "cancelOrder", null);
__decorate([
    (0, common_1.Post)("loaded"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.OdooWebhookDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "orderLoaded", null);
__decorate([
    (0, common_1.Post)("rejected"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.OdooWebhookDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "orderRejected", null);
__decorate([
    (0, common_1.Post)("paid"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.OdooWebhookDto]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "orderPaid", null);
exports.OrderController = OrderController = __decorate([
    (0, common_1.Controller)('order'),
    __metadata("design:paramtypes", [order_service_1.OrderService])
], OrderController);
//# sourceMappingURL=order.controller.js.map