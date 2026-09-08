import { Body, Controller, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { TaskService } from "./task.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { CreateTaskCommand } from "./impl/create-task.command";

@Controller('tasks')
export class TaskController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly taskService: TaskService
    ) { }

    @Post('create')
    async createTask(user: any, @Body() dto: CreateTaskDto) {
        return this.commandBus.execute(new CreateTaskCommand(user.id, dto));
    }
}

