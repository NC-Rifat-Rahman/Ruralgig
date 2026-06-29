import { UserEntity } from 'src/users/entities/users.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('refresh_tokens')
export class RefreshTokenEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    tokenHash: string;

    @Column()
    expiresAt: Date;

    @Column()
    userId: number;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: UserEntity;
}