

import { IsString, IsNotEmpty, MinLength, IsArray, IsOptional } from 'class-validator';

export class CreateTrainerDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    name: string;

    @IsArray()
    @IsString({ each: true }) 
    @IsOptional() 
    team?: string[];
}
