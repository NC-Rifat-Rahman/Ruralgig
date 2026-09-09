import { Body, Controller, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { CreateTaskDto } from "./dto/create-task.dto";
import { CreateTaskCommand } from "./impl/create-task.command";

@Controller('tasks')
export class TaskController {
    constructor(
        private readonly commandBus: CommandBus,
    ) { }

    @Post('create')
    async createTask(user: any, @Body() dto: CreateTaskDto) {
        return this.commandBus.execute(new CreateTaskCommand(user.id, dto));
    }
}