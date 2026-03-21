import { SignInDto, SignUpDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private prisma;
    private config;
    private jwt;
    constructor(prisma: PrismaService, config: ConfigService, jwt: JwtService);
    signUp(dto: SignUpDto): Promise<{
        access_token: string;
    }>;
    loginForm(res: any): any;
    signIn(dto: SignInDto): Promise<{
        access_token: string;
    }>;
    signToken(userId: number, username: string): Promise<{
        access_token: string;
    }>;
    logout(res: any): Promise<void>;
}
