import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class HandlerService {
    private readonly snoonuApiUrl: string;
    constructor(private config: ConfigService, private authService: AuthService) {
        this.snoonuApiUrl = this.config.get<string>('SNOONU_API_URL');
    }
    async apiHandler(endpoint: any, method: any, payload: any): Promise<any> {
        try {
            const response = await fetch(`${this.snoonuApiUrl}/${endpoint}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authService.getToken()}`
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch data from Snoonu API: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    }
}
