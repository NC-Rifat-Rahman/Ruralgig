import { UserEntity } from "src/users/entities/users.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity('refresh_tokens')
export class RefreshTokenEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    tokenHash: string; // bcrypt hash

    @Column()
    expiresAt: Date;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    user: UserEntity;
}