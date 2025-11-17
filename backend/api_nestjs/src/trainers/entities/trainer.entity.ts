
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('trainers') 
export class Trainer {
    @PrimaryGeneratedColumn('uuid') 
    id: string;

    @Column({ type: 'varchar', length: 100, unique: true }) 
    name: string;

    @Column({ type: 'simple-json', nullable: true }) 
    team: string[]; 
}
