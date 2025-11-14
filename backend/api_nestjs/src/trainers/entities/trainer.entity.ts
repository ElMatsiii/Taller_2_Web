// api_nestjs/src/trainers/entities/trainer.entity.ts

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('trainers') // <-- Esto le dice a TypeORM que cree una tabla llamada 'trainers'
export class Trainer {
    @PrimaryGeneratedColumn('uuid') // <-- Genera un ID único (ej: 'a1b2-c3d4...')
    id: string;

    @Column({ type: 'varchar', length: 100, unique: true }) // <-- Columna de texto
    name: string;

    @Column({ type: 'simple-json', nullable: true }) // <-- Columna especial
    team: string[]; // <-- Almacenará un array de strings (ej: ['pikachu', 'charizard'])
}
