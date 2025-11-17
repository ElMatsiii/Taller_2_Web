import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trainer } from './entities/trainer.entity';

@Injectable()
export class TrainersService {
   
    constructor(
        @InjectRepository(Trainer) 
        private readonly trainerRepository: Repository<Trainer>,
    ) {}

    async create(createTrainerDto: CreateTrainerDto): Promise<Trainer> {
    
        const newTrainer = this.trainerRepository.create(createTrainerDto);
       
        return this.trainerRepository.save(newTrainer);
    }

    async findAll(): Promise<Trainer[]> {
        return this.trainerRepository.find();
    }

    async findOne(id: string): Promise<Trainer> {
        const trainer = await this.trainerRepository.findOneBy({ id });

        if (!trainer) {
            throw new NotFoundException(`Trainer with ID '${id}' not found`);
        }
        return trainer;
    }

    async update(
        id: string,
        updateTrainerDto: UpdateTrainerDto,
    ): Promise<Trainer> {

        const trainer = await this.trainerRepository.preload({
            id: id,
            ...updateTrainerDto,
        });

        if (!trainer) {
            throw new NotFoundException(`Trainer with ID '${id}' not found`);
        }

        return this.trainerRepository.save(trainer);
    }

    async remove(id: string): Promise<{ message: string }> {

        const trainer = await this.findOne(id);

  
        await this.trainerRepository.remove(trainer);

        return { message: `Trainer with ID '${id}' successfully removed` };
    }
}