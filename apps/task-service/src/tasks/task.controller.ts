import { Body, Controller, Param, Post } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { CreateTaskDto } from "./dto/create-task.dto";
import { CreateTaskCommand } from "./impl/create-task.command";
import { TaskEntity } from "./entity/task.entity";

@Controller('tasks')
export class TaskController {
    constructor(
        private readonly commandBus: CommandBus,
    ) { }

    @Post('create')
    async createTask(user: any, @Body() dto: CreateTaskDto) {
        return this.commandBus.execute(new CreateTaskCommand(/*user.id,*/ dto));
    }

    @Post(':id/claim')
    async claim(@Param('id') id: number, /*@CurrentUser() user: AuthenticatedUser*/): Promise<TaskEntity> {
        return this.commandBus.execute(new ClaimTaskCommand(/*user.id,*/ { id }));
    }
}