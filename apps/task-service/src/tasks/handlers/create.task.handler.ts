import { CommandHandler } from "@nestjs/cqrs";
import { CreateTaskCommand } from "../impl/create-task.command";
import { BadRequestException } from "@nestjs/common";
import { TaskRepository } from "../task.repository";

@CommandHandler(CreateTaskCommand)
export class CreateTaskHandler {
    constructor(private readonly taskRepository: TaskRepository) { }

    async execute(command: CreateTaskCommand) {
        const { businessId, dto } = command;

        const currentDate = new Date();

        if (dto.deadline && new Date(dto.deadline) < currentDate) {
            throw new BadRequestException("Deadline cannot be in the past.");
        }

        // title, budget,skill,deadline
        let saveTask;

        if (!dto.requiredSkills || dto.requiredSkills.length === 0) {
            throw new BadRequestException("A task requires at least one skill.");
        }

        await this.taskRepository.save(saveTask);
        return saveTask;
    }
}