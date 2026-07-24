import { IsISO8601, IsOptional } from 'class-validator';

export class UntilDto {
    @IsOptional()
    @IsISO8601()
    until?: string;
}
