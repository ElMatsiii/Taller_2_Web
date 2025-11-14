// api_nestjs/src/trainers/dto/create-trainer.dto.ts

import { IsString, IsNotEmpty, MinLength, IsArray, IsOptional } from 'class-validator';

export class CreateTrainerDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    name: string;

    @IsArray()
    @IsString({ each: true }) // Valida que cada elemento del array sea un string
    @IsOptional() // El equipo es opcional al crear
    team?: string[];
}
