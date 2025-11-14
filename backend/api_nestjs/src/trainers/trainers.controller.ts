// api_nestjs/src/trainers/trainers.controller.ts

import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseUUIDPipe, // Lo usaremos para validar que el ID sea un UUID
} from '@nestjs/common';
import { TrainersService } from './trainers.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';

@Controller('trainers') // <-- Define la ruta base: /trainers
export class TrainersController {
    // 1. Inyectamos el Servicio
    constructor(private readonly trainersService: TrainersService) {}

    // 2. Endpoint POST /trainers
    //    (Crea un nuevo entrenador)
    @Post()
    create(@Body() createTrainerDto: CreateTrainerDto) {
        // @Body() usa nuestros DTOs para validar automáticamente la entrada
        return this.trainersService.create(createTrainerDto);
    }

    // 3. Endpoint GET /trainers
    //    (Obtiene todos los entrenadores)
    @Get()
    findAll() {
        return this.trainersService.findAll();
    }

    // 4. Endpoint GET /trainers/:id
    //    (Obtiene un entrenador por su ID)
    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        // @Param('id') extrae el 'id' de la URL
        // ParseUUIDPipe valida que el 'id' sea un UUID válido antes de continuar
        return this.trainersService.findOne(id);
    }

    // 5. Endpoint PATCH /trainers/:id
    //    (Actualiza un entrenador por su ID)
    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateTrainerDto: UpdateTrainerDto,
    ) {
        return this.trainersService.update(id, updateTrainerDto);
    }

    // 6. Endpoint DELETE /trainers/:id
    //    (Elimina un entrenador por su ID)
    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.trainersService.remove(id);
    }
}