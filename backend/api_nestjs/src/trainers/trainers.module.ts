// api_nestjs/src/trainers/trainers.module.ts (CORRECTO)
import { Module } from '@nestjs/common';
import { TrainersService } from './trainers.service';
import { TrainersController } from './trainers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';     // <--- 1. Importar
import { Trainer } from './entities/trainer.entity'; // <--- 2. Importar

@Module({
    imports: [
        TypeOrmModule.forFeature([Trainer]), // <--- 3. Añadir esta línea
    ],
    controllers: [TrainersController],
    providers: [TrainersService],
})
export class TrainersModule {}