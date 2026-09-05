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
    MaxLength,
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
}
