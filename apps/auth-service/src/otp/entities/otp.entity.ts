import { UserEntity } from 'src/users/entities/users.entity';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OtpType } from '../enums/otp-enum';

@Entity('otps')
export class OtpEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: UserEntity;

    @Column()
    userId: number;

    @Column()
    token: string;

    @Column({ type: 'enum', enum: OtpType })
    type: OtpType;

    @Column()
    expiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}