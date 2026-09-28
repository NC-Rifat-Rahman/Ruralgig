import { Command } from "@nestjs/cqrs";

export class ClaimTaskCommand extends Command<void> {
    constructor(
        public readonly taskId: number,
        public readonly workerId: number
    ) {
        super();
    }
}