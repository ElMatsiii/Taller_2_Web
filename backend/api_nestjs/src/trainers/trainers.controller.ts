

import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseUUIDPipe, 
} from '@nestjs/common';
import { TrainersService } from './trainers.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';

@Controller('trainers') 
export class TrainersController {

    constructor(private readonly trainersService: TrainersService) {}


    @Post()
    create(@Body() createTrainerDto: CreateTrainerDto) {
    
        return this.trainersService.create(createTrainerDto);
    }


    @Get()
    findAll() {
        return this.trainersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
     
        return this.trainersService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateTrainerDto: UpdateTrainerDto,
    ) {
        return this.trainersService.update(id, updateTrainerDto);
    }


    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.trainersService.remove(id);
    }
}