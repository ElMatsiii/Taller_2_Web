// api_nestjs/src/trainers/dto/update-trainer.dto.ts

import { PartialType } from '@nestjs/mapped-types';
import { CreateTrainerDto } from './create-trainer.dto';

// UpdateTrainerDto hereda TODAS las reglas de CreateTrainerDto,
// pero las convierte automáticamente en Opcionales.
export class UpdateTrainerDto extends PartialType(CreateTrainerDto) {}
