import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import * as crypto from 'crypto';
import { RefreshTokenEntity } from './entities/refresh-token.entity';

@Injectable()
export class RefreshTokenRepository {
    constructor(
        @InjectRepository(RefreshTokenEntity)
        private readonly repo: Repository<RefreshTokenEntity>,
    ) { }

    hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    async create(userId: number, token: string, expiresAt: Date): Promise<RefreshTokenEntity> {
        const tokenHash = this.hashToken(token);
        const entity = this.repo.create({ userId, tokenHash, expiresAt });
        return this.repo.save(entity);
    }

    async findByTokenHash(tokenHash: string): Promise<RefreshTokenEntity | null> {
        return this.repo.findOne({
            where: { tokenHash },
            relations: { user: true },
        });
    }

    async deleteById(id: number): Promise<void> {
        await this.repo.delete(id);
    }

    async deleteByUserId(userId: number): Promise<void> {
        await this.repo.delete({ userId });
    }

    async deleteExpired(): Promise<void> {
        await this.repo.delete({ expiresAt: LessThan(new Date()) });
    }
}