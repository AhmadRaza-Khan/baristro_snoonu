"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const argon = __importStar(require("argon2"));
const prisma_service_1 = require("../prisma/prisma.service");
const library_1 = require("@prisma/client/runtime/library");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const path_1 = require("path");
let AuthService = class AuthService {
    prisma;
    config;
    jwt;
    clientEmail;
    clientPassword;
    snoonuApiUrl;
    constructor(prisma, config, jwt) {
        this.prisma = prisma;
        this.config = config;
        this.jwt = jwt;
        this.clientEmail = this.config.get('CLIENT_EMAIL');
        this.clientPassword = this.config.get('CLIENT_PASSWORD');
        this.snoonuApiUrl = this.config.get('SNOONU_API_URL');
    }
    async signUp(dto) {
        try {
            const hash = await argon.hash(dto.password);
            dto.password = hash;
            const newUser = await this.prisma.user.create({
                data: {
                    username: dto.username,
                    password: dto.password,
                },
            });
            return this.signToken(newUser.id, newUser.username);
        }
        catch (error) {
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new common_1.ForbiddenException("Username already exists");
                }
            }
            throw error;
        }
    }
    loginForm(res) {
        return res.sendFile((0, path_1.join)(process.cwd(), 'public', 'login.html'));
    }
    async signIn(dto) {
        const user = await this.prisma.user.findUnique({
            where: { username: dto.username }
        });
        if (!user)
            throw new common_1.ForbiddenException("Credentials incorrect");
        const pwMatches = await argon.verify(user.password, dto.password);
        if (!pwMatches)
            throw new common_1.ForbiddenException("Credentials incorrect");
        return this.signToken(user.id, user.username);
    }
    async signToken(userId, username) {
        const payload = {
            sub: userId,
            username
        };
        const secret = this.config.get("JWT_SECRET");
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '60m',
            secret
        });
        return { access_token: token };
    }
    async logout(res) {
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
        });
    }
    async getToken() {
        const token = await this.prisma.token.findFirst({
            where: {
                email: this.clientEmail,
                expiration: {
                    gt: new Date(),
                },
            },
        });
        if (token) {
            return token.accessToken;
        }
        else {
            return this.getSnoonuAccessToken();
        }
    }
    async getSnoonuAccessToken() {
        try {
            const payload = {
                "email": this.clientEmail,
                "password": this.clientPassword
            };
            const response = await fetch(`${this.snoonuApiUrl}/api/v1/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                throw new Error(`Failed to get access token: ${response.statusText}`);
            }
            const data = await response.json();
            console.log('Received access token response:', data);
            await this.prisma.token.upsert({
                where: { email: this.clientEmail },
                update: { accessToken: data.accessToken, expiration: data.expiration },
                create: { email: this.clientEmail, accessToken: data.accessToken, expiration: data.expiration }
            });
            return data.accessToken;
        }
        catch (error) {
            console.log(`Error occurred while fetching access token: \n ${error}`);
            throw new Error(`Failed to get access token: ${error}`);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, config_1.ConfigService, jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map