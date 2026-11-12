import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClaimTaskCommand } from "../impl/claim-task.command";
import { TaskEntity } from "../entity/task.entity";
import { RedisLockService } from "src/redis/redis-lock.service";

@CommandHandler(ClaimTaskCommand)
export class ClaimTaskHandler implements ICommandHandler<ClaimTaskCommand, TaskEntity> {
    constructor(
        private readonly lockService: RedisLockService
    ) { }
    execute(command: ClaimTaskCommand): Promise<void> {
        const { taskId, workerId } = command;

        // fetch active claims

        const lockKey = `lock:task-claim:${taskId}`;

        const result = this.lockService.acquire(lockKey, 5000);

        throw new Error("Method not implemented.");
    }
    // private readonly lockTtlMs: number;
}