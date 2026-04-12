import { Injectable } from '@nestjs/common';
import { join } from 'path';

@Injectable()
export class SnoozeService {
    index(res) {
        return res.sendFile(join(process.cwd(), 'public', 'home.html'));
    }
}
