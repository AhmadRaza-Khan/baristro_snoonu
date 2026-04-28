import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto';
import type { Response } from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signUp(dto: SignUpDto, res: Response): Promise<Response<any, Record<string, any>>>;
    signIn(dto: SignInDto, res: Response): Promise<Response<any, Record<string, any>>>;
    signInPage(res: Response): any;
    logout(res: Response): Promise<Response<any, Record<string, any>>>;
    getToken(): Promise<any>;
}
