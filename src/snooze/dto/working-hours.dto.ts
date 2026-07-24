import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsString, Matches, Max, Min, ValidateNested } from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class WorkingHoursRangeDto {
    @IsString()
    @Matches(TIME_PATTERN, { message: 'startTime must be in HH:mm format' })
    startTime: string;

    @IsString()
    @Matches(TIME_PATTERN, { message: 'endTime must be in HH:mm format' })
    endTime: string;
}

export class WorkingHoursDayDto {
    @IsInt()
    @Min(0)
    @Max(6)
    dayOfWeek: number;

    @IsBoolean()
    isOpen: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WorkingHoursRangeDto)
    ranges: WorkingHoursRangeDto[];
}
