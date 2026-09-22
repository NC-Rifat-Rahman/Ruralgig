import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('tasks')
export class TaskEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    businessId?: number; // make it mandatory in the future when we have business management

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'simple-array' })
    requiredSkills: string[];

    @Column({ type: 'simple-array' })
    deliverables: string[] | null;

    @Column('double precision')
    latitude: number;

    @Column('double precision')
    longitude: number;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}