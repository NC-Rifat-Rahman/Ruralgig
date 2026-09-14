import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsIn,
    IsInt,
    IsISO8601,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    Max,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';

export class CreateTaskDto {
    @IsString()
    @MinLength(10)
    @MaxLength(200)
    title: string;

    @IsString()
    @MinLength(20)
    description: string;

    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(5)
    @IsString({ each: true })
    requiredSkills: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    deliverables?: string[];

    @IsInt()
    @IsPositive()
    estimatedHours: number;

    @IsNumber()
    @IsPositive()
    budgetAmount: number;

    @IsOptional()
    @IsIn(['BDT', 'USD'])
    currency?: string;

    @IsISO8601()
    deadline: string;

    @IsNumber()
    @Min(-90, { message: 'Latitude must be between -90 and 90' })
    @Max(90, { message: 'Latitude must be between -90 and 90' })
    latitude: number;

    @IsNumber()
    @Min(-180, { message: 'Longitude must be between -180 and 180' })
    @Max(180, { message: 'Longitude must be between -180 and 180' })
    longitude: number;
}
