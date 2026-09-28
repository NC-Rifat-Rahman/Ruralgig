import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ClaimTaskCommand } from "../impl/claim-task.command";
import { TaskEntity } from "../entity/task.entity";

@CommandHandler(ClaimTaskCommand)
export class ClaimTaskHandler implements ICommandHandler<ClaimTaskCommand, TaskEntity> {

    execute(command: ClaimTaskCommand): Promise<void> {
        const { taskId, workerId } = command;

        // fetch active claims

        const lockKey = `lock:task-claim:${taskId}`;

        throw new Error("Method not implemented.");
    }
    // private readonly lockTtlMs: number;
}