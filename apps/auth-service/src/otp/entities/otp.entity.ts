import { UserEntity } from "src/users/entities/users.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { OtpType } from "../type/otp-type";


@Entity()
export class OtpEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity, { nullable: false })
    @JoinColumn()
    user: UserEntity;

    @Column()
    token: string;

    @Column({ type: "enum", enum: OtpType })
    type: OtpType

    @Column()
    expiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}