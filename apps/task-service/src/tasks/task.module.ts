import { Module } from "@nestjs/common";
import { TaskRepository } from "./task.repository";
import { TaskService } from "./task.service";
import { TaskEntity } from "./entity/task.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TaskController } from "./task.controller";
import { CreateTaskHandler } from "./handlers/create.task.handler";
import { CqrsModule } from "@nestjs/cqrs";

const CommandHandlers = [
    CreateTaskHandler,
];

@Module({
    imports: [CqrsModule, TypeOrmModule.forFeature([TaskEntity])],
    providers: [TaskService, TaskRepository, ...CommandHandlers],
    controllers: [TaskController],
    exports: [TaskService]
})
export class TaskModule { }