import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trainer } from './entities/trainer.entity';

@Injectable()
export class TrainersService {
    // 1. Inyectamos el Repositorio
    constructor(
        @InjectRepository(Trainer) // Le decimos a NestJS que inyecte el repo de la entidad Trainer
        private readonly trainerRepository: Repository<Trainer>,
    ) {}

    // --- Lógica del CRUD ---

    async create(createTrainerDto: CreateTrainerDto): Promise<Trainer> {
        // Creamos una nueva instancia de la entidad
        const newTrainer = this.trainerRepository.create(createTrainerDto);
        // Guardamos la nueva entidad en la base de datos
        return this.trainerRepository.save(newTrainer);
    }

    async findAll(): Promise<Trainer[]> {
        // Busca y devuelve todos los entrenadores
        return this.trainerRepository.find();
    }

    async findOne(id: string): Promise<Trainer> {
        // Busca un entrenador por su ID (que es un UUID)
        const trainer = await this.trainerRepository.findOneBy({ id });

        // Si no lo encuentra, lanza un error 404
        if (!trainer) {
            throw new NotFoundException(`Trainer with ID '${id}' not found`);
        }
        return trainer;
    }

    async update(
        id: string,
        updateTrainerDto: UpdateTrainerDto,
    ): Promise<Trainer> {
        // 1. Carga el entrenador existente
        // (preload junta el DTO con la entidad encontrada y la prepara para guardar)
        const trainer = await this.trainerRepository.preload({
            id: id,
            ...updateTrainerDto,
        });

        if (!trainer) {
            throw new NotFoundException(`Trainer with ID '${id}' not found`);
        }

        // 2. Guarda los cambios en la base de datos
        return this.trainerRepository.save(trainer);
    }

    async remove(id: string): Promise<{ message: string }> {
        // Buscamos el entrenador para asegurarnos de que exista
        const trainer = await this.findOne(id);

        // Si existe, lo eliminamos
        await this.trainerRepository.remove(trainer);

        return { message: `Trainer with ID '${id}' successfully removed` };
    }
}