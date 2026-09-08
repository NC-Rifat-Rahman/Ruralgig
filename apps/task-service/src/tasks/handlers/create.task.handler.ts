import { CommandHandler } from "@nestjs/cqrs";
import { TaskService } from "../task.service";
import { CreateTaskCommand } from "../impl/create-task.command";

@CommandHandler(CreateTaskCommand)
export class CreateTaskHandler {
    constructor(private readonly taskService: TaskService) { }

    async execute(command: CreateTaskCommand) {
        const { businessId, dto } = command;
    }
}