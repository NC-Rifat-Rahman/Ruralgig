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

        if (dto.deadline && new Date(dto.deadline) < new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)) {
            throw new BadRequestException("Deadline must be at least 24 hours from now.");
        }

        // title, budget,skill,deadline
        let saveTask;

        if (!dto.requiredSkills || dto.requiredSkills.length === 0) {
            throw new BadRequestException("A task requires at least one skill.");
        }

        if (dto.isRemote) {
            if (!dto.latitude || !dto.longitude) {
                throw new BadRequestException("Latitude and Longitude are required.");
            }
        }

        if (dto.budgetAmount < 100 || dto.budgetAmount > 1000000) {
            throw new BadRequestException("Budget amount must be between 100 and 1,000,000.");
        }

        /* TODO: 
        
        [TASK-006] SHOULD — When a Business submits a task description, the system shall send the rough description to the AI service 
        and return an enhanced version with structured title, description, deliverables, and suggested skills for the Business to review 
        and accept or edit before publishing.

        [TASK-007] SHOULD — Before a task is published (status transitions from DRAFT to OPEN), the system shall request an AI quality score. 
        Tasks with an overall quality score below 5/10 or a scam risk score above 7/10 shall be held in a PENDING_REVIEW status and flagged for 
        admin review rather than published immediately.

        [TASK-008] MUST — The system shall publish a TaskCreatedEvent domain event to RabbitMQ when a task transitions from DRAFT to OPEN, 
        containing: taskId, businessId, title, requiredSkills, budget, isRemote, location, deadline, and businessName.
        */
        await this.taskRepository.save(saveTask);
        return saveTask;
    }
}