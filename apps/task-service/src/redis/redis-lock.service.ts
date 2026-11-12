import { Inject, Injectable } from "@nestjs/common";
import { REDIS_CLIENT } from "./redis.constants";
import Redis from "ioredis";
import { randomUUID } from "crypto";

@Injectable()
export class RedisLockService {
    constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) { }

    async acquire(key: string, ttlMs: number): Promise<{ key: string, token: string } | null> {
        const token = randomUUID();
        const result = await this.redis.set(key, token, 'PX', ttlMs, 'NX');

        if (result !== 'OK') {
            return null;
        }
        return { key, token };
    }
}