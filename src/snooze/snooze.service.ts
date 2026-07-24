import { BadRequestException, Injectable } from '@nestjs/common';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { HandlerService } from '../handler/handler.service';
import { WorkingHoursDayDto } from './dto/working-hours.dto';

export interface WorkingHoursRange {
    startTime: string;
    endTime: string;
}

export interface WorkingHoursDay {
    dayOfWeek: number;
    isOpen: boolean;
    ranges: WorkingHoursRange[];
}

@Injectable()
export class SnoozeService {
    private readonly channelId: string;

    constructor(private prisma: PrismaService, private readonly handler: HandlerService, private config: ConfigService) {
        this.channelId = this.config.get<string>('CHANNELL_ID')!;
    }

    index(res) {
        return res.sendFile(join(process.cwd(), 'public', 'home.html'));
    }

    hoursPage(res) {
        return res.sendFile(join(process.cwd(), 'public', 'hours.html'));
    }

    private isEffectivelyActive(flag: boolean, until: Date | null): boolean {
        if (!flag) return false;
        if (!until) return true;
        return until.getTime() > Date.now();
    }

    async getProducts(): Promise<any> {
        const products = await this.prisma.product.findMany({ where: { isSynced: true }, orderBy: { productId: 'asc' } });
        return products.map(p => ({
            ...p,
            isSnoozed: this.isEffectivelyActive(p.isSnoozed, p.snoozedUntil),
        }));
    }

    async toggleProductSnooze(productId: number, until?: string): Promise<any> {
        const product = await this.prisma.product.findUnique({ where: { productId } });
        if (!product) return { success: false, message: 'Product not found' };

        const currentlySnoozed = this.isEffectivelyActive(product.isSnoozed, product.snoozedUntil);
        const nextSnoozed = !currentlySnoozed;
        const snoozedUntil = nextSnoozed && until ? new Date(until) : null;

        const payload = {
            channelId: this.channelId,
            itemId: String(product.productId),
            operationType: nextSnoozed ? 0 : 1,
            snoozeUntil: snoozedUntil ? snoozedUntil.toISOString() : null,
        };

        await this.handler.apiHandler('/api/v1/menu/change-snooze-status', 'PUT', payload);

        const updated = await this.prisma.product.update({
            where: { productId },
            data: { isSnoozed: nextSnoozed, snoozedUntil },
        });
        return { success: true, isSnoozed: updated.isSnoozed, snoozedUntil: updated.snoozedUntil };
    }

    async getStoreStatus(): Promise<any> {
        const store = await this.prisma.store.findUnique({ where: { channelId: this.channelId } });
        return { isSnoozed: store?.isSnoozed ?? false };
    }

    async toggleStoreSnooze(): Promise<any> {
        const store = await this.prisma.store.upsert({
            where: { channelId: this.channelId },
            update: {},
            create: { channelId: this.channelId, isSnoozed: false },
        });

        const updated = await this.prisma.store.update({
            where: { channelId: this.channelId },
            data: { isSnoozed: !store.isSnoozed },
        });
        return { success: true, isSnoozed: updated.isSnoozed };
    }

    async getBusyStatus(): Promise<any> {
        const store = await this.prisma.store.findUnique({ where: { channelId: this.channelId } });
        return {
            isBusy: this.isEffectivelyActive(store?.isBusy ?? false, store?.busyUntil ?? null),
            busyUntil: store?.busyUntil ?? null,
        };
    }

    async toggleBusyStatus(until?: string): Promise<any> {
        const store = await this.prisma.store.upsert({
            where: { channelId: this.channelId },
            update: {},
            create: { channelId: this.channelId, isSnoozed: false, isBusy: false },
        });

        const currentlyBusy = this.isEffectivelyActive(store.isBusy, store.busyUntil);
        const nextBusy = !currentlyBusy;
        const busyUntil = nextBusy && until ? new Date(until) : null;

        const payload = {
            channelId: this.channelId,
            busyUntil: busyUntil ? busyUntil.toISOString() : null,
        };
        await this.handler.apiHandler('/api/v1/stores/busy-status', 'PATCH', payload);

        const updated = await this.prisma.store.update({
            where: { channelId: this.channelId },
            data: { isBusy: nextBusy, busyUntil },
        });
        return { success: true, isBusy: updated.isBusy, busyUntil: updated.busyUntil };
    }

    private normalizeWorkingHours(raw: unknown): WorkingHoursDay[] {
        const byDay = new Map<number, WorkingHoursDay>();

        if (Array.isArray(raw)) {
            for (const entry of raw as any[]) {
                const dayOfWeek = Number(entry?.dayOfWeek);
                if (Number.isInteger(dayOfWeek) && dayOfWeek >= 0 && dayOfWeek <= 6) {
                    byDay.set(dayOfWeek, {
                        dayOfWeek,
                        isOpen: !!entry.isOpen,
                        ranges: Array.isArray(entry.ranges)
                            ? entry.ranges
                                  .filter((r: any) => r && r.startTime && r.endTime)
                                  .map((r: any) => ({ startTime: String(r.startTime), endTime: String(r.endTime) }))
                            : [],
                    });
                }
            }
        }

        return Array.from({ length: 7 }, (_, dayOfWeek) => byDay.get(dayOfWeek) ?? { dayOfWeek, isOpen: false, ranges: [] });
    }

    async getWorkingHours(): Promise<WorkingHoursDay[]> {
        const store = await this.prisma.store.findUnique({ where: { channelId: this.channelId } });
        return this.normalizeWorkingHours(store?.workingHours);
    }

    async updateWorkingHoursDay(dayOfWeek: number, day: WorkingHoursDayDto): Promise<any> {
        if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
            throw new BadRequestException('dayOfWeek must be an integer between 0 and 6');
        }

        const current = await this.getWorkingHours();
        const next = current.map(d =>
            d.dayOfWeek === dayOfWeek
                ? { dayOfWeek, isOpen: day.isOpen, ranges: day.ranges.map(r => ({ startTime: r.startTime, endTime: r.endTime })) }
                : d,
        );

        await this.prisma.store.upsert({
            where: { channelId: this.channelId },
            update: { workingHours: next as any },
            create: { channelId: this.channelId, workingHours: next as any },
        });

        let synced = true;
        let warning: string | undefined;
        try {
            await this.syncWorkingHoursToSnoonu(next);
        } catch (error: any) {
            synced = false;
            warning = `Saved locally, but failed to sync to Snoonu: ${error.message}`;
            console.log(warning);
        }

        return { success: true, day: next.find(d => d.dayOfWeek === dayOfWeek), synced, ...(warning ? { warning } : {}) };
    }

    private async syncWorkingHoursToSnoonu(days: WorkingHoursDay[]): Promise<void> {
        const weekdayAvailabilities = days.flatMap(day => {
            if (day.isOpen && day.ranges.length) {
                return day.ranges.map(range => ({
                    day: day.dayOfWeek,
                    openingTime: range.startTime,
                    closingTime: range.endTime,
                    isClosed: false,
                }));
            }
            return [{ day: day.dayOfWeek, openingTime: '00:00', closingTime: '23:59', isClosed: true }];
        });

        const payload = {
            averagePreparationTime: 8271,
            takeawayPhoneNumber: '',
            weekdayAvailabilities,
            channelId: this.channelId,
        };

        await this.handler.apiHandler('/api/v1/stores', 'PUT', payload);
    }
}
