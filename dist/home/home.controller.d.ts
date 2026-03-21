import { HomeService } from './home.service';
import type { Response } from 'express';
export declare class HomeController {
    private service;
    constructor(service: HomeService);
    home(res: Response): any;
}
